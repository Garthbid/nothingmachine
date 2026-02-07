'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-9 py-5"
      style={{
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-white rounded-full" />
        <span className="text-sm font-normal tracking-[0.02em] text-white">Nothing Machine</span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white hover:bg-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              Richard
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10">
            <DropdownMenuItem className="text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Richard (Active)
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
