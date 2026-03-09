import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createXai } from '@ai-sdk/xai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, type LanguageModel } from 'ai'
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

function getModel(provider: string, modelId: string, apiKey: string): LanguageModel {
  switch (provider) {
    case 'anthropic': {
      const key = apiKey || process.env.ANTHROPIC_API_KEY
      if (!key) throw new Error('No API key for Anthropic. Set ANTHROPIC_API_KEY or provide one in model settings.')
      return createAnthropic({ apiKey: key })(modelId)
    }
    case 'openai': {
      const key = apiKey || process.env.OPENAI_API_KEY
      if (!key) throw new Error('No API key for OpenAI. Provide one in model settings.')
      return createOpenAI({ apiKey: key })(modelId)
    }
    case 'xai': {
      const key = apiKey || process.env.XAI_API_KEY
      if (!key) throw new Error('No API key for xAI. Provide one in model settings.')
      return createXai({ apiKey: key })(modelId)
    }
    case 'google': {
      const key = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!key) throw new Error('No API key for Google. Provide one in model settings.')
      return createGoogleGenerativeAI({ apiKey: key })(modelId)
    }
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages: UIMessage[] = body.messages || []
    const systemPrompt: string = body.systemPrompt || 'You are a helpful AI assistant running on the Nothing Machine.'
    const provider: string = body.provider || 'anthropic'
    const modelId: string = body.modelId || 'claude-opus-4-6-20260301'
    const apiKey: string = body.apiKey || ''

    let model: LanguageModel
    try {
      model = getModel(provider, modelId, apiKey)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to initialize model'
      const msg = JSON.stringify(`Error: ${message}`)
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

    const result = streamText({
      model,
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
