'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useConversationStore } from '@/lib/conversation-store'
import { useProfileStore } from '@/lib/profile-store'
import { useStore } from '@/lib/store'
import { useNothingMachineChat } from '@/lib/useChat'
import { useModelStore, type ModelProvider } from '@/lib/model-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContextBar } from './ContextBar'
import { RichardIdeaMode } from './RichardIdeaMode'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import {
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  Trash2,
  ChevronDown,
  Plus,
  X,
} from 'lucide-react'

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

const PROVIDER_LABELS: Record<ModelProvider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  xai: 'xAI',
  google: 'Google',
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: UIMessage
  isStreaming?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const getTextContent = (parts: UIMessagePart[]): string => {
    if (!Array.isArray(parts)) return ''
    return parts
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
      .join('')
  }

  const textContent = getTextContent(message.parts)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent)
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
          {renderContent(textContent)}
          {isStreaming && isAssistant && !textContent && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {isStreaming && isAssistant && textContent && (
            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
          )}
        </div>

        {isAssistant && !isStreaming && textContent && (
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

function AddModelDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addModel } = useModelStore()
  const [provider, setProvider] = useState<ModelProvider>('openai')
  const [modelId, setModelId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [apiKey, setApiKey] = useState('')

  const handleSave = () => {
    if (!modelId.trim() || !displayName.trim()) return
    addModel({
      id: `${provider}-${modelId}-${Date.now()}`,
      name: displayName.trim(),
      provider,
      modelId: modelId.trim(),
      apiKey: apiKey.trim(),
    })
    setProvider('openai')
    setModelId('')
    setDisplayName('')
    setApiKey('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Model</DialogTitle>
          <DialogDescription>Add a new AI model with your API key.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Provider</Label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ModelProvider)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="xai">xAI</option>
              <option value="google">Google</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Model ID</Label>
            <Input
              placeholder="e.g. gpt-5.4, claude-opus-4-6-20260301"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Display Name</Label>
            <Input
              placeholder="e.g. GPT 5.4"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {provider === 'anthropic' && (
              <p className="text-xs text-muted-foreground">
                Leave blank to use the ANTHROPIC_API_KEY env var.
              </p>
            )}
          </div>
          <Button onClick={handleSave} disabled={!modelId.trim() || !displayName.trim()}>
            Add Model
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ModelSelector() {
  const { models, selectedModelId, setSelectedModelId, removeModel } = useModelStore()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const selectedModel = models.find((m) => m.id === selectedModelId) ?? models[0]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
            {selectedModel?.name ?? 'Select model'}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex flex-col">
                <span className={cn(model.id === selectedModelId && 'font-semibold')}>
                  {model.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {PROVIDER_LABELS[model.provider]} &middot; {model.modelId}
                </span>
              </div>
              {model.id !== 'opus-4-6' && model.id !== 'gpt-5-4' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeModel(model.id)
                  }}
                  className="text-muted-foreground hover:text-destructive p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddModelDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  )
}

export function ChatInterface() {
  const { activeConversationId, setActiveConversationId, createConversation, saveMessages } =
    useConversationStore()
  const { profile } = useProfileStore()
  const { messages, sendMessage, isLoading, stop, setMessages, status } = useNothingMachineChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isAutoScrolling = useRef(false)
  const userScrolledUp = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: 'chat-dropzone',
  })

  // Auto-save messages to Supabase (debounced)
  const debouncedSave = useCallback(
    (convId: string, msgs: typeof messages) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        const dbMessages = msgs.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant' | 'system',
          parts: (m.parts as Array<{ type: string; text?: string }>)?.map((p) => ({ type: p.type, text: p.text ?? '' })) ?? [{ type: 'text' as const, text: '' }],
        }))
        saveMessages(convId, dbMessages, profile?.name || null)
      }, 1500)
    },
    [saveMessages, profile?.name]
  )

  // Save when messages change and not streaming
  useEffect(() => {
    if (!activeConversationId || messages.length === 0 || isLoading) return
    debouncedSave(activeConversationId, messages)
  }, [messages, activeConversationId, isLoading, debouncedSave])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  // Clear chat and start fresh
  const handleNewChat = useCallback(() => {
    setMessages([])
    setActiveConversationId(null)
  }, [setMessages, setActiveConversationId])

  // Load a conversation's messages
  const handleLoadConversation = useCallback(
    async (id: string) => {
      const { loadConversation } = useConversationStore.getState()
      const msgs = await loadConversation(id)
      if (msgs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMessages(msgs as any)
      }
    },
    [setMessages]
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
    if (!input.trim() || isLoading) return

    // Auto-create a conversation if none is active
    if (!activeConversationId) {
      await createConversation(profile?.name || null)
    }

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
          <RichardIdeaMode
            isConnected={true}
            richardStatus="connected"
            onReconnect={() => {}}
            showConnectionControls={false}
          />
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <ModelSelector />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              className="min-h-[60px] max-h-[200px] resize-none flex-1"
            />
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <Button type="button" size="icon" variant="destructive" onClick={stop}>
                  <Loader2 className="h-4 w-4 animate-spin" />
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
