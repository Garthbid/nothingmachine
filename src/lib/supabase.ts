import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export interface DbConversation {
  id: string
  title: string
  messages: DbMessage[]
  user_name: string | null
  created_at: string
  updated_at: string
}

export interface DbMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: { type: string; text?: string }[]
}
