'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Check,
  ExternalLink,
  Loader2,
  MessageSquareQuote,
  Mic2,
  Newspaper,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react'

type IdeaSourceType = 'x_post' | 'video' | 'podcast' | 'book' | 'news'
type Decision = 'accepted' | 'rejected'
type RichardStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
type RichardIdeaModeVariant = 'desktop' | 'mobile'

interface IdeaRecommendation {
  id: string
  type: IdeaSourceType
  title: string
  pitch: string
  whyNow: string
  sourceLabel: string
  sourceUrl: string
  confidence: number
}

interface SourceMeta {
  label: string
  icon: LucideIcon
  accentClass: string
  cta: string
}

const IDEA_DECK: IdeaRecommendation[] = [
  {
    id: 'x-seller-trust-thread',
    type: 'x_post',
    title: 'Turn seller honesty into a visible score buyers can trust',
    pitch:
      'Build a public "Seller Integrity" rail that rewards clear disclosures and penalizes missing defect details before bids close.',
    whyNow:
      'If trust is productized, your listings become easier to choose and you reduce walk-away drama after auction close.',
    sourceLabel: 'X query: seller trust scoring models',
    sourceUrl: 'https://x.com/search?q=seller%20trust%20score%20marketplace',
    confidence: 91,
  },
  {
    id: 'yt-agent-marketplaces',
    type: 'video',
    title: 'Steal the best onboarding pattern from agent-native products',
    pitch:
      'Use a two-step onboarding: first collect user objective, then auto-generate the first action plan so users feel momentum in 45 seconds.',
    whyNow:
      'Most users bounce before setup is complete. Fast first value can materially increase activation and return sessions.',
    sourceLabel: 'YouTube: agentic marketplace onboarding',
    sourceUrl: 'https://www.youtube.com/results?search_query=agentic+marketplace+onboarding',
    confidence: 88,
  },
  {
    id: 'podcast-liquidity',
    type: 'podcast',
    title: 'Design a weekly "liquidity moment" that users schedule around',
    pitch:
      'Package Monday auction close as a ritual event with pre-game signals and post-game recap to create recurring attention without doom scroll.',
    whyNow:
      'Ritual beats randomness. A predictable moment creates habit and turns users into participants instead of passive scrollers.',
    sourceLabel: 'Podcast search: marketplace liquidity loops',
    sourceUrl: 'https://www.youtube.com/results?search_query=marketplace+liquidity+podcast',
    confidence: 86,
  },
  {
    id: 'book-attention-filters',
    type: 'book',
    title: 'Add a "high-signal only" mode inspired by editorial curation',
    pitch:
      'Create a user-controlled strict filter that shows only top opportunities, with explicit reasons for why each item passed the threshold.',
    whyNow:
      'You are replacing manipulative feeds. Let users feel the difference: fewer items, higher relevance, less cognitive drain.',
    sourceLabel: 'Book: Essentialism by Greg McKeown',
    sourceUrl: 'https://www.goodreads.com/book/show/18077875-essentialism',
    confidence: 84,
  },
  {
    id: 'news-ai-agents',
    type: 'news',
    title: 'Ship a transparent "why Richard picked this" panel',
    pitch:
      'Every recommendation should include freshness, source quality, and expected upside so users can challenge the ranking logic.',
    whyNow:
      'Algorithmic feeds hide the why. Your edge is explainability and user agency, not infinite scroll addiction.',
    sourceLabel: 'News query: transparent recommender systems',
    sourceUrl: 'https://news.ycombinator.com/',
    confidence: 93,
  },
  {
    id: 'x-auction-sniper-insight',
    type: 'x_post',
    title: 'Give buyers a "conviction slider" before placing a bid',
    pitch:
      'Ask buyers to score confidence before bidding; use this to improve price discovery analytics and reduce low-intent noise.',
    whyNow:
      'You get richer data without extra friction, and users start learning their own decision quality over time.',
    sourceLabel: 'X query: buyer intent signals',
    sourceUrl: 'https://x.com/search?q=buyer%20intent%20signal%20marketplace',
    confidence: 82,
  },
  {
    id: 'yt-storytelling-results',
    type: 'video',
    title: 'Publish a weekly "wins and misses" reel from accepted ideas',
    pitch:
      'Document what Richard pitched, what you accepted, and what actually happened so users see a transparent feedback loop.',
    whyNow:
      'People trust systems that admit misses and learn quickly. This builds authenticity and long-term retention.',
    sourceLabel: 'YouTube: product learning loops',
    sourceUrl: 'https://www.youtube.com/results?search_query=product+learning+loops+startup',
    confidence: 87,
  },
  {
    id: 'podcast-agent-economy',
    type: 'podcast',
    title: 'Offer a private "agent queue" for high-stakes users',
    pitch:
      'Let power users run a curated queue of recommendations with stricter thresholds and manual approvals before anything is actioned.',
    whyNow:
      'This positions Richard as your safety buffer against chaotic public feeds while preserving full user control.',
    sourceLabel: 'Podcast search: human-in-the-loop AI products',
    sourceUrl: 'https://www.youtube.com/results?search_query=human+in+the+loop+ai+product+podcast',
    confidence: 89,
  },
  {
    id: 'book-network-effects',
    type: 'book',
    title: 'Build a referral mechanic around accepted recommendations',
    pitch:
      'When a user accepts an idea and it works, let them share the play with attribution, creating network effects from proven outcomes.',
    whyNow:
      'Outcome-linked sharing beats vanity sharing and creates compounding trust in your recommendation engine.',
    sourceLabel: 'Book: The Cold Start Problem by Andrew Chen',
    sourceUrl: 'https://www.goodreads.com/book/show/58222629-the-cold-start-problem',
    confidence: 85,
  },
  {
    id: 'news-protect-attention',
    type: 'news',
    title: 'Add an "attention budget" meter to stop overconsumption',
    pitch:
      'Cap daily recommendation volume and show users exactly how much decision energy remains, then force a stop once the budget is spent.',
    whyNow:
      'If your mission is to replace dangerous algorithms, hard boundaries are product truth, not a nice-to-have.',
    sourceLabel: 'News query: digital wellbeing and feed design',
    sourceUrl: 'https://www.theverge.com/tech',
    confidence: 90,
  },
]

const SOURCE_META: Record<IdeaSourceType, SourceMeta> = {
  x_post: {
    label: 'X Post',
    icon: MessageSquareQuote,
    accentClass: 'text-sky-300 bg-sky-500/15 border-sky-400/30',
    cta: 'Read post',
  },
  video: {
    label: 'Video',
    icon: PlayCircle,
    accentClass: 'text-red-300 bg-red-500/15 border-red-400/30',
    cta: 'Watch now',
  },
  podcast: {
    label: 'Podcast',
    icon: Mic2,
    accentClass: 'text-violet-300 bg-violet-500/15 border-violet-400/30',
    cta: 'Listen now',
  },
  book: {
    label: 'Book',
    icon: BookOpen,
    accentClass: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
    cta: 'View book',
  },
  news: {
    label: 'News',
    icon: Newspaper,
    accentClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
    cta: 'Read article',
  },
}

function DecisionRail({
  currentIndex,
  decisions,
  total,
  compact = false,
}: {
  currentIndex: number
  decisions: Record<string, Decision>
  total: number
  compact?: boolean
}) {
  return (
    <div className={cn('grid grid-cols-10', compact ? 'gap-1' : 'gap-1.5')}>
      {IDEA_DECK.slice(0, total).map((idea, index) => {
        const decision = decisions[idea.id]
        const isCurrent = index === currentIndex
        const barHeight = compact ? 'h-1' : 'h-1.5'

        if (decision === 'accepted') {
          return <div key={idea.id} className={cn(barHeight, 'rounded-full bg-emerald-400')} />
        }

        if (decision === 'rejected') {
          return <div key={idea.id} className={cn(barHeight, 'rounded-full bg-rose-400')} />
        }

        return (
          <div
            key={idea.id}
            className={cn(
              barHeight,
              'rounded-full transition-colors',
              isCurrent ? 'bg-white/60' : 'bg-white/15'
            )}
          />
        )
      })}
    </div>
  )
}

export function RichardIdeaMode({
  isConnected,
  richardStatus,
  onReconnect,
  mode = 'desktop',
  showConnectionControls = true,
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

  const acceptedIdeas = useMemo(
    () => IDEA_DECK.filter((idea) => decisions[idea.id] === 'accepted'),
    [decisions]
  )

  const reviewedCount = useMemo(
    () => Object.keys(decisions).length,
    [decisions]
  )

  const currentIndex = reviewedCount
  const currentIdea = currentIndex < total ? IDEA_DECK[currentIndex] : null
  const rejectedCount = reviewedCount - acceptedIdeas.length
  const deckComplete = reviewedCount >= total

  const submitDecision = useCallback(
    (decision: Decision) => {
      if (!currentIdea) return

      setDecisions((prev) => {
        if (prev[currentIdea.id]) return prev
        return {
          ...prev,
          [currentIdea.id]: decision,
        }
      })
    },
    [currentIdea]
  )

  const resetDeck = useCallback(() => {
    setDecisions({})
  }, [])

  useEffect(() => {
    if (deckComplete || isMobile) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const key = event.key.toLowerCase()
      if (key === 'a') {
        submitDecision('accepted')
      } else if (key === 'r') {
        submitDecision('rejected')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deckComplete, isMobile, submitDecision])

  const statusPill = (
    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.06em] text-white/70">
      {isConnected ? (
        <>
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          Live Richard
        </>
      ) : richardStatus === 'connecting' ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-300" />
          Connecting
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5 text-rose-300" />
          Offline Cache Mode
        </>
      )}
    </div>
  )

  return (
    <div className={cn(isMobile ? 'w-full px-4 pb-24 pt-4' : 'mx-auto w-full max-w-3xl py-2')}>
      <div
        className={cn(
          'relative w-full overflow-hidden border border-white/10 bg-[#0a0a0a] animate-in fade-in duration-300',
          isMobile ? 'rounded-[28px] p-4' : 'rounded-2xl p-4 sm:p-5'
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(130%_100%_at_0%_0%,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="relative">
          <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', isMobile && 'mb-3')}>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Richard Top 10 of the Day
              </div>
              <p className={cn('leading-relaxed text-white/75', isMobile ? 'text-[15px]' : 'text-sm')}>
                Richard scanned <span className="text-white">9,342</span> noisy signals today. You only see the ten ideas worth your attention.
              </p>
            </div>

            {showConnectionControls && (
              <div className="flex flex-wrap items-center gap-2">
                {statusPill}
                {!isConnected && richardStatus !== 'connecting' && (
                  <Button variant="outline" size="sm" onClick={onReconnect} className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                    Reconnect
                  </Button>
                )}
              </div>
            )}
          </div>

          {isMobile && (
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.06em] text-white/45">
              <span>{reviewedCount}/{total} reviewed</span>
              <span>{acceptedIdeas.length} accepted</span>
            </div>
          )}

          <DecisionRail
            currentIndex={currentIndex}
            decisions={decisions}
            total={total}
            compact={isMobile}
          />

          {!deckComplete && currentIdea && (
            <div
              key={currentIdea.id}
              className={cn(
                'mt-4 rounded-2xl border border-white/10 bg-black/20 animate-in fade-in slide-in-from-bottom-2 duration-300',
                isMobile ? 'p-4' : 'p-4 sm:p-5'
              )}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.08em] text-white/50">
                  Idea {currentIndex + 1} of {total}
                </p>
                <p className="text-xs text-white/50">Confidence {currentIdea.confidence}%</p>
              </div>

              <h3 className={cn('mb-3 font-semibold text-white', isMobile ? 'text-[26px] leading-[1.12]' : 'text-lg sm:text-xl')}>
                {currentIdea.title}
              </h3>

              <p className={cn('mb-4 leading-relaxed text-white/80', isMobile ? 'text-[16px]' : 'text-sm')}>
                {currentIdea.pitch}
              </p>

              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white/75">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Why this matters</p>
                <p className="mt-1 leading-relaxed">{currentIdea.whyNow}</p>
              </div>

              <div className={cn('mb-4 flex flex-wrap justify-between gap-3', isMobile ? 'items-stretch' : 'items-start')}>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${SOURCE_META[currentIdea.type].accentClass}`}
                >
                  {(() => {
                    const Icon = SOURCE_META[currentIdea.type].icon
                    return <Icon className="h-3.5 w-3.5" />
                  })()}
                  {SOURCE_META[currentIdea.type].label}
                </div>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn('text-white/85 hover:bg-white/10 hover:text-white', isMobile && 'w-full justify-between rounded-lg border border-white/10 bg-white/[0.02]')}
                >
                  <a href={currentIdea.sourceUrl} target="_blank" rel="noreferrer noopener">
                    {SOURCE_META[currentIdea.type].cta}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

              {isMobile ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => submitDecision('rejected')}
                    className="h-11 border-rose-300/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-100"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    onClick={() => submitDecision('accepted')}
                    className="h-11 bg-emerald-500 text-black hover:bg-emerald-400"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => submitDecision('rejected')}
                      className="border-rose-300/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-100"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      onClick={() => submitDecision('accepted')}
                      className="bg-emerald-500 text-black hover:bg-emerald-400"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                  </div>

                  <p className="w-full text-left text-[11px] uppercase tracking-[0.06em] text-white/40 sm:w-auto sm:text-right">
                    Keyboard: A accept, R reject
                  </p>
                </div>
              )}

              <p className="mt-3 text-xs text-white/45">Source: {currentIdea.sourceLabel}</p>
            </div>
          )}

          {deckComplete && (
            <div
              className={cn(
                'mt-4 rounded-2xl border border-white/10 bg-black/20 animate-in fade-in zoom-in-95 duration-300',
                isMobile ? 'p-4' : 'p-4 sm:p-5'
              )}
            >
              <h3 className={cn('font-semibold text-white', isMobile ? 'text-2xl' : 'text-lg sm:text-xl')}>
                Daily filter complete
              </h3>
              <p className="mt-1 text-sm text-white/75">
                You accepted <span className="text-emerald-300">{acceptedIdeas.length}</span> and rejected <span className="text-rose-300">{rejectedCount}</span> out of {total} ideas.
              </p>

              {acceptedIdeas.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {acceptedIdeas.map((idea) => (
                    <a
                      key={idea.id}
                      href={idea.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <span className="truncate pr-3">{idea.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/50 group-hover:text-white/80" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/60">No accepts yet. Run a new batch and keep only the strongest ideas.</p>
              )}

              <div className={cn('mt-5 gap-2', isMobile ? 'grid grid-cols-1' : 'flex flex-wrap')}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetDeck}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Run next Top 10
                </Button>
                {showConnectionControls && !isConnected && (
                  <Button type="button" onClick={onReconnect} className="bg-emerald-500 text-black hover:bg-emerald-400">
                    <Wifi className="h-4 w-4" />
                    Try live Richard
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
