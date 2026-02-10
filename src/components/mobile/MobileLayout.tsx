'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Menu, X, Search, MessageSquare, FolderOpen, Fingerprint, ChevronRight, Plus, Mic, Send, ArrowLeft, ChevronDown, Pencil, Check, StopCircle, Bot, User, Loader2, Copy, Star, AlertTriangle } from 'lucide-react'
import { useEditorStore } from '@/lib/editor-store'
import { IDENTITY_FIELDS, TABS, FieldDefinition } from '@/lib/identity-fields'
import { useStore } from '@/lib/store'
import { useNothingMachineChat } from '@/lib/useChat'
import { useConversationStore } from '@/lib/conversation-store'
import { useProfileStore } from '@/lib/profile-store'

const AI_MODELS = [
  { id: 'opus-4.5', name: 'Opus 4.5', provider: 'Anthropic' },
  { id: 'opus-4.6', name: 'Opus 4.6', provider: 'Anthropic' },
  { id: 'sonnet-4.0', name: 'Sonnet 4.0', provider: 'Anthropic' },
  { id: 'grok-4.20', name: 'Grok 4.20', provider: 'xAI' },
  { id: 'gpt-5.2', name: 'GPT 5.2', provider: 'OpenAI' },
  { id: 'gpt-5.0', name: 'GPT 5.0', provider: 'OpenAI' },
  { id: 'gemini-3.0', name: 'Gemini 3.0', provider: 'Google' },
]

export function MobileLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState<'chat' | 'memory' | 'identity'>('chat')
  const [chatInput, setChatInput] = useState('')
  const [mobileEditingField, setMobileEditingField] = useState<FieldDefinition | null>(null)
  const [mobileEditingValue, setMobileEditingValue] = useState('')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [contextPanelOpen, setContextPanelOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0])
  const [machineName, setMachineName] = useState('Machine')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInputValue, setNameInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const { files, injectedFileIds, injectFile, removeInjectedFile } = useStore()
  const { activeTab, setActiveTab, fieldValues, hasValue, setFieldValue } = useEditorStore()
  const { messages, sendMessage, isLoading, stop, setMessages, status } = useNothingMachineChat()
  const { activeConversationId, setActiveConversationId, createConversation, saveMessages, loadConversation, fetchConversations, conversations } = useConversationStore()
  const { profile } = useProfileStore()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tabFields = IDENTITY_FIELDS.filter((f) => f.tab === activeTab)
  const currentTab = TABS.find((t) => t.id === activeTab)
  const injectedFiles = files.filter((f) => injectedFileIds.includes(f.id))

  const handleNavigation = (view: 'chat' | 'memory' | 'identity') => {
    setActiveView(view)
    setSidebarOpen(false)
  }

  const openMobileEditor = (field: FieldDefinition) => {
    setMobileEditingField(field)
    setMobileEditingValue(fieldValues[field.id] || '')
  }

  const closeMobileEditor = () => {
    setMobileEditingField(null)
    setMobileEditingValue('')
  }

  const saveMobileEditor = () => {
    if (mobileEditingField) {
      setFieldValue(mobileEditingField.id, mobileEditingValue)
      closeMobileEditor()
    }
  }

  // Auto-save messages to Supabase (debounced)
  const debouncedSave = useCallback(
    (convId: string, msgs: typeof messages) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        const dbMessages = msgs.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant' | 'system',
          parts: m.parts || [],
        }))
        saveMessages(convId, dbMessages, profile?.name || null)
      }, 1500)
    },
    [saveMessages, profile?.name]
  )

  // Save when messages change and streaming stops
  useEffect(() => {
    if (!activeConversationId || messages.length === 0 || status === 'streaming') return
    debouncedSave(activeConversationId, messages)
  }, [messages, activeConversationId, status, debouncedSave])

  // Auto-load most recent conversation from last 24 hours on mount
  useEffect(() => {
    const autoLoad = async () => {
      await fetchConversations()
      const convs = useConversationStore.getState().conversations
      if (convs.length > 0 && messages.length === 0) {
        const latest = convs[0]
        const updatedAt = new Date(latest.updated_at).getTime()
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
        if (updatedAt > twentyFourHoursAgo) {
          const msgs = await loadConversation(latest.id)
          if (msgs) setMessages(msgs as typeof messages)
        }
      }
    }
    autoLoad()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll chat when messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // Auto-focus textarea when mobile editor opens
  useEffect(() => {
    if (mobileEditingField && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [mobileEditingField])

  // Auto-focus name input when editing
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isEditingName])

  const startEditingName = () => {
    setNameInputValue(machineName === 'Machine' ? '' : machineName)
    setIsEditingName(true)
  }

  const saveMachineName = () => {
    if (nameInputValue.trim()) {
      setMachineName(nameInputValue.trim())
    }
    setIsEditingName(false)
  }

  const selectModel = (model: typeof AI_MODELS[0]) => {
    setSelectedModel(model)
    setModelDropdownOpen(false)
  }

  return (
    <div className="md:hidden h-screen flex flex-col" style={{ background: '#000' }}>
      {/* Mobile Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        {/* Epic Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center border-0 overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
            boxShadow: '0 0 20px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
          <div className="flex flex-col gap-1.5">
            <div className="w-4 h-0.5 bg-white/80 rounded-full" />
            <div className="w-3 h-0.5 bg-white/60 rounded-full" />
            <div className="w-4 h-0.5 bg-white/80 rounded-full" />
          </div>
        </button>

        {/* Model Selector */}
        <button
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-0 transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <span className="text-white font-medium text-base">{machineName}</span>
          <span className="text-white/40 text-sm">{selectedModel.name}</span>
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Model Dropdown */}
      {modelDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setModelDropdownOpen(false)}
          />
          <div
            className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-64 rounded-xl overflow-hidden"
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="p-2">
              <p className="text-white/30 text-xs uppercase tracking-wide px-3 py-2">Select Model</p>
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => selectModel(model)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left border-0 transition-colors ${
                    selectedModel.id === model.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="text-white text-sm font-medium">{model.name}</div>
                    <div className="text-white/40 text-xs">{model.provider}</div>
                  </div>
                  {selectedModel.id === model.id && (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'chat' && (
          <div className="flex-1 flex flex-col">
            {/* Context Bar */}
            {injectedFiles.length > 0 && (
              <div className="px-3 py-2 border-b border-white/10">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setContextPanelOpen(true)}
                    className="flex items-center gap-1 text-white/40 text-xs flex-shrink-0 border-0 bg-transparent"
                  >
                    <span>Context:</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {injectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md flex-shrink-0"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <span className="text-white/70 text-xs truncate max-w-[120px]">{file.name}</span>
                      <button
                        onClick={() => removeInjectedFile(file.id)}
                        className="w-4 h-4 rounded-full flex items-center justify-center border-0 bg-transparent hover:bg-white/10"
                      >
                        <X className="w-3 h-3 text-white/50" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Area */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6">
                  <div className="w-12 h-12 rounded-full bg-white mb-5" />
                  <h2 className="text-white text-lg font-medium mb-2">{machineName === 'Machine' ? 'Nothing Machine' : machineName}</h2>
                  <p className="text-white/40 text-sm text-center max-w-[280px]">
                    {injectedFiles.length > 0
                      ? `${injectedFiles.length} file${injectedFiles.length > 1 ? 's' : ''} in context. Start chatting.`
                      : "Configure your machine's identity and start chatting."
                    }
                  </p>
                </div>
              ) : (
                <div className="px-4 py-4 space-y-4">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    const text = Array.isArray(msg.parts)
                      ? msg.parts.filter((p: { type: string; text?: string }) => p.type === 'text' && p.text).map((p: { type: string; text?: string }) => p.text).join('')
                      : ''
                    if (!text) return null
                    return (
                      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="max-w-[85%] rounded-2xl px-4 py-2.5"
                          style={{
                            background: isUser ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {!isUser && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <Bot className="w-3 h-3 text-white/40" />
                              <span className="text-white/40 text-[10px] font-medium">{machineName}</span>
                            </div>
                          )}
                          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap" style={{ fontWeight: 300 }}>
                            {text}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'memory' && (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <h2 className="text-white font-medium text-lg mb-4">Memory Files</h2>
            <p className="text-white/40 text-sm mb-4">Tap + to inject into chat context</p>
            {files.map((file) => {
              const isInjected = injectedFileIds.includes(file.id)
              return (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isInjected ? 'bg-green-500/10' : ''
                  }`}
                >
                  <FolderOpen className={`w-5 h-5 flex-shrink-0 ${isInjected ? 'text-green-400' : 'text-white/40'}`} />
                  <span className={`flex-1 text-sm truncate ${isInjected ? 'text-green-400' : 'text-white/80'}`}>
                    {file.name}
                  </span>
                  {isInjected ? (
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <button
                      onClick={() => injectFile(file.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center border-0 transition-all active:scale-90"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      <Plus className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeView === 'identity' && (
          <div className="flex-1 overflow-y-auto">
            {/* Tab Bar */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 py-2 rounded-md text-center transition-all border-0"
                    style={{
                      background: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        filter: activeTab === tab.id ? 'none' : 'grayscale(1)',
                        opacity: activeTab === tab.id ? 1 : 0.35,
                      }}
                    >
                      {tab.icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tab Header */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentTab?.icon}</span>
                <span className="text-white font-medium">{currentTab?.label}</span>
              </div>
              <p className="text-white/40 text-xs mt-1">{currentTab?.description}</p>
            </div>

            {/* Fields */}
            <div className="py-2">
              {tabFields.map((field) => {
                const value = fieldValues[field.id] || ''
                const configured = hasValue(field.id)

                return (
                  <button
                    key={field.id}
                    onClick={() => openMobileEditor(field)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors text-left border-0"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: configured ? '#4ade80' : 'rgba(255,255,255,0.12)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm">{field.label}</div>
                      <div className="text-white/30 text-xs truncate mt-0.5">
                        {value || 'empty'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* North Star & Bottleneck */}
      {activeView === 'chat' && (
        <div className="px-3 pt-2 pb-1 border-t border-white/10 flex gap-2">
          <MobileFocusField
            icon={<Star className="w-3 h-3" />}
            label="North Star"
            placeholder="#1 goal?"
            value={fieldValues['_focusNorthStar'] || ''}
            onChange={(val) => setFieldValue('_focusNorthStar', val)}
            color="#facc15"
          />
          <MobileFocusField
            icon={<AlertTriangle className="w-3 h-3" />}
            label="Bottleneck"
            placeholder="Blocking?"
            value={fieldValues['_focusBottleneck'] || ''}
            onChange={(val) => setFieldValue('_focusBottleneck', val)}
            color="#f97316"
          />
        </div>
      )}

      {/* Bottom Chat Input */}
      <div className="px-3 pt-2 border-t border-white/10" style={{ paddingBottom: 'max(12px, calc(env(safe-area-inset-bottom, 0px) + 12px))' }}>
        <div className="flex items-center gap-2">
          <button
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Plus className="w-5 h-5 text-white/60" />
          </button>
          <div
            className="flex-1 flex items-center rounded-full px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && !e.shiftKey && chatInput.trim()) {
                  e.preventDefault()
                  if (!activeConversationId) {
                    await createConversation(profile?.name || null)
                  }
                  sendMessage({ text: chatInput.trim() })
                  setChatInput('')
                }
              }}
              placeholder="Ask anything"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40"
              style={{ fontSize: 16 }}
            />
            {isLoading ? (
              <button onClick={stop} className="border-0 bg-transparent p-0 ml-2">
                <StopCircle className="w-5 h-5 text-red-400" />
              </button>
            ) : (
              <Mic className="w-5 h-5 text-white/40 ml-2" />
            )}
          </div>
          <button
            onClick={async () => {
              if (chatInput.trim() && !isLoading) {
                if (!activeConversationId) {
                  await createConversation(profile?.name || null)
                }
                sendMessage({ text: chatInput.trim() })
                setChatInput('')
              }
            }}
            disabled={!chatInput.trim() || isLoading}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-0 transition-all active:scale-90"
            style={{ background: chatInput.trim() ? '#fff' : 'rgba(255,255,255,0.08)' }}
          >
            <Send className="w-5 h-5" style={{ color: chatInput.trim() ? '#000' : 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 bottom-0 w-[280px] z-50 flex flex-col transition-transform duration-300"
        style={{
          background: '#0a0a0a',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Search */}
        <div className="p-3 pt-4">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Search className="w-5 h-5 text-white/40" />
            <span className="text-white/40 text-sm">Search</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Nav */}
          <button
            onClick={() => handleNavigation('chat')}
            className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors border-0 ${
              activeView === 'chat' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
            style={{ borderRadius: activeView === 'chat' ? 8 : 0, margin: activeView === 'chat' ? '0 8px' : 0, width: activeView === 'chat' ? 'calc(100% - 16px)' : '100%' }}
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-black" />
            </div>
            <span className="text-white font-medium">{machineName}</span>
          </button>

          <button
            onClick={() => handleNavigation('memory')}
            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-white/5 transition-colors border-0 bg-transparent"
          >
            <FolderOpen className="w-6 h-6 text-white/60 ml-1" />
            <span className="text-white/80">Memory Files</span>
          </button>

          <button
            onClick={() => handleNavigation('identity')}
            className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-white/5 transition-colors border-0 bg-transparent"
          >
            <Fingerprint className="w-6 h-6 text-white/60 ml-1" />
            <span className="text-white/80">Identity Config</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-white/10 my-3 mx-4" />

          {/* Recent Chats */}
          <div className="px-4">
            <p className="text-white/30 text-xs uppercase tracking-wide mb-2">Recent</p>
          </div>

          <button className="w-full flex items-center gap-4 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-0 bg-transparent">
            <MessageSquare className="w-5 h-5 text-white/40" />
            <span className="text-white/60 text-sm truncate">New conversation</span>
          </button>
        </div>

        {/* Name Your Machine - Bottom */}
        <div className="p-3 border-t border-white/10">
          {isEditingName ? (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <input
                ref={nameInputRef}
                type="text"
                value={nameInputValue}
                onChange={(e) => setNameInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveMachineName()}
                placeholder="Name your machine..."
                className="flex-1 bg-transparent border-0 outline-none text-white text-sm placeholder:text-white/30"
              />
              <button
                onClick={saveMachineName}
                className="w-8 h-8 rounded-lg flex items-center justify-center border-0"
                style={{ background: '#fff' }}
              >
                <Check className="w-4 h-4 text-black" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-white/70 text-sm font-medium">
                {machineName === 'Machine' ? 'Name your machine' : machineName}
              </span>
              <button
                onClick={startEditingName}
                className="w-7 h-7 rounded-md flex items-center justify-center border-0 transition-all active:scale-95 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Pencil className="w-3 h-3 text-white/40" />
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 p-2 border-0 bg-transparent"
        >
          <X className="w-5 h-5 text-white/40" />
        </button>
      </div>

      {/* Context Panel */}
      {contextPanelOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
          {/* Panel Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button
              onClick={() => setContextPanelOpen(false)}
              className="p-2 -ml-2 border-0 bg-transparent"
            >
              <ArrowLeft className="w-6 h-6 text-white/70" />
            </button>
            <span className="text-white font-medium text-base">Context Files</span>
            <div className="w-10" />
          </header>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-white/40 text-sm mb-4">
              {injectedFiles.length} file{injectedFiles.length !== 1 ? 's' : ''} in context
            </p>

            <div className="space-y-2">
              {injectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <FolderOpen className="w-5 h-5 text-white/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{file.name}</div>
                    <div className="text-white/30 text-xs truncate">{file.path}</div>
                  </div>
                  <button
                    onClick={() => removeInjectedFile(file.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border-0 transition-colors"
                    style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              ))}
            </div>

            {injectedFiles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/30 text-sm">No files in context</p>
              </div>
            )}
          </div>

          {/* Clear All Button */}
          {injectedFiles.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => {
                  injectedFiles.forEach((f) => removeInjectedFile(f.id))
                  setContextPanelOpen(false)
                }}
                className="w-full py-3 rounded-lg text-white/60 text-sm border-0 transition-colors"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                Clear All Context
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Editor Screen */}
      {mobileEditingField && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: '#000' }}
        >
          {/* Editor Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button
              onClick={closeMobileEditor}
              className="p-2 -ml-2 border-0 bg-transparent"
            >
              <ArrowLeft className="w-6 h-6 text-white/70" />
            </button>

            <div className="flex-1 text-center">
              <span className="text-white font-medium text-base">{mobileEditingField.label}</span>
            </div>

            <button
              onClick={saveMobileEditor}
              className="px-4 py-1.5 rounded-full text-sm font-medium border-0"
              style={{ background: '#fff', color: '#000' }}
            >
              Save
            </button>
          </header>

          {/* Editor Body */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Hint */}
            <p className="text-white/40 text-xs uppercase tracking-wide mb-3">
              {mobileEditingField.hint}
            </p>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={mobileEditingValue}
              onChange={(e) => setMobileEditingValue(e.target.value)}
              placeholder={mobileEditingField.placeholder}
              className="flex-1 w-full bg-transparent border border-white/10 rounded-lg p-4 text-white text-sm resize-none outline-none focus:border-white/30 transition-colors"
              style={{ minHeight: 200 }}
            />

            {/* Character count */}
            <div className="flex justify-between items-center mt-3">
              <span className="text-white/20 text-xs">
                {mobileEditingValue.length} characters
              </span>
              <button
                onClick={closeMobileEditor}
                className="text-white/40 text-xs border-0 bg-transparent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileFocusField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  color,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  color: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const save = () => {
    onChange(draft)
    setEditing(false)
  }

  return (
    <div
      onClick={() => {
        if (!editing) {
          setDraft(value)
          setEditing(true)
        }
      }}
      className="flex-1 rounded-lg px-2.5 py-1.5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${value ? color + '33' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color, opacity: value ? 1 : 0.4 }}>{icon}</span>
        <span style={{ fontSize: 9, fontWeight: 600, color, opacity: value ? 1 : 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); save() }
            if (e.key === 'Escape') { setDraft(value); setEditing(false) }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-white"
          style={{ fontSize: 16, fontWeight: 300, padding: 0 }}
        />
      ) : (
        <div style={{ fontSize: 11, fontWeight: 300, color: value ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)', lineHeight: 1.4, minHeight: 16 }}>
          {value || placeholder}
        </div>
      )}
    </div>
  )
}
