-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'New Conversation',
  messages jsonb not null default '[]'::jsonb,
  user_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast ordering
create index if not exists conversations_updated_at_idx on conversations (updated_at desc);

-- Enable Row Level Security (open access for now — anon key)
alter table conversations enable row level security;

-- Allow all operations with the anon key
create policy "Allow all reads" on conversations for select using (true);
create policy "Allow all inserts" on conversations for insert with check (true);
create policy "Allow all updates" on conversations for update using (true) with check (true);
create policy "Allow all deletes" on conversations for delete using (true);

-- Enable real-time so teammates see updates live
alter publication supabase_realtime add table conversations;
