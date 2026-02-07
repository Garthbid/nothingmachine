'use client'

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { MemoryFile } from '@/lib/types'
import { Header } from '@/components/layout/Header'
import { ResizablePanels } from '@/components/layout/ResizablePanels'
import { MemoryExplorer } from '@/components/memory/MemoryExplorer'
import { TerminalEditor } from '@/components/editor/TerminalEditor'
import { ConfigManifest } from '@/components/editor/ConfigManifest'
import { MobileLayout } from '@/components/mobile/MobileLayout'
import { FileText } from 'lucide-react'

export default function Home() {
  const { injectFile } = useStore()
  const [activeFile, setActiveFile] = useState<MemoryFile | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <ResizablePanels
            leftPanel={<MemoryExplorer />}
            centerPanel={<TerminalEditor />}
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
      </div>
    </>
  )
}
