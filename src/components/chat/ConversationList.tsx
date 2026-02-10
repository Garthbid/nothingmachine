'use client'

import { useEffect } from 'react'
import { useConversationStore } from '@/lib/conversation-store'
import { useProfileStore } from '@/lib/profile-store'
import { Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConversationList({
  onSelect,
  onNew,
}: {
  onSelect: (id: string) => void
  onNew: () => void
}) {
  const { conversations, activeConversationId, loading, fetchConversations, deleteConversation } =
    useConversationStore()
  const { profile } = useProfileStore()

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Real-time subscription
  useEffect(() => {
    let mounted = true
    const setupRealtime = async () => {
      const { supabase } = await import('@/lib/supabase')
      const channel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'conversations' },
          () => {
            if (mounted) fetchConversations()
          }
        )
        .subscribe()

      return () => {
        mounted = false
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupRealtime()
    return () => {
      mounted = false
      cleanup.then((fn) => fn?.())
    }
  }, [fetchConversations])

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Conversations
        </span>
        <button
          onClick={onNew}
          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          title="New conversation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-white/30" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/30">No conversations yet</p>
            <button
              onClick={onNew}
              className="mt-2 text-xs text-white/50 hover:text-white underline"
            >
              Start one
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                'group px-3 py-2.5 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors',
                activeConversationId === conv.id && 'bg-white/10'
              )}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{conv.title}</p>
                  <p className="text-xs text-white/30 truncate mt-0.5">{conv.preview}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {conv.user_name && (
                      <span className="text-[10px] text-white/25">{conv.user_name}</span>
                    )}
                    <span className="text-[10px] text-white/20">{formatTime(conv.updated_at)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/30 hover:text-red-400 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
