import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

interface MessagePart {
  type: string
  text?: string
}

interface UIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: MessagePart[]
  content?: string
}

function getMessageContent(message: UIMessage): string {
  if (message.content && typeof message.content === 'string') {
    return message.content
  }
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
      .join('')
  }
  return ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: UIMessage[] = body.messages || []
    const systemPrompt: string = body.systemPrompt || 'You are a helpful AI assistant running on the Nothing Machine.'

    console.log('=== API REQUEST ===')
    console.log('body keys:', Object.keys(body))
    console.log('has systemPrompt:', 'systemPrompt' in body)
    console.log('systemPrompt type:', typeof body.systemPrompt)
    console.log('systemPrompt length:', systemPrompt.length)
    console.log('systemPrompt preview:', systemPrompt.substring(0, 200))

    if (!process.env.ANTHROPIC_API_KEY) {
      const demoMessage = "I'm running in demo mode — no Anthropic API key configured. Add ANTHROPIC_API_KEY to .env.local and restart."
      const escapedMessage = JSON.stringify(demoMessage)
      return new Response(
        'data: {"type":"text-delta","textDelta":' + escapedMessage + '}\ndata: [DONE]\n',
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        }
      )
    }

    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      system: systemPrompt,
      messages: messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: getMessageContent(m),
        })),
      maxOutputTokens: 4096,
    })

    return result.toUIMessageStreamResponse()
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const msg = JSON.stringify(`Error: ${errorMessage}`)
    return new Response(
      'data: {"type":"text-delta","textDelta":' + msg + '}\ndata: [DONE]\n',
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    )
  }
}
