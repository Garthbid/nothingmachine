'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/lib/editor-store'
import { useStore } from '@/lib/store'
import { TABS } from '@/lib/identity-fields'
import { Send, X, Eye, ChevronDown, FileText } from 'lucide-react'

export function TerminalEditor() {
  const { editingField, editingValue, setEditingValue, closeEditor, saveAndClose } =
    useEditorStore()
  const { files, injectedFileIds, removeInjectedFile } = useStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [chatInput, setChatInput] = useState('')
  const [contextPanelOpen, setContextPanelOpen] = useState(false)

  const injectedFiles = files.filter((f) => injectedFileIds.includes(f.id))

  // Auto-focus textarea when editor opens
  useEffect(() => {
    if (editingField && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(
        editingValue.length,
        editingValue.length
      )
    }
  }, [editingField])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingField) return

      if (e.key === 'Escape') {
        closeEditor()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        saveAndClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingField, closeEditor, saveAndClose])

  const currentTab = editingField
    ? TABS.find((t) => t.id === editingField.tab)
    : null

  // Chat input component
  const ChatInput = () => (
    <div
      style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '12px 16px',
        }}
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message... (Shift+Enter for new line)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 300,
          }}
        />
        <button
          style={{
            background: chatInput.trim() ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none',
            borderRadius: 6,
            padding: 8,
            cursor: chatInput.trim() ? 'pointer' : 'default',
            opacity: chatInput.trim() ? 1 : 0.3,
            transition: 'all 0.15s ease',
          }}
        >
          <Send className="w-4 h-4" style={{ color: '#fff' }} />
        </button>
      </div>
    </div>
  )

  // Default state - no field selected
  if (!editingField) {
    return (
      <div
        className="flex-1 flex flex-col h-full"
        style={{
          background: '#0a0a0a',
        }}
      >
        {/* Context Bar */}
        {injectedFiles.length > 0 && (
          <div
            className="relative flex items-center gap-3 px-6 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={() => setContextPanelOpen(!contextPanelOpen)}
              className="flex items-center gap-1 text-white/40 text-xs flex-shrink-0 hover:text-white/60 transition-colors"
              style={{ border: 'none', background: 'transparent' }}
            >
              <span>Context:</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${contextPanelOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              {injectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="text-white/70 text-xs">{file.name}</span>
                  <button
                    onClick={() => removeInjectedFile(file.id)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    <X className="w-3 h-3 text-white/70" />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-white/40 text-xs hover:bg-white/5 transition-colors ml-auto"
              style={{ border: 'none', background: 'transparent' }}
            >
              <Eye className="w-3 h-3" />
              View Full Context
            </button>

            {/* Context Panel Dropdown */}
            {contextPanelOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setContextPanelOpen(false)}
                />
                <div
                  className="absolute top-full left-4 mt-2 z-50 w-80 rounded-xl overflow-hidden"
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="p-3 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">Context Files</span>
                      <span className="text-white/40 text-xs">{injectedFiles.length} file{injectedFiles.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {injectedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">{file.name}</div>
                          <div className="text-white/30 text-xs truncate">{file.path}</div>
                        </div>
                        <button
                          onClick={() => removeInjectedFile(file.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
                          style={{ border: 'none', background: 'transparent' }}
                        >
                          <X className="w-3.5 h-3.5 text-white/50" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        injectedFiles.forEach((f) => removeInjectedFile(f.id))
                        setContextPanelOpen(false)
                      }}
                      className="w-full py-2 rounded-lg text-white/50 text-xs hover:bg-white/5 transition-colors"
                      style={{ border: 'none', background: 'transparent' }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Logo */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#fff',
              marginBottom: 20,
            }}
          />
          <h2
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#fff',
              marginBottom: 12,
            }}
          >
            Nothing Machine
          </h2>
          <p
            style={{
              fontSize: 12,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.35)',
              maxWidth: 340,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {injectedFiles.length > 0
              ? `${injectedFiles.length} file${injectedFiles.length > 1 ? 's' : ''} in context. Start chatting or configure your machine's identity.`
              : "Select a field from the right panel to begin configuring your machine's identity."
            }
          </p>
        </div>

        {/* Chat Input - At bottom */}
        <ChatInput />
      </div>
    )
  }

  // Editor state
  return (
    <div
      className="flex-1 flex flex-col h-full animate-in fade-in duration-150"
      style={{
        background: '#0a0a0a',
      }}
    >
      {/* Context Bar */}
      {injectedFiles.length > 0 && (
        <div
          className="relative flex items-center gap-3 px-6 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setContextPanelOpen(!contextPanelOpen)}
            className="flex items-center gap-1 text-white/40 text-xs flex-shrink-0 hover:text-white/60 transition-colors"
            style={{ border: 'none', background: 'transparent' }}
          >
            <span>Context:</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${contextPanelOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {injectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <span className="text-white/70 text-xs">{file.name}</span>
                <button
                  onClick={() => removeInjectedFile(file.id)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <X className="w-3 h-3 text-white/70" />
                </button>
              </div>
            ))}
          </div>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-white/40 text-xs hover:bg-white/5 transition-colors ml-auto"
            style={{ border: 'none', background: 'transparent' }}
          >
            <Eye className="w-3 h-3" />
            View Full Context
          </button>

          {/* Context Panel Dropdown */}
          {contextPanelOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setContextPanelOpen(false)}
              />
              <div
                className="absolute top-full left-4 mt-2 z-50 w-80 rounded-xl overflow-hidden"
                style={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
              >
                <div className="p-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">Context Files</span>
                    <span className="text-white/40 text-xs">{injectedFiles.length} file{injectedFiles.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {injectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm truncate">{file.name}</div>
                        <div className="text-white/30 text-xs truncate">{file.path}</div>
                      </div>
                      <button
                        onClick={() => removeInjectedFile(file.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        <X className="w-3.5 h-3.5 text-white/50" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      injectedFiles.forEach((f) => removeInjectedFile(f.id))
                      setContextPanelOpen(false)
                    }}
                    className="w-full py-2 rounded-lg text-white/50 text-xs hover:bg-white/5 transition-colors"
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14 }}>{currentTab?.icon}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            {currentTab?.label}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.15)',
            }}
          >
            /
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#fff',
            }}
          >
            {editingField.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={closeEditor}
            className="transition-all duration-150"
            style={{
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.4)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            esc
          </button>
          <button
            onClick={saveAndClose}
            className="transition-all duration-150"
            style={{
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 500,
              color: '#fff',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
          >
            save ⏎
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ padding: '32px 24px 24px' }}
      >
        {/* Hint Line */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 6,
          }}
        >
          {editingField.hint}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex" style={{ marginTop: 16 }}>
          {/* Line Numbers */}
          <div
            style={{
              width: 40,
              paddingRight: 16,
              textAlign: 'right',
              fontSize: 12,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.1)',
              lineHeight: 1.7,
              userSelect: 'none',
            }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              background: 'rgba(255,255,255,0.06)',
              marginRight: 20,
            }}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            placeholder={editingField.placeholder}
            className="flex-1 resize-none outline-none"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 300,
              lineHeight: 1.7,
              caretColor: '#fff',
            }}
          />
        </div>

        {/* Keyboard Shortcuts Footer */}
        <div
          className="flex items-center gap-4"
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.15)',
            }}
          >
            esc to cancel
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.15)',
            }}
          >
            ⌘+⏎ to save
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.15)',
              marginLeft: 'auto',
            }}
          >
            {editingValue.length} chars
          </span>
        </div>
      </div>

      {/* Chat Input - At bottom */}
      <ChatInput />
    </div>
  )
}
