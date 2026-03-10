'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bookmark,
  BookmarkCheck,
  ClipboardList,
  Heart,
  MessageCircle,
  Play,
  Repeat2,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'

/* ─── Types ─── */

type IdeaSourceType = 'x_post' | 'youtube'
type Decision = 'accepted' | 'rejected'
type RichardStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
type RichardIdeaModeVariant = 'desktop' | 'mobile'
type UrgencyLevel = 'study-deeply' | 'useful-now' | 'save-for-later' | 'skim'

interface IdeaRecommendation {
  id: string
  type: IdeaSourceType
  thesis: string
  whyNow: string
  tags: string[]
  urgency: UrgencyLevel
  sourceUrl: string
  confidence: number
  author: string
  handle: string
  verified: boolean
  timestamp: string
  postText: string
  metrics?: { replies: string; reposts: string; likes: string }
  videoTitle?: string
  channel?: string
  ytViews?: string
  duration?: string
  thumbnailGradient?: string
}

/* ─── Constants ─── */

const TAG_COLORS: Record<string, { text: string; bg: string; border: string; accent: string; bgTint: string }> = {
  Trust:     { text: 'text-amber-400',   bg: 'bg-amber-400/[0.08]',   border: 'border-amber-400/25', accent: '#FBBF24', bgTint: 'bg-amber-500/[0.03]' },
  Growth:    { text: 'text-emerald-400', bg: 'bg-emerald-400/[0.08]', border: 'border-emerald-400/25', accent: '#34D399', bgTint: 'bg-emerald-500/[0.03]' },
  Product:   { text: 'text-blue-400',    bg: 'bg-blue-400/[0.08]',    border: 'border-blue-400/25', accent: '#60A5FA', bgTint: 'bg-blue-500/[0.03]' },
  Strategy:  { text: 'text-violet-400',  bg: 'bg-violet-400/[0.08]',  border: 'border-violet-400/25', accent: '#A78BFA', bgTint: 'bg-violet-500/[0.03]' },
  Attention: { text: 'text-pink-400',    bg: 'bg-pink-400/[0.08]',    border: 'border-pink-400/25', accent: '#F472B6', bgTint: 'bg-pink-500/[0.03]' },
  Systems:     { text: 'text-cyan-400',    bg: 'bg-cyan-400/[0.08]',    border: 'border-cyan-400/25', accent: '#22D3EE', bgTint: 'bg-cyan-500/[0.03]' },
  Marketplace: { text: 'text-orange-400',  bg: 'bg-orange-400/[0.08]',  border: 'border-orange-400/25', accent: '#FB923C', bgTint: 'bg-orange-500/[0.03]' },
}

const DEFAULT_TAG_COLOR = TAG_COLORS.Product

function getTagColor(tag: string) {
  return TAG_COLORS[tag] || DEFAULT_TAG_COLOR
}

function getPrimaryTagColor(tags: string[]) {
  for (const tag of tags) {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag]
  }
  return DEFAULT_TAG_COLOR
}

const URGENCY_META: Record<UrgencyLevel, { label: string; cls: string }> = {
  'study-deeply': { label: 'Study deeply', cls: 'text-amber-400 bg-amber-400/[0.1] border-amber-400/25' },
  'useful-now': { label: 'Useful now', cls: 'text-emerald-400 bg-emerald-400/[0.1] border-emerald-400/25' },
  'save-for-later': { label: 'Save for later', cls: 'text-sky-400 bg-sky-400/[0.1] border-sky-400/25' },
  'skim': { label: 'Skim', cls: 'text-white/30 bg-white/[0.03] border-white/[0.08]' },
}

/* ─── SVG Icons ─── */

function XBrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function XVerifiedBadge() {
  return (
    <svg viewBox="0 0 22 22" className="w-[14px] h-[14px] inline-flex flex-shrink-0" fill="#1d9bf0">
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.144.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.26.274 1.894.144.636-.13 1.22-.434 1.69-.88.445-.47.75-1.055.88-1.69.13-.634.083-1.29-.14-1.898.587-.273 1.084-.704 1.438-1.244.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  )
}

function YTVerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] inline-flex flex-shrink-0" fill="#888">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}

/* ─── Helper Components ─── */

function UserAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const gradients = [
    'from-sky-400 to-blue-600',
    'from-purple-400 to-indigo-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-600',
    'from-emerald-400 to-teal-600',
  ]
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length
  return (
    <div
      className={cn('rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center font-bold text-white', gradients[idx])}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  )
}

/* ─── Compact Source Previews ─── */

function CompactXPreview({ idea }: { idea: IdeaRecommendation }) {
  return (
    <a
      href={idea.sourceUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="block rounded-lg border border-sky-400/20 bg-sky-400/[0.04] overflow-hidden hover:border-sky-400/30 transition-colors no-underline"
    >
      <div className="flex items-start gap-2.5 p-3">
        <UserAvatar name={idea.author} size={24} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-white/55 text-[12px]">{idea.author}</span>
            {idea.verified && <XVerifiedBadge />}
            <span className="text-white/25 text-[11px]">@{idea.handle} · {idea.timestamp}</span>
            <XBrandLogo className="w-3 h-3 text-white/20 ml-auto flex-shrink-0" />
          </div>
          <p className="text-white/40 text-[12px] leading-snug mt-1 line-clamp-2 whitespace-pre-line">
            {idea.postText}
          </p>
          {idea.metrics && (
            <div className="flex items-center gap-4 mt-1.5 text-white/20 text-[10px]">
              <span className="flex items-center gap-1"><MessageCircle className="w-2.5 h-2.5" />{idea.metrics.replies}</span>
              <span className="flex items-center gap-1"><Repeat2 className="w-2.5 h-2.5" />{idea.metrics.reposts}</span>
              <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" />{idea.metrics.likes}</span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

function CompactYouTubePreview({ idea }: { idea: IdeaRecommendation }) {
  return (
    <a
      href={idea.sourceUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="flex gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] overflow-hidden hover:border-red-500/30 transition-colors no-underline p-3"
    >
      <div className={cn(
        'relative w-[112px] h-[63px] rounded-md overflow-hidden bg-gradient-to-br flex-shrink-0',
        idea.thumbnailGradient || 'from-gray-700 to-gray-900'
      )}>
        <div className="absolute inset-0 bg-black/10" />
        <div
          className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-5 bg-red-600/80 rounded flex items-center justify-center">
            <Play className="w-3 h-3 text-white fill-white ml-px" />
          </div>
        </div>
        {idea.duration && (
          <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] font-medium px-1 py-px rounded">
            {idea.duration}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-px">
        <h4 className="text-white/55 text-[12px] font-medium leading-snug line-clamp-2">
          {idea.videoTitle}
        </h4>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-white/30 text-[10px]">{idea.channel || idea.author}</span>
          {idea.verified && <YTVerifiedBadge />}
        </div>
        <span className="text-white/30 text-[10px]">{idea.ytViews} · {idea.timestamp}</span>
      </div>
    </a>
  )
}

/* ─── Brief Card ─── */

function BriefCard({
  idea,
  decision,
  onAccept,
  onReject,
  isMobile,
}: {
  idea: IdeaRecommendation
  decision?: Decision
  onAccept: () => void
  onReject: () => void
  isMobile: boolean
}) {
  const urgency = URGENCY_META[idea.urgency]
  const primaryColor = getPrimaryTagColor(idea.tags)

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-300',
        primaryColor.bgTint,
        decision === 'rejected' && 'opacity-35',
      )}
      style={{ borderLeft: `3px solid ${primaryColor.accent}` }}
    >
      {/* ── Top Strip: Signature metadata bar ── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05]">
        <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25">
          Richard Brief
        </span>
        <span className="text-white/10">·</span>
        <span className={cn('text-[10px] font-semibold tabular-nums', primaryColor.text)}>
          {idea.confidence}% fit
        </span>
        <span className="text-white/10">·</span>
        <div className="flex items-center gap-1.5">
          {idea.tags.map((tag) => {
            const tagColor = getTagColor(tag)
            return (
              <span
                key={tag}
                className={cn(
                  'text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-px rounded',
                  tagColor.text,
                  tagColor.bg,
                )}
              >
                {tag}
              </span>
            )
          })}
        </div>
      </div>

      {/* ── Layer 1: AI Brief — The Hero ── */}
      <div className={cn('px-4 pt-4', isMobile ? 'px-4' : 'px-5')}>
        {/* Urgency pill */}
        <div className={cn(
          'inline-flex items-center px-2 py-[3px] rounded border text-[9px] font-bold uppercase tracking-[0.1em] mb-3',
          urgency.cls,
        )}>
          {urgency.label}
        </div>

        {/* Thesis — visual anchor */}
        <h3 className={cn(
          'font-semibold text-white leading-[1.3] tracking-[-0.01em]',
          isMobile ? 'text-[19px]' : 'text-[18px]',
        )}>
          {idea.thesis}
        </h3>
      </div>

      {/* ── Layer 2: Why This Matters + Actions ── */}
      <div className={cn('px-4 pt-3 pb-4', isMobile ? 'px-4' : 'px-5')}>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/20 mb-1">
          Why This Matters
        </p>
        <p className={cn(
          'leading-relaxed text-white/45',
          isMobile ? 'text-[13px]' : 'text-[13px]',
        )}>
          {idea.whyNow}
        </p>

        {/* Action Row */}
        <div className="mt-4 flex items-center gap-1.5">
          {decision ? (
            <div className={cn(
              'flex items-center gap-1.5 text-[11px] font-semibold',
              decision === 'accepted' ? 'text-emerald-400/80' : 'text-white/20',
            )}>
              {decision === 'accepted' ? (
                <><BookmarkCheck className="w-3.5 h-3.5" /> Saved to queue</>
              ) : (
                <><X className="w-3.5 h-3.5" /> Dismissed</>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={onAccept}
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-md text-[10px] font-bold uppercase tracking-[0.06em] text-emerald-400 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.15] border border-emerald-400/[0.15] hover:border-emerald-400/25 transition-all cursor-pointer"
              >
                <Bookmark className="w-3 h-3" />
                Save Idea
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-[6px] rounded-md text-[10px] font-bold uppercase tracking-[0.06em] text-white/35 hover:text-white/55 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer"
              >
                <ClipboardList className="w-3 h-3" />
                Turn Into Task
              </button>
              <button
                onClick={onReject}
                className="px-3 py-[6px] rounded-md text-[10px] font-bold uppercase tracking-[0.06em] text-white/20 hover:text-white/35 hover:bg-white/[0.03] transition-all border-0 bg-transparent cursor-pointer ml-auto"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Layer 3: Source Preview — Supporting Evidence ── */}
      <div className={cn(
        'px-4 pb-4 border-t border-white/[0.04] pt-3',
        isMobile ? 'px-4' : 'px-5',
      )}>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/15 mb-2">
          Source
        </p>
        {idea.type === 'x_post' ? (
          <CompactXPreview idea={idea} />
        ) : (
          <CompactYouTubePreview idea={idea} />
        )}
      </div>
    </div>
  )
}

/* ─── Idea Data ─── */

const IDEA_DECK: IdeaRecommendation[] = [
  {
    id: 'x-seller-trust',
    type: 'x_post',
    thesis: 'Seller trust scores could become a visible marketplace moat.',
    whyNow: 'Relevant to your work on guarantees, seller quality, and buyer trust. Could reduce post-auction friction and walk-away rates.',
    tags: ['Trust', 'Marketplace'],
    urgency: 'study-deeply',
    sourceUrl: 'https://x.com/search?q=seller%20trust%20score%20marketplace',
    confidence: 91,
    author: 'Maya Torres',
    handle: 'mayabuilds',
    verified: true,
    timestamp: '3h',
    postText: 'Seller trust scores are the next frontier for marketplaces.\n\nBuild a public "Seller Integrity" rail that rewards clear disclosures and penalizes missing defect details before bids close.\n\nThis is the moat nobody is building yet.',
    metrics: { replies: '47', reposts: '182', likes: '1.2K' },
  },
  {
    id: 'yt-agent-marketplace',
    type: 'youtube',
    thesis: 'This changes the onboarding math for agent-native marketplaces.',
    whyNow: 'Most users bounce before setup is complete. Fast first value can materially increase activation and return sessions.',
    tags: ['Growth', 'Product'],
    urgency: 'useful-now',
    sourceUrl: 'https://www.youtube.com/results?search_query=agentic+marketplace+onboarding',
    confidence: 88,
    author: 'The Product Lab',
    handle: 'productlab',
    verified: true,
    timestamp: '2 days ago',
    postText: 'Two-step onboarding: collect user objective, then auto-generate the first action plan so users feel momentum in 45 seconds.',
    videoTitle: 'How Agent-Native Marketplaces Will Change Onboarding Forever',
    channel: 'The Product Lab',
    ytViews: '142K views',
    duration: '18:42',
    thumbnailGradient: 'from-violet-600 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'x-liquidity-moment',
    type: 'x_post',
    thesis: 'Weekly ritual beats daily chaos for marketplace retention.',
    whyNow: 'A predictable moment creates habit and turns users into participants instead of passive scrollers.',
    tags: ['Strategy', 'Attention'],
    urgency: 'useful-now',
    sourceUrl: 'https://x.com/search?q=marketplace+liquidity',
    confidence: 86,
    author: 'Alex Rivera',
    handle: 'arivera_tech',
    verified: true,
    timestamp: '5h',
    postText: 'Hot take: the best marketplaces don\'t optimize for DAU.\n\nThey design a weekly "liquidity moment" that users schedule around.\n\nRitual > randomness. Every time.',
    metrics: { replies: '93', reposts: '412', likes: '2.8K' },
  },
  {
    id: 'yt-essentialism',
    type: 'youtube',
    thesis: 'A high-signal filter mode could differentiate you from every other feed.',
    whyNow: 'You are replacing manipulative feeds. Let users feel the difference: fewer items, higher relevance, less cognitive drain.',
    tags: ['Product', 'Attention'],
    urgency: 'save-for-later',
    sourceUrl: 'https://www.youtube.com/results?search_query=essentialism+product+design',
    confidence: 84,
    author: 'Design Matters',
    handle: 'designmatters',
    verified: true,
    timestamp: '1 week ago',
    postText: 'Create a user-controlled strict filter that shows only top opportunities, with explicit reasons for why each item passed the threshold.',
    videoTitle: 'The "High-Signal Only" Mode: Applying Essentialism to Product',
    channel: 'Design Matters',
    ytViews: '89K views',
    duration: '24:16',
    thumbnailGradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  {
    id: 'x-transparent-ai',
    type: 'x_post',
    thesis: 'Explainability is the moat. Ship a "why I picked this" panel.',
    whyNow: 'Your edge is explainability and user agency, not infinite scroll addiction.',
    tags: ['Systems', 'Trust'],
    urgency: 'study-deeply',
    sourceUrl: 'https://x.com/search?q=transparent+recommender+systems',
    confidence: 93,
    author: 'Kai Patel',
    handle: 'kaipatel',
    verified: true,
    timestamp: '8h',
    postText: 'Every AI recommendation should ship with a "why I picked this" panel.\n\nShow:\n\u2192 Freshness score\n\u2192 Source quality\n\u2192 Expected upside\n\nAlgorithmic feeds hide the why. Don\'t be them.',
    metrics: { replies: '128', reposts: '567', likes: '4.1K' },
  },
  {
    id: 'yt-conviction-slider',
    type: 'youtube',
    thesis: 'Pre-bid confidence scoring creates richer data without adding friction.',
    whyNow: 'You get richer data without extra friction, and users start learning their own decision quality over time.',
    tags: ['Product', 'Growth'],
    urgency: 'save-for-later',
    sourceUrl: 'https://www.youtube.com/results?search_query=buyer+intent+signals+marketplace',
    confidence: 82,
    author: 'The Venture Pod',
    handle: 'venturepod',
    verified: true,
    timestamp: '4 days ago',
    postText: 'Ask buyers to score confidence before bidding to improve price discovery and reduce low-intent noise.',
    videoTitle: 'Buyer Intent Signals: The Conviction Slider Pattern',
    channel: 'The Venture Pod',
    ytViews: '203K views',
    duration: '31:07',
    thumbnailGradient: 'from-cyan-500 via-teal-500 to-emerald-500',
  },
  {
    id: 'x-learning-loops',
    type: 'x_post',
    thesis: 'Publish your wins and misses. Transparency compounds trust.',
    whyNow: 'Transparency builds authenticity and long-term retention. Show the feedback loop.',
    tags: ['Trust', 'Strategy'],
    urgency: 'useful-now',
    sourceUrl: 'https://x.com/search?q=product+learning+loops',
    confidence: 87,
    author: 'Priya Sharma',
    handle: 'priyaships',
    verified: true,
    timestamp: '12h',
    postText: 'Want to build real trust with users?\n\nPublish a weekly "wins and misses" reel.\n\nDocument what your AI recommended, what users accepted, and what actually happened.\n\nPeople trust systems that admit misses and learn quickly.',
    metrics: { replies: '76', reposts: '289', likes: '2.1K' },
  },
  {
    id: 'yt-human-loop',
    type: 'youtube',
    thesis: 'Power users need a private queue with stricter AI thresholds.',
    whyNow: 'This positions your AI as a safety buffer against chaotic public feeds while preserving full user control.',
    tags: ['Product', 'Systems'],
    urgency: 'useful-now',
    sourceUrl: 'https://www.youtube.com/results?search_query=human+in+the+loop+ai+product',
    confidence: 89,
    author: 'Build Club',
    handle: 'buildclub',
    verified: true,
    timestamp: '6 days ago',
    postText: 'Let power users run a curated queue of recommendations with stricter thresholds and manual approvals.',
    videoTitle: 'Building Human-in-the-Loop AI Products That Users Actually Trust',
    channel: 'Build Club',
    ytViews: '318K views',
    duration: '22:53',
    thumbnailGradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
  },
  {
    id: 'x-referral-mechanic',
    type: 'x_post',
    thesis: 'Outcome-linked sharing beats vanity sharing for compounding referrals.',
    whyNow: 'Outcome-linked sharing creates compounding trust in your recommendation engine.',
    tags: ['Growth', 'Strategy'],
    urgency: 'useful-now',
    sourceUrl: 'https://x.com/search?q=referral+mechanics+ai',
    confidence: 85,
    author: 'Marcus Wei',
    handle: 'marcuswei',
    verified: true,
    timestamp: '1d',
    postText: 'Referral hack for AI products:\n\nWhen a user accepts a recommendation and it works \u2192 let them share the play with attribution.\n\nOutcome-linked sharing > vanity sharing. Compounding trust.',
    metrics: { replies: '54', reposts: '198', likes: '1.5K' },
  },
  {
    id: 'yt-attention-budget',
    type: 'youtube',
    thesis: 'Hard attention limits are product truth, not a feature.',
    whyNow: 'If your mission is to replace dangerous algorithms, hard boundaries are product truth, not a nice-to-have.',
    tags: ['Attention', 'Systems'],
    urgency: 'study-deeply',
    sourceUrl: 'https://www.youtube.com/results?search_query=attention+budget+digital+wellbeing',
    confidence: 90,
    author: 'Deep Dives',
    handle: 'deepdives',
    verified: true,
    timestamp: '3 days ago',
    postText: 'Cap daily recommendation volume and show users exactly how much decision energy remains.',
    videoTitle: 'The Attention Budget: Designing Feeds That Respect Users',
    channel: 'Deep Dives',
    ytViews: '1.2M views',
    duration: '2:14:33',
    thumbnailGradient: 'from-blue-600 via-indigo-500 to-violet-500',
  },
]

/* ─── Main Export ─── */

export function RichardIdeaMode({
  mode = 'desktop',
}: {
  isConnected: boolean
  richardStatus: RichardStatus
  onReconnect: () => void
  mode?: RichardIdeaModeVariant
  showConnectionControls?: boolean
}) {
  const isMobile = mode === 'mobile'
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  const total = IDEA_DECK.length
  const reviewedCount = Object.keys(decisions).length
  const acceptedCount = Object.values(decisions).filter((d) => d === 'accepted').length

  const submitDecision = useCallback((ideaId: string, decision: Decision) => {
    setDecisions((prev) => {
      if (prev[ideaId]) return prev
      return { ...prev, [ideaId]: decision }
    })
  }, [])

  const resetDeck = useCallback(() => setDecisions({}), [])

  return (
    <div className={cn(
      isMobile ? 'w-full pb-6' : 'mx-auto w-full max-w-[620px] py-2',
    )}>
      {/* ── Feed Header ── */}
      <div className={cn(
        'sticky top-0 z-10 backdrop-blur-xl bg-gradient-to-r from-black/80 via-[rgba(251,191,36,0.03)] to-black/80 border-b border-white/[0.06]',
        isMobile ? 'px-4 py-3' : 'px-5 py-3',
      )}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500/20 to-teal-400/10 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
                Richard Brief
              </span>
              <span className="text-[10px] text-white/15 ml-1.5">·</span>
              <span className="text-[10px] text-white/20 ml-1.5">
                {total} signals from 9,342 scanned
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/25">
            <span className="tabular-nums">{reviewedCount}/{total}</span>
            {acceptedCount > 0 && (
              <span className="text-emerald-400/60">{acceptedCount} saved</span>
            )}
            {reviewedCount > 0 && (
              <button
                onClick={resetDeck}
                className="text-white/20 hover:text-white/40 transition-colors border-0 bg-transparent p-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        {/* Progress rail — rainbow colored by tag */}
        <div className="flex gap-[2px]">
          {IDEA_DECK.map((idea) => {
            const d = decisions[idea.id]
            const color = getPrimaryTagColor(idea.tags)
            return (
              <div
                key={idea.id}
                className="h-[2px] flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: d === 'accepted'
                    ? color.accent
                    : d === 'rejected'
                    ? 'rgba(255,255,255,0.1)'
                    : `${color.accent}22`,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ── Feed Items ── */}
      <div className={cn(
        'flex flex-col',
        isMobile ? 'gap-3 px-3 pt-3' : 'gap-3 px-0 pt-3',
      )}>
        {IDEA_DECK.map((idea) => (
          <BriefCard
            key={idea.id}
            idea={idea}
            decision={decisions[idea.id]}
            onAccept={() => submitDecision(idea.id, 'accepted')}
            onReject={() => submitDecision(idea.id, 'rejected')}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* ── Summary ── */}
      {reviewedCount >= total && (
        <div className={cn(
          'text-center border-t border-white/[0.06] mt-4',
          isMobile ? 'px-4 py-6' : 'px-5 py-8',
        )}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-400/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 mb-1">
            Brief Complete
          </p>
          <p className="text-white/40 text-[13px]">
            {acceptedCount} ideas saved to queue
          </p>
          <button
            onClick={resetDeck}
            className="mt-4 px-4 py-2 rounded-lg border border-white/[0.08] text-white/30 text-[11px] font-semibold uppercase tracking-[0.06em] hover:bg-white/[0.03] hover:text-white/45 transition-all bg-transparent cursor-pointer"
          >
            Refresh brief
          </button>
        </div>
      )}
    </div>
  )
}
