'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { MemoryFile } from '@/lib/types'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Search,
  GripVertical,
  Sparkles,
  Brain,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import { FileEditor } from './FileEditor'
import { NewFileDialog } from './NewFileDialog'

interface FolderNode {
  name: string
  path: string
  files: MemoryFile[]
  children: Map<string, FolderNode>
}

function buildFolderTree(files: MemoryFile[]): FolderNode {
  const root: FolderNode = { name: '', path: '', files: [], children: new Map() }

  files.forEach((file) => {
    const parts = file.path.split('/').filter(Boolean)
    let current = root

    // Navigate/create folders
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i]
      const folderPath = '/' + parts.slice(0, i + 1).join('/')

      if (!current.children.has(folderName)) {
        current.children.set(folderName, {
          name: folderName,
          path: folderPath,
          files: [],
          children: new Map(),
        })
      }
      current = current.children.get(folderName)!
    }

    // Add file to current folder
    current.files.push(file)
  })

  return root
}

function DraggableFileItem({ file }: { file: MemoryFile }) {
  const { injectedFileIds, injectFile, setEditingFile } = useStore()
  const isInjected = injectedFileIds.includes(file.id)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: file.id,
    data: { file },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : undefined,
      }
    : undefined

  const getIcon = () => {
    if (file.type === 'soul') return <Sparkles className="w-4 h-4 text-purple-500" />
    if (file.type === 'knowledge') return <BookOpen className="w-4 h-4 text-blue-500" />
    if (file.type === 'daily' || file.type === 'memory') return <Brain className="w-4 h-4 text-green-500" />
    return <FileText className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
        'hover:bg-accent',
        isInjected && 'bg-purple-500/10 border border-purple-500/30',
        isDragging && 'opacity-50 bg-accent'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>
      <div
        className="flex items-center gap-2 flex-1 min-w-0"
        onClick={() => setEditingFile(file)}
      >
        {getIcon()}
        <span className="truncate text-sm">{file.name}</span>
      </div>
      {!isInjected && (
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            injectFile(file.id)
          }}
        >
          <Plus className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}

function FolderItem({ node, depth = 0 }: { node: FolderNode; depth?: number }) {
  const { expandedFolders, toggleFolder } = useStore()
  const isExpanded = expandedFolders.includes(node.path)

  const sortedChildren = Array.from(node.children.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const sortedFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name))

  const getFolderIcon = () => {
    if (node.name === 'soul') return <Sparkles className="w-4 h-4 text-purple-500" />
    if (node.name === 'memory') return <Brain className="w-4 h-4 text-green-500" />
    if (node.name === 'knowledge') return <BookOpen className="w-4 h-4 text-blue-500" />
    return isExpanded ? (
      <FolderOpen className="w-4 h-4 text-muted-foreground" />
    ) : (
      <Folder className="w-4 h-4 text-muted-foreground" />
    )
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => toggleFolder(node.path)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        {getFolderIcon()}
        <span className="text-sm font-medium">{node.name}</span>
      </div>

      {isExpanded && (
        <div style={{ paddingLeft: `${depth * 12 + 16}px` }}>
          {sortedChildren.map((child) => (
            <FolderItem key={child.path} node={child} depth={depth + 1} />
          ))}
          {sortedFiles.map((file) => (
            <DraggableFileItem key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}

export function MemoryExplorer() {
  const { files, editingFile, setEditingFile } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)

  const filteredFiles = searchQuery
    ? files.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files

  const tree = buildFolderTree(filteredFiles)

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Memory Files</h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => setShowNewFileDialog(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <p className="text-xs text-muted-foreground px-2 mb-2">
            Drag files to inject into chat context
          </p>
          {/* Show folders sorted with soul first */}
          {Array.from(tree.children.values())
            .sort((a, b) => {
              // Custom sort: soul first, then memory, then knowledge, then rest alphabetically
              const order: Record<string, number> = { soul: 0, memory: 1, knowledge: 2 }
              const aOrder = order[a.name] ?? 99
              const bOrder = order[b.name] ?? 99
              if (aOrder !== bOrder) return aOrder - bOrder
              return a.name.localeCompare(b.name)
            })
            .map((node) => (
              <FolderItem key={node.path} node={node} />
            ))}
          {/* Show root-level files (files not in any folder) */}
          {tree.files.length > 0 && (
            <div className="mt-2 border-t border-border pt-2">
              <p className="text-xs text-muted-foreground px-2 mb-1">Root Files</p>
              {[...tree.files]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((file) => (
                  <DraggableFileItem key={file.id} file={file} />
                ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {editingFile && (
        <FileEditor file={editingFile} onClose={() => setEditingFile(null)} />
      )}

      <NewFileDialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog} />
    </div>
  )
}
