'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { MemoryFile } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Sparkles, Brain, BookOpen, FileText } from 'lucide-react'

interface NewFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const folderOptions = [
  { value: '/soul', label: 'Soul', icon: Sparkles, type: 'soul' as const },
  { value: '/memory/daily', label: 'Memory / Daily', icon: Brain, type: 'daily' as const },
  { value: '/memory/weekly', label: 'Memory / Weekly', icon: Brain, type: 'memory' as const },
  { value: '/knowledge/domain', label: 'Knowledge / Domain', icon: BookOpen, type: 'knowledge' as const },
  { value: '/knowledge/relationships', label: 'Knowledge / Relationships', icon: BookOpen, type: 'knowledge' as const },
  { value: '/custom', label: 'Custom', icon: FileText, type: 'custom' as const },
]

export function NewFileDialog({ open, onOpenChange }: NewFileDialogProps) {
  const { addFile } = useStore()
  const [fileName, setFileName] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(folderOptions[0])

  const handleCreate = () => {
    if (!fileName.trim()) return

    const name = fileName.endsWith('.md') ? fileName : `${fileName}.md`
    const path = `${selectedFolder.value}/${name}`

    const newFile: MemoryFile = {
      id: `file-${Date.now()}`,
      name,
      path,
      content: `# ${fileName.replace('.md', '')}\n\n`,
      type: selectedFolder.type,
      lastModified: new Date(),
      injected: false,
    }

    addFile(newFile)
    setFileName('')
    setSelectedFolder(folderOptions[0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Folder</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <selectedFolder.icon className="w-4 h-4" />
                    {selectedFolder.label}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                {folderOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedFolder(option)}
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">File Name</label>
            <Input
              placeholder="my-file.md"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
            />
            <p className="text-xs text-muted-foreground">
              Will be created at: {selectedFolder.value}/{fileName || 'filename'}{!fileName.endsWith('.md') && '.md'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!fileName.trim()}>
            Create File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
