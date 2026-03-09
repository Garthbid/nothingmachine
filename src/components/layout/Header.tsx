'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, Home, LineChart, BrainCircuit, User, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStore } from '@/lib/store'
import { useProfileStore } from '@/lib/profile-store'
import { useTeamStore } from '@/lib/team-store'
import { useModelStore } from '@/lib/model-store'
import { ProfileModal } from '@/components/ProfileModal'
import { TeamModal } from '@/components/TeamModal'
import { useRichard } from '@/lib/useRichard'

export function Header() {
  const { setCurrentView } = useStore()
  const { profile } = useProfileStore()
  const { members } = useTeamStore()
  const { models, selectedModelId } = useModelStore()
  const selectedModel = models.find((m) => m.id === selectedModelId) ?? models[0]
  const { status: richardStatus, connect, disconnect, isConnected } = useRichard()
  const [profileOpen, setProfileOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)

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

          <div className="flex items-center">
            {members.map((member, i) => (
              <div
                key={member.id}
                title={member.name}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-[#0a0a0a]"
                style={{
                  backgroundColor: member.color,
                  marginLeft: i === 0 ? 0 : -6,
                  zIndex: members.length - i,
                  position: 'relative',
                }}
              >
                {member.avatar}
              </div>
            ))}
            <button
              onClick={() => setTeamOpen(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.05)',
                marginLeft: members.length > 0 ? -6 : 0,
                zIndex: 0,
                position: 'relative',
              }}
            >
              {members.length > 0 ? `+${members.length}` : '+'}
            </button>
          </div>
          <Link
            href="/ideamarket"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-white/15 text-white/65 hover:text-emerald-300 hover:border-emerald-400/35 hover:bg-emerald-500/10 transition-colors"
          >
            <LineChart className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-[0.08em]">Idea Market</span>
          </Link>
          <Link
            href="/cognitionmarket"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-white/15 text-white/65 hover:text-cyan-300 hover:border-cyan-400/35 hover:bg-cyan-500/10 transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-[0.08em]">Cognition</span>
          </Link>

          <div className="w-px h-4 bg-white/10" />

          <button
            onClick={isConnected ? disconnect : connect}
            className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-white/5"
            style={{ background: 'transparent', border: 'none' }}
            title={
              richardStatus === 'connected'
                ? 'Connected to Clawdbot — click to disconnect'
                : richardStatus === 'connecting'
                ? 'Connecting to Clawdbot...'
                : richardStatus === 'error'
                ? 'Connection error — click to retry'
                : 'Click to connect to Clawdbot'
            }
          >
            {richardStatus === 'connecting' ? (
              <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            ) : isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-green-400" />
            ) : richardStatus === 'error' ? (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-white/40" />
            )}
            <span
              className={`text-xs font-medium ${
                isConnected
                  ? 'text-green-400'
                  : richardStatus === 'connecting'
                  ? 'text-yellow-400'
                  : richardStatus === 'error'
                  ? 'text-red-400'
                  : 'text-white/40'
              }`}
            >
              {richardStatus === 'connected'
                ? 'Clawdbot Live'
                : richardStatus === 'connecting'
                ? 'Connecting...'
                : richardStatus === 'error'
                ? 'Error'
                : 'Clawdbot'}
            </span>
          </button>

          <div className="w-px h-4 bg-white/10" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white hover:bg-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-white'}`} />
                Richard
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10">
              <DropdownMenuItem className="text-white/70">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-white'}`} />
                  Richard {isConnected ? '(Live)' : '(Active)'}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <TeamModal open={teamOpen} onClose={() => setTeamOpen(false)} />
    </>
  )
}
