'use client'

import { useState } from 'react'
import { ChevronDown, Home, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStore } from '@/lib/store'
import { useProfileStore } from '@/lib/profile-store'
import { ProfileModal } from '@/components/ProfileModal'

export function Header() {
  const { setCurrentView } = useStore()
  const { profile } = useProfileStore()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-9 py-5"
        style={{
          background: '#0a0a0a',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer" style={{ background: 'transparent', border: 'none' }}>
              <div className="w-5 h-5 bg-white rounded-full" />
              <span className="text-sm font-normal tracking-[0.02em] text-white">Nothing Machine</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-[#0a0a0a] border-white/10">
            <DropdownMenuItem
              onClick={() => setCurrentView('home')}
              className="text-white/70 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5" />
                Home
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
            style={{ background: 'transparent', border: 'none' }}
          >
            <User className="w-4 h-4" />
            <span className="text-sm">{profile?.name || 'Set Profile'}</span>
          </button>

          <div className="w-px h-4 bg-white/10" />

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

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
