'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ContextBar() {
  const { injectedFileIds, files, removeInjectedFile, buildSystemPrompt } = useStore()

  const injectedFiles = files.filter((f) => injectedFileIds.includes(f.id))

  if (injectedFiles.length === 0) {
    return (
      <div className="border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Context:</span>
          <span className="text-xs">No files injected. Drag files here to add context.</span>
        </div>
      </div>
    )
  }

  const systemPrompt = buildSystemPrompt()

  return (
    <div className="border-b border-border px-4 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Context:</span>
        {injectedFiles.map((file) => (
          <Badge
            key={file.id}
            variant="secondary"
            className="flex items-center gap-1 pr-1"
          >
            <span className="text-xs">{file.name}</span>
            <button
              onClick={() => removeInjectedFile(file.id)}
              className="ml-1 rounded-full hover:bg-muted p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              View Full Context
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Full System Prompt</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 h-full">
              <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {systemPrompt}
              </pre>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
