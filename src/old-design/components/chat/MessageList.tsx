'use client'

import { Message } from '@/lib/types'
import { cn } from '@/lib/utils'
import { User, Bot, Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
}

function MessageBubble({ message, isLast, isStreaming }: { message: Message; isLast: boolean; isStreaming: boolean }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    // Split by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        // Code block
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        if (match) {
          const [, lang, code] = match
          return (
            <pre key={i} className="bg-muted rounded-lg p-3 my-2 overflow-x-auto">
              {lang && <div className="text-xs text-muted-foreground mb-2">{lang}</div>}
              <code className="text-sm font-mono">{code.trim()}</code>
            </pre>
          )
        }
      }

      // Regular text - handle inline formatting
      return (
        <span key={i}>
          {part.split('\n').map((line, j) => {
            // Headers
            if (line.startsWith('### ')) {
              return <h3 key={j} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h3>
            }
            if (line.startsWith('## ')) {
              return <h2 key={j} className="font-semibold text-lg mt-4 mb-2">{line.slice(3)}</h2>
            }
            if (line.startsWith('# ')) {
              return <h1 key={j} className="font-bold text-xl mt-4 mb-2">{line.slice(2)}</h1>
            }

            // Bullet points
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={j} className="flex items-start gap-2 ml-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{formatInline(line.slice(2))}</span>
                </div>
              )
            }

            // Empty lines
            if (line.trim() === '') {
              return <br key={j} />
            }

            // Regular paragraph
            return <p key={j} className="my-1">{formatInline(line)}</p>
          })}
        </span>
      )
    })
  }

  // Handle inline formatting (bold, italic, code)
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
        return <code key={i} className="bg-muted px-1 py-0.5 rounded text-sm">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  return (
    <div
      className={cn(
        'group flex gap-3 py-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="text-sm">
          {renderContent(message.content)}
          {isLast && isStreaming && isAssistant && (
            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
          )}
        </div>

        {isAssistant && !isStreaming && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={handleCopy}
            >
              <Copy className="w-3 h-3" />
            </Button>
            {copied && <span className="text-xs text-muted-foreground">Copied!</span>}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2 opacity-60">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          isStreaming={isStreaming}
        />
      ))}
    </div>
  )
}
