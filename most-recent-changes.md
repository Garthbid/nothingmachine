# Most Recent Changes

## Supabase Cloud Conversation Storage
- Integrated `@supabase/supabase-js` for persistent cloud conversation storage
- Created `src/lib/supabase.ts` — Supabase client with graceful null handling when env vars are missing (prevents Vercel build crashes)
- Created `src/lib/conversation-store.ts` — Zustand store for CRUD operations on conversations (fetch, create, save, load, delete)
- Created `src/components/chat/ConversationList.tsx` — conversation sidebar with real-time Supabase subscription for live updates
- Updated `src/app/page.tsx` — added LeftPanel with ConversationList + MemoryExplorer
- Updated `src/components/chat/ChatInterface.tsx` — auto-save messages to Supabase (1.5s debounce), auto-create conversation on first message
- Created `supabase-migration.sql` — conversations table with UUID PK, JSONB messages, RLS policies, real-time enabled
- Vercel env vars needed: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## North Star & Bottleneck Focus Fields
- Added two always-visible inline-editable fields to the bottom of the Identity Configuration panel (desktop)
- North Star (yellow, Star icon) — "What's the #1 goal?"
- Bottleneck (orange, AlertTriangle icon) — "What's blocking progress?"
- Stored in editor store as `_focusNorthStar` and `_focusBottleneck` (persisted via localStorage)
- Injected into system prompt as the FIRST section: "Revolve every answer around solving the north star and the current bottleneck. Everything else is noise."
- Files changed: `src/components/editor/ConfigManifest.tsx`, `src/lib/useChat.ts`

## Mobile Chat Fixes
- **Send button wired up** — was purely decorative, now calls `sendMessage()` and renders actual chat bubbles
- **iOS Safari zoom fix** — input font-size set to 16px (Safari auto-zooms anything smaller) + viewport meta with `maximumScale: 1, userScalable: false`
- **Safe-area bottom padding** — chat input uses `env(safe-area-inset-bottom)` to sit above the mobile browser's navigation bar
- **Enter key sends** — pressing Enter in the input sends the message
- **Stop button** — appears while streaming, replaces mic icon
- **Auto-scroll** — chat scrolls to bottom on new messages
- File changed: `src/components/mobile/MobileLayout.tsx`, `src/app/layout.tsx`

## Mobile Feature Parity
- **North Star & Bottleneck on mobile** — two compact inline-editable fields above the chat input, always visible in chat view
- **Supabase auto-save on mobile** — conversations save to cloud just like desktop (debounced)
- **Auto-create conversation** — first message from mobile creates a Supabase conversation record
- **Auto-load recent conversation** — both mobile AND desktop auto-load the most recent conversation if updated within the last 24 hours (cross-device continuity)

## Build Fixes
- Fixed TypeScript error: `window` cast needed `as unknown as Record<string, unknown>` for strict TS
- Fixed Vercel prerender crash: Supabase client now returns `null` when env vars are missing instead of throwing
- All conversation store methods bail early when Supabase is unavailable

## Files Changed
- `src/app/layout.tsx` — viewport meta for iOS
- `src/app/page.tsx` — LeftPanel, TypeScript fix
- `src/lib/supabase.ts` — new, Supabase client
- `src/lib/conversation-store.ts` — new, conversation Zustand store
- `src/lib/useChat.ts` — North Star/Bottleneck in system prompt
- `src/components/chat/ChatInterface.tsx` — auto-save, auto-load, TypeScript fix
- `src/components/chat/ConversationList.tsx` — new, conversation list UI
- `src/components/editor/ConfigManifest.tsx` — FocusField components
- `src/components/mobile/MobileLayout.tsx` — full chat functionality, focus fields, Supabase integration
- `supabase-migration.sql` — new, database schema
