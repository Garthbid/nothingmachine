'use client'

import { create } from 'zustand'
import { supabase, DbConversation, DbMessage } from './supabase'

interface ConversationSummary {
  id: string
  title: string
  user_name: string | null
  created_at: string
  updated_at: string
  preview: string
}

interface ConversationState {
  conversations: ConversationSummary[]
  activeConversationId: string | null
  loading: boolean

  fetchConversations: () => Promise<void>
  createConversation: (userName: string | null) => Promise<string | null>
  saveMessages: (conversationId: string, messages: DbMessage[], userName: string | null) => Promise<void>
  loadConversation: (id: string) => Promise<DbMessage[] | null>
  deleteConversation: (id: string) => Promise<void>
  setActiveConversationId: (id: string | null) => void
}

function generateTitle(messages: DbMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user')
  if (!firstUserMsg) return 'New Conversation'
  const text = firstUserMsg.parts
    ?.filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text)
    .join('') || ''
  if (text.length <= 50) return text || 'New Conversation'
  return text.slice(0, 47) + '...'
}

function getPreview(messages: DbMessage[]): string {
  const lastMsg = [...messages].reverse().find((m) => m.role === 'assistant')
  if (!lastMsg) return 'No messages yet'
  const text = lastMsg.parts
    ?.filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text)
    .join('') || ''
  if (text.length <= 80) return text || 'No messages yet'
  return text.slice(0, 77) + '...'
}

export const useConversationStore = create<ConversationState>()((set, get) => ({
  conversations: [],
  activeConversationId: null,
  loading: false,

  fetchConversations: async () => {
    if (!supabase) return
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, user_name, created_at, updated_at, messages')
        .order('updated_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching conversations:', error)
        return
      }

      const summaries: ConversationSummary[] = (data || []).map((c: DbConversation) => ({
        id: c.id,
        title: c.title,
        user_name: c.user_name,
        created_at: c.created_at,
        updated_at: c.updated_at,
        preview: getPreview(c.messages || []),
      }))

      set({ conversations: summaries })
    } finally {
      set({ loading: false })
    }
  },

  createConversation: async (userName) => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: 'New Conversation',
        messages: [],
        user_name: userName,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return null
    }

    set({ activeConversationId: data.id })
    await get().fetchConversations()
    return data.id
  },

  saveMessages: async (conversationId, messages, userName) => {
    if (!supabase) return
    const title = generateTitle(messages)
    const { error } = await supabase
      .from('conversations')
      .update({
        title,
        messages,
        user_name: userName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    if (error) {
      console.error('Error saving messages:', error)
      return
    }

    // Update local state
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, title, preview: getPreview(messages), updated_at: new Date().toISOString() }
          : c
      ),
    }))
  },

  loadConversation: async (id) => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error loading conversation:', error)
      return null
    }

    set({ activeConversationId: id })
    return data.messages as DbMessage[]
  },

  deleteConversation: async (id) => {
    if (!supabase) return
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting conversation:', error)
      return
    }

    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
    }))
  },

  setActiveConversationId: (id) => set({ activeConversationId: id }),
}))
