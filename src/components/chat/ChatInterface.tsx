'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useConversationStore } from '@/lib/conversation-store'
import { useProfileStore } from '@/lib/profile-store'
import { useStore } from '@/lib/store'
import { useRichard } from '@/lib/useRichard'
import { onChat as onRichardChat, onActivity as onRichardActivity, connectToRichard } from '@/lib/richard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ContextBar } from './ContextBar'
import { RichardIdeaMode } from './RichardIdeaMode'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Send, Loader2, Bot, User, Copy, Trash2, Wifi, WifiOff } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage
  isStreaming?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    if (!content) return null

    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        if (match) {
          const [, lang, code] = match
          return (
            <pre key={i} className="bg-background/50 rounded-lg p-3 my-2 overflow-x-auto">
              {lang && <div className="text-xs text-muted-foreground mb-2">{lang}</div>}
              <code className="text-sm font-mono">{code.trim()}</code>
            </pre>
          )
        }
      }

      return (
        <span key={i}>
          {part.split('\n').map((line, j) => {
            if (line.startsWith('### ')) {
              return <h3 key={j} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h3>
            }
            if (line.startsWith('## ')) {
              return <h2 key={j} className="font-semibold text-lg mt-4 mb-2">{line.slice(3)}</h2>
            }
            if (line.startsWith('# ')) {
              return <h1 key={j} className="font-bold text-xl mt-4 mb-2">{line.slice(2)}</h1>
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={j} className="flex items-start gap-2 ml-2">
                  <span className="text-muted-foreground">&bull;</span>
                  <span>{formatInline(line.slice(2))}</span>
                </div>
              )
            }
            if (line.trim() === '') return <br key={j} />
            return <p key={j} className="my-1">{formatInline(line)}</p>
          })}
        </span>
      )
    })
  }

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-background/50 px-1 py-0.5 rounded text-sm">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  return (
    <div className={cn('group flex gap-3 py-4', isUser ? 'justify-end' : 'justify-start')}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <div className="text-sm">
          {renderContent(message.text)}
          {isStreaming && isAssistant && !message.text && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {isStreaming && isAssistant && message.text && (
            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
          )}
        </div>

        {isAssistant && !isStreaming && message.text && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleCopy}>
              <Copy className="w-3 h-3" />
            </Button>
            {copied && <span className="text-xs text-muted-foreground">Copied!</span>}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}

export function ChatInterface() {
  const { activeConversationId, setActiveConversationId, createConversation, saveMessages } =
    useConversationStore()
  const { profile } = useProfileStore()
  const { isConnected, send: chatSend, status: richardStatus, connect } = useRichard()
  const { files, injectedFileIds } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [activity, setActivity] = useState<string>('thinking')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isAutoScrolling = useRef(false)
  const userScrolledUp = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track the current assistant message being streamed
  const streamingMsgId = useRef<string | null>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: 'chat-dropzone',
  })

  // Auto-connect to Richard on mount
  useEffect(() => {
    connectToRichard()
  }, [])

  // Listen for Richard's chat responses and stream them into messages
  useEffect(() => {
    const unsubActivity = onRichardActivity((act) => {
      if (act !== 'done') {
        setActivity(act)
      }
    })

    const unsub = onRichardChat((text, done) => {
      if (done && text) {
        // Final event with full text — replace or create the message with complete text
        setIsWaiting(false)
        setMessages((prev) => {
          if (streamingMsgId.current) {
            // Replace the streaming message with the final complete text
            const updated = prev.map((m) =>
              m.id === streamingMsgId.current ? { ...m, text } : m
            )
            streamingMsgId.current = null
            setIsStreaming(false)
            return updated
          }
          // No streaming message yet — create the full message directly
          streamingMsgId.current = null
          setIsStreaming(false)
          return [
            ...prev,
            {
              id: `richard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              role: 'assistant' as const,
              text,
            },
          ]
        })
      } else if (text && !done) {
        // Streaming delta — append to current message
        setIsWaiting(false)
        setMessages((prev) => {
          if (streamingMsgId.current) {
            return prev.map((m) =>
              m.id === streamingMsgId.current
                ? { ...m, text: m.text + text }
                : m
            )
          }
          const id = `richard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          streamingMsgId.current = id
          setIsStreaming(true)
          return [...prev, { id, role: 'assistant' as const, text }]
        })
      } else if (done && !text) {
        // Done signal with no text
        streamingMsgId.current = null
        setIsStreaming(false)
        setIsWaiting(false)
      }
    })
    return () => {
      unsub()
      unsubActivity()
    }
  }, [])

  // Auto-save messages to Supabase (debounced)
  const debouncedSave = useCallback(
    (convId: string, msgs: ChatMessage[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        const dbMessages = msgs.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant' | 'system',
          parts: [{ type: 'text' as const, text: m.text }],
        }))
        saveMessages(convId, dbMessages, profile?.name || null)
      }, 1500)
    },
    [saveMessages, profile?.name]
  )

  // Save when messages change and not streaming
  useEffect(() => {
    if (!activeConversationId || messages.length === 0 || isStreaming) return
    debouncedSave(activeConversationId, messages)
  }, [messages, activeConversationId, isStreaming, debouncedSave])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  // Clear chat and start fresh
  const handleNewChat = useCallback(() => {
    setMessages([])
    setActiveConversationId(null)
  }, [setActiveConversationId])

  // Load a conversation's messages
  const handleLoadConversation = useCallback(
    async (id: string) => {
      const { loadConversation } = useConversationStore.getState()
      const msgs = await loadConversation(id)
      if (msgs) {
        const converted: ChatMessage[] = (msgs as Array<{ id: string; role: string; parts: Array<{ type: string; text?: string }> }>).map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          text: m.parts?.filter((p) => p.type === 'text' && p.text).map((p) => p.text).join('') || '',
        }))
        setMessages(converted)
      }
    },
    []
  )

  // Expose handlers for parent components
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__loadConversation = handleLoadConversation;
    (window as unknown as Record<string, unknown>).__newChat = handleNewChat
    return () => {
      delete (window as unknown as Record<string, unknown>).__loadConversation
      delete (window as unknown as Record<string, unknown>).__newChat
    }
  }, [handleLoadConversation, handleNewChat])

  // Detect when user scrolls up manually
  const handleScroll = () => {
    if (isAutoScrolling.current) return
    const el = scrollContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    userScrolledUp.current = distanceFromBottom > 50
  }

  // Auto-scroll
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    if (!userScrolledUp.current) {
      isAutoScrolling.current = true
      el.scrollTop = el.scrollHeight
      requestAnimationFrame(() => {
        isAutoScrolling.current = false
      })
    }
  }, [messages])

  const handleClearChat = () => {
    setMessages([])
    setActiveConversationId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming || isWaiting) return

    if (!isConnected) {
      connectToRichard()
      return
    }

    // Auto-create a conversation if none is active
    if (!activeConversationId) {
      await createConversation(profile?.name || null)
    }

    const message = input.trim()
    setInput('')

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'user',
        text: message,
      },
    ])

    // Gather injected context files
    const context = files
      .filter((f) => injectedFileIds.includes(f.id))
      .map((f) => ({ name: f.name, content: f.content }))

    // Send to Richard via Clawdbot with context
    chatSend(message, context.length > 0 ? context : undefined)
    setIsWaiting(true)
    setActivity('thinking')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-full flex flex-col bg-background relative overflow-hidden',
        isOver && 'ring-2 ring-purple-500 ring-inset'
      )}
    >
      {isOver && (
        <div className="absolute inset-0 bg-purple-500/10 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-background border border-purple-500 rounded-lg px-4 py-2 shadow-lg">
            <span className="text-sm font-medium">Drop to inject into context</span>
          </div>
        </div>
      )}

      <ContextBar />

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          {messages.length === 0 ? (
            <RichardIdeaMode
              isConnected={isConnected}
              richardStatus={richardStatus}
              onReconnect={connect}
            />
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}
              {isWaiting && !isStreaming && (
                <div className="flex gap-3 py-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Richard is {activity}...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-1.5 mb-2">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-[11px] text-green-400/80">Richard (Clawdbot)</span>
              </>
            ) : richardStatus === 'connecting' ? (
              <>
                <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                <span className="text-[11px] text-yellow-400/80">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-white/30" />
                <span className="text-[11px] text-white/30">Disconnected</span>
              </>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "Talk to Richard..." : "Waiting for Richard to connect..."}
              className="min-h-[60px] max-h-[200px] resize-none flex-1"
              disabled={!isConnected}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" size="icon" disabled={!input.trim() || !isConnected || isStreaming || isWaiting}>
                <Send className="h-4 w-4" />
              </Button>
              {messages.length > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleClearChat}
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
