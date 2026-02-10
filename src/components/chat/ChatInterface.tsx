'use client'

import { useRef, useEffect, useState } from 'react'
import { useNothingMachineChat } from '@/lib/useChat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ContextBar } from './ContextBar'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Send, Loader2, Bot, User, Copy, Trash2, StopCircle } from 'lucide-react'

// UIMessage part types from AI SDK v6
interface UIMessagePart {
  type: 'text' | 'reasoning' | 'tool-invocation' | 'file' | string
  text?: string
}

interface UIMessage {
  id: string
  role: 'system' | 'user' | 'assistant'
  parts: UIMessagePart[]
}

function MessageBubble({
  message,
  isLoading,
}: {
  message: UIMessage
  isLoading?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  // Extract text content from message parts (AI SDK v6 structure)
  const getTextContent = (parts: UIMessagePart[]): string => {
    if (!Array.isArray(parts)) return ''
    return parts
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
      .join('')
  }

  const textContent = getTextContent(message.parts)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              return (
                <h3 key={j} className="font-semibold text-base mt-3 mb-1">
                  {line.slice(4)}
                </h3>
              )
            }
            if (line.startsWith('## ')) {
              return (
                <h2 key={j} className="font-semibold text-lg mt-4 mb-2">
                  {line.slice(3)}
                </h2>
              )
            }
            if (line.startsWith('# ')) {
              return (
                <h1 key={j} className="font-bold text-xl mt-4 mb-2">
                  {line.slice(2)}
                </h1>
              )
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={j} className="flex items-start gap-2 ml-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{formatInline(line.slice(2))}</span>
                </div>
              )
            }
            if (line.trim() === '') {
              return <br key={j} />
            }
            return (
              <p key={j} className="my-1">
                {formatInline(line)}
              </p>
            )
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
        return (
          <code key={i} className="bg-background/50 px-1 py-0.5 rounded text-sm">
            {part.slice(1, -1)}
          </code>
        )
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
          {renderContent(textContent)}
          {isLoading && isAssistant && !textContent && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {isLoading && isAssistant && textContent && (
            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
          )}
        </div>

        {isAssistant && !isLoading && textContent && (
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
  const { messages, sendMessage, isLoading, stop, setMessages } = useNothingMachineChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isAutoScrolling = useRef(false)
  const userScrolledUp = useRef(false)

  const { setNodeRef, isOver } = useDroppable({
    id: 'chat-dropzone',
  })

  // Detect when user scrolls up manually (ignore scroll events caused by our auto-scroll)
  const handleScroll = () => {
    if (isAutoScrolling.current) return
    const el = scrollContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    userScrolledUp.current = distanceFromBottom > 50
  }

  // Auto-scroll only when user hasn't scrolled up
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    if (!userScrolledUp.current) {
      isAutoScrolling.current = true
      el.scrollTop = el.scrollHeight
      // Reset flag after browser processes the scroll
      requestAnimationFrame(() => {
        isAutoScrolling.current = false
      })
    }
  }, [messages])

  const handleClearChat = () => {
    setMessages([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')

    await sendMessage({ text: message })
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Nothing Machine</h2>
              <p className="text-muted-foreground max-w-md mb-2">
                The answer to AGI is not more intelligence. It's love.
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Drag memory files from the left panel to inject context, configure the soul on the
                right, and start chatting.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLoading={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              className="min-h-[60px] max-h-[200px] resize-none flex-1"
            />
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <Button type="button" size="icon" variant="destructive" onClick={stop}>
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
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
