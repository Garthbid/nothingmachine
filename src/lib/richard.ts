const GATEWAY_URL = 'wss://richard.tailb619d4.ts.net'
const GATEWAY_TOKEN = 'richard'

export type RichardMessage = {
  type: string
  content?: string
  [key: string]: unknown
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

type StatusListener = (status: ConnectionStatus) => void
type MessageListener = (data: RichardMessage) => void
type ChatListener = (text: string, done: boolean) => void
type ActivityListener = (activity: string) => void

let ws: WebSocket | null = null
let statusListeners: StatusListener[] = []
let messageListeners: MessageListener[] = []
let chatListeners: ChatListener[] = []
let activityListeners: ActivityListener[] = []
let currentStatus: ConnectionStatus = 'disconnected'
let intentionalDisconnect = false
let reqCounter = 10 // start at 10, 1 is reserved for connect
let receivedAgentDeltas = false
let simulateTimer: ReturnType<typeof setTimeout> | null = null

function nextId(): string {
  return String(++reqCounter)
}

function setStatus(status: ConnectionStatus) {
  currentStatus = status
  statusListeners.forEach((fn) => fn(status))
}

export function getStatus(): ConnectionStatus {
  return currentStatus
}

export function onStatus(fn: StatusListener): () => void {
  statusListeners.push(fn)
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn)
  }
}

export function onMessage(fn: MessageListener): () => void {
  messageListeners.push(fn)
  return () => {
    messageListeners = messageListeners.filter((l) => l !== fn)
  }
}

export function onChat(fn: ChatListener): () => void {
  chatListeners.push(fn)
  return () => {
    chatListeners = chatListeners.filter((l) => l !== fn)
  }
}

export function onActivity(fn: ActivityListener): () => void {
  activityListeners.push(fn)
  return () => {
    activityListeners = activityListeners.filter((l) => l !== fn)
  }
}

/** Reveal text progressively when Clawdbot doesn't stream deltas */
function simulateStream(fullText: string) {
  if (simulateTimer) {
    clearTimeout(simulateTimer)
    simulateTimer = null
  }

  const CHARS_PER_TICK = 12
  const TICK_MS = 18
  let pos = 0

  function emitNext() {
    if (pos >= fullText.length) {
      // Done — send empty done signal (the complete text is already built up)
      chatListeners.forEach((fn) => fn('', true))
      simulateTimer = null
      return
    }

    const chunk = fullText.slice(pos, pos + CHARS_PER_TICK)
    pos += CHARS_PER_TICK

    chatListeners.forEach((fn) => fn(chunk, false))
    simulateTimer = setTimeout(emitNext, TICK_MS)
  }

  emitNext()
}

export function connectToRichard() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws
  }

  intentionalDisconnect = false
  setStatus('connecting')
  ws = new WebSocket(GATEWAY_URL)

  ws.onopen = () => {
    console.log('WebSocket open, awaiting challenge...')
  }

  ws.onmessage = (event) => {
    try {
      const data: RichardMessage = JSON.parse(event.data)


      // Handle the connect.challenge handshake
      if (data.type === 'event' && data.event === 'connect.challenge') {
        if (ws) {
          ws.send(JSON.stringify({
            type: 'req',
            id: '1',
            method: 'connect',
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: 'webchat-ui',
                version: '1.0.0',
                platform: 'web',
                mode: 'node',
              },
              role: 'operator',
              scopes: ['operator.read', 'operator.write'],
              caps: [],
              commands: [],
              permissions: {},
              auth: { password: GATEWAY_TOKEN },
              locale: 'en-US',
              userAgent: 'nothingmachine/1.0.0',
            },
          }))
        }
        return
      }

      // Handle successful authentication (hello-ok response)
      if (data.type === 'res' && data.id === '1' && data.ok) {
        console.log('Connected to Richard!')
        setStatus('connected')
        return
      }

      // Handle auth failure
      if (data.type === 'res' && data.id === '1' && !data.ok) {
        console.error('Richard auth failed:', data)
        setStatus('error')
        return
      }

      // Handle agent events — streaming deltas and activity come through here
      if (data.type === 'event' && data.event === 'agent') {
        const payload = data.payload as Record<string, unknown> | undefined
        if (payload) {
          const stream = payload.stream as string | undefined
          const innerData = payload.data as Record<string, unknown> | undefined

          // Emit activity for any agent event so the UI shows Richard is working
          if (stream === 'lifecycle') {
            const phase = innerData?.phase as string | undefined
            if (phase === 'start') {
              activityListeners.forEach((fn) => fn('thinking'))
            } else if (phase === 'end') {
              activityListeners.forEach((fn) => fn('done'))
            }
          } else if (stream === 'tool_use' || stream === 'tool-use') {
            const toolName = (innerData?.name || innerData?.tool || 'a tool') as string
            activityListeners.forEach((fn) => fn(`using ${toolName}`))
          } else if (stream === 'tool_result' || stream === 'tool-result') {
            activityListeners.forEach((fn) => fn('processing results'))
          } else if (stream === 'assistant') {
            if (innerData?.delta) {
              const delta = innerData.delta as string
              receivedAgentDeltas = true
              chatListeners.forEach((fn) => fn(delta, false))
            } else {
              activityListeners.forEach((fn) => fn('writing'))
            }
          } else if (stream) {
            // Any other stream type = still working
            activityListeners.forEach((fn) => fn('working'))
          }
        }
        return
      }

      // Handle chat events — "final" carries the complete response text
      if (data.type === 'event' && data.event === 'chat') {
        const payload = data.payload as Record<string, unknown> | undefined

        if (payload?.state === 'final') {
          const msg = payload.message as Record<string, unknown> | undefined
          const content = msg?.content as Array<Record<string, unknown>> | undefined
          if (content) {
            const fullText = content
              .filter((c) => c.type === 'text' && c.text)
              .map((c) => c.text as string)
              .join('')

            if (receivedAgentDeltas) {
              // Real streaming happened — just finalize with complete text
              chatListeners.forEach((fn) => fn(fullText, true))
            } else {
              // No streaming deltas from Clawdbot — simulate token-by-token reveal
              simulateStream(fullText)
            }
          } else {
            chatListeners.forEach((fn) => fn('', true))
          }
        } else if (payload?.state === 'streaming') {
          // Some Clawdbot versions send streaming deltas via chat events
          const delta = payload.delta as string | undefined
          if (delta) {
            chatListeners.forEach((fn) => fn(delta, false))
          }
        } else if (payload?.state) {
          // Any other chat state (processing, pending, etc.) = Richard is working
          activityListeners.forEach((fn) => fn('working'))
        }
        return
      }

      // All other messages go to generic listeners
      messageListeners.forEach((fn) => fn(data))
    } catch {
      console.error('Failed to parse Richard message:', event.data)
    }
  }

  ws.onerror = () => {
    console.error('WebSocket error connecting to Richard')
    setStatus('error')
  }

  ws.onclose = () => {
    console.log('Disconnected from Richard')
    ws = null
    if (intentionalDisconnect) {
      setStatus('disconnected')
      return
    }
    // Manual reconnect only: do not auto-retry when Richard is offline.
    setStatus('disconnected')
  }

  return ws
}

export function disconnectFromRichard() {
  intentionalDisconnect = true
  if (ws) {
    ws.close()
    ws = null
  }
  setStatus('disconnected')
}

/** Build a message with injected context prepended */
function buildMessage(text: string, context?: { name: string; content: string }[]): string {
  if (!context || context.length === 0) return text

  const contextBlock = context
    .map((f) => `--- ${f.name} ---\n${f.content}`)
    .join('\n\n')

  return `[Injected Context from Nothing Machine]\n${contextBlock}\n\n---\n\n${text}`
}

/** Send a chat message to Richard via Clawdbot gateway */
export function chatSend(
  message: string,
  context?: { name: string; content: string }[]
): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false

  receivedAgentDeltas = false
  if (simulateTimer) {
    clearTimeout(simulateTimer)
    simulateTimer = null
  }

  ws.send(JSON.stringify({
    type: 'req',
    id: nextId(),
    method: 'chat.send',
    params: {
      sessionKey: 'agent:main:main',
      message: buildMessage(message, context),
      idempotencyKey: `nm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    },
  }))
  return true
}

/** Send a raw request to Clawdbot */
export function sendRequest(method: string, params: Record<string, unknown> = {}): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false

  ws.send(JSON.stringify({
    type: 'req',
    id: nextId(),
    method,
    params,
  }))
  return true
}
