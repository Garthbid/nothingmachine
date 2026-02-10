'use client'

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { MemoryFile } from '@/lib/types'
import { Header } from '@/components/layout/Header'
import { ResizablePanels } from '@/components/layout/ResizablePanels'
import { MemoryExplorer } from '@/components/memory/MemoryExplorer'
import { TerminalEditor } from '@/components/editor/TerminalEditor'
import { ConfigManifest } from '@/components/editor/ConfigManifest'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ConversationList } from '@/components/chat/ConversationList'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import { FileText } from 'lucide-react'
import { useEditorStore } from '@/lib/editor-store'
import { useProfileStore } from '@/lib/profile-store'
import { ProfileModal } from '@/components/ProfileModal'

function CenterPanel() {
  const { editingField } = useEditorStore()

  return (
    <>
      {editingField && <TerminalEditor />}
      <div className={editingField ? 'hidden' : 'h-full'}>
        <ChatInterface />
      </div>
    </>
  )
}

function LeftPanel() {
  const handleSelectConversation = useCallback(
    async (id: string) => {
      const loadFn = (window as unknown as Record<string, unknown>).__loadConversation as
        | ((id: string) => Promise<void>)
        | undefined
      if (loadFn) await loadFn(id)
    },
    []
  )

  const handleNewConversation = useCallback(() => {
    const newChatFn = (window as unknown as Record<string, unknown>).__newChat as (() => void) | undefined
    if (newChatFn) newChatFn()
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="h-[40%] min-h-[150px] border-b border-white/10">
        <ConversationList onSelect={handleSelectConversation} onNew={handleNewConversation} />
      </div>
      <div className="flex-1 overflow-hidden">
        <MemoryExplorer />
      </div>
    </div>
  )
}

export default function Home() {
  const { injectFile, currentView, setCurrentView } = useStore()
  const { profile } = useProfileStore()
  const [activeFile, setActiveFile] = useState<MemoryFile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show profile modal on first visit if no profile set
  useEffect(() => {
    if (mounted && !profile) {
      setShowProfilePrompt(true)
    }
  }, [mounted, profile])

  const handleDragStart = (event: DragStartEvent) => {
    const file = event.active.data.current?.file as MemoryFile | undefined
    if (file) {
      setActiveFile(file)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveFile(null)

    if (over?.id === 'chat-dropzone') {
      const fileId = active.id as string
      injectFile(fileId)
    }
  }

  if (!mounted) {
    return (
      <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-white/40">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Layout */}
      <MobileLayout />

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen flex-col bg-[#0a0a0a] text-white pt-16">
        <Header />

        {currentView === 'home' ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {/* Logo */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#fff',
                marginBottom: 28,
              }}
            />
            <h1
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: '#fff',
                marginBottom: 12,
              }}
            >
              Nothing Machine
            </h1>
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.4)',
                maxWidth: 460,
                textAlign: 'center',
                lineHeight: 1.7,
                marginBottom: 48,
              }}
            >
              Build, configure, and converse with your machine.
              Define its identity, load its memory, and shape how it thinks.
            </p>

            <button
              onClick={() => setCurrentView('editor')}
              className="transition-all duration-200"
              style={{
                padding: '12px 32px',
                fontSize: 14,
                fontWeight: 500,
                color: '#0a0a0a',
                background: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Open Editor
            </button>
          </div>
        ) : (
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <ResizablePanels
              leftPanel={<LeftPanel />}
              centerPanel={<CenterPanel />}
              rightPanel={<ConfigManifest />}
              defaultLeftWidth={220}
              defaultRightWidth={280}
              minLeftWidth={180}
              maxLeftWidth={350}
              minRightWidth={280}
              maxRightWidth={320}
              minCenterWidth={400}
            />

            <DragOverlay>
              {activeFile && (
                <div className="bg-background border rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{activeFile.name}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
      <ProfileModal open={showProfilePrompt} onClose={() => setShowProfilePrompt(false)} />
    </>
  )
}
