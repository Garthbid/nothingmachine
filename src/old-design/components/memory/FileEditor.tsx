'use client'

import { useState, useEffect } from 'react'
import { MemoryFile } from '@/lib/types'
import { useStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, X, Trash2, Plus } from 'lucide-react'

interface FileEditorProps {
  file: MemoryFile
  onClose: () => void
}

export function FileEditor({ file, onClose }: FileEditorProps) {
  const { updateFile, deleteFile, injectFile, removeInjectedFile, injectedFileIds } = useStore()
  const [content, setContent] = useState(file.content)
  const [hasChanges, setHasChanges] = useState(false)

  const isInjected = injectedFileIds.includes(file.id)

  useEffect(() => {
    setContent(file.content)
    setHasChanges(false)
  }, [file])

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasChanges(value !== file.content)
  }

  const handleSave = () => {
    updateFile(file.id, content)
    setHasChanges(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(file.id)
      onClose()
    }
  }

  const getTypeColor = () => {
    switch (file.type) {
      case 'soul':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'memory':
      case 'daily':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'knowledge':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg">{file.name}</DialogTitle>
              <Badge variant="outline" className={getTypeColor()}>
                {file.type}
              </Badge>
              {hasChanges && (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{file.path}</p>
        </DialogHeader>

        <div className="flex-1 min-h-0 py-4">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="h-full resize-none font-mono text-sm"
            placeholder="Enter file content..."
          />
        </div>

        <div className="flex items-center justify-between flex-shrink-0 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant={isInjected ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => (isInjected ? removeInjectedFile(file.id) : injectFile(file.id))}
            >
              {isInjected ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Remove from Context
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Context
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
