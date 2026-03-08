'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  BookOpen,
  Bot,
  BrainCircuit,
  ExternalLink,
  Flame,
  HeartPulse,
  LibraryBig,
  Microscope,
  PlayCircle,
  Podcast,
  Radar,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

type IdeaType = 'video' | 'research' | 'health' | 'podcast' | 'book' | 'classic'
type SortMode = 'momentum' | 'volume' | 'conviction'
type TradeSide = 'invest' | 'short'

type IdeaListing = {
  id: string
  title: string
  source: string
  type: IdeaType
  ticker: string
  marketCapM: number
  baselineMarketCapM: number
  capital24hK: number
  momentum24h: number
  convictionScore: number
  humanBackers: number
  agentBackers: number
  sparkline: number[]
}

type TradeIntent = {
  ideaId: string
  side: TradeSide
}

type TradePreview = {
  newMarketCapUsd: number
  impactPct: number
  priceBefore: number
  priceAfter: number
  tokenDelta: number
  usdcDelta: number
}

type ThesisReference = {
  label: string
  href: string
}

type IdeaThesis = {
  hook: string
  premise: string
  whyNow: string[]
  bullCase: string[]
  bearCase: string[]
  execution: string[]
  references: ThesisReference[]
}

const ONE_MILLION = 1_000_000
const IDEA_TOKEN_SUPPLY = 1_000_000
const VIRTUAL_RESERVE_RATIO = 0.5

const IDEA_LISTINGS: IdeaListing[] = [
  {
    id: 'viral-short-reframing',
    title: 'Viral short: 30-second reframing habit for stress spirals',
    source: 'Video clip',
    type: 'video',
    ticker: 'REFRAME',
    marketCapM: 2.8,
    baselineMarketCapM: 2.8,
    capital24hK: 490,
    momentum24h: 18.2,
    convictionScore: 81,
    humanBackers: 1360,
    agentBackers: 450,
    sparkline: [22, 28, 31, 30, 34, 40, 44, 52],
  },
  {
    id: 'quantum-battery-paper',
    title: 'Physics paper: room-temperature quantum battery benchmark',
    source: 'ArXiv paper',
    type: 'research',
    ticker: 'QBAT',
    marketCapM: 6.2,
    baselineMarketCapM: 6.2,
    capital24hK: 930,
    momentum24h: 9.4,
    convictionScore: 88,
    humanBackers: 920,
    agentBackers: 1210,
    sparkline: [35, 33, 37, 39, 45, 47, 49, 53],
  },
  {
    id: 'metabolic-flex-paper',
    title: 'Health paper: metabolic flexibility protocol beats control',
    source: 'Clinical preprint',
    type: 'health',
    ticker: 'METAFLEX',
    marketCapM: 4.1,
    baselineMarketCapM: 4.1,
    capital24hK: 770,
    momentum24h: 13.7,
    convictionScore: 84,
    humanBackers: 1460,
    agentBackers: 780,
    sparkline: [26, 29, 31, 35, 38, 41, 47, 49],
  },
  {
    id: 'founder-ops-podcast',
    title: 'Podcast: founder ops stack for 10x weekly output',
    source: 'Long-form podcast',
    type: 'podcast',
    ticker: 'OPS10X',
    marketCapM: 3.3,
    baselineMarketCapM: 3.3,
    capital24hK: 410,
    momentum24h: -2.9,
    convictionScore: 67,
    humanBackers: 1100,
    agentBackers: 590,
    sparkline: [58, 56, 54, 55, 53, 51, 50, 47],
  },
  {
    id: 'new-book-agency',
    title: 'New book: practical agency loops for AI-native teams',
    source: 'Book release',
    type: 'book',
    ticker: 'AGENCY',
    marketCapM: 2.1,
    baselineMarketCapM: 2.1,
    capital24hK: 290,
    momentum24h: 7.5,
    convictionScore: 73,
    humanBackers: 840,
    agentBackers: 320,
    sparkline: [24, 23, 25, 29, 31, 34, 36, 38],
  },
  {
    id: 'old-book-antifragile',
    title: 'Old book rotation: Antifragile signal back in trend',
    source: 'Classic book',
    type: 'classic',
    ticker: 'ANTI',
    marketCapM: 5.7,
    baselineMarketCapM: 5.7,
    capital24hK: 620,
    momentum24h: 11.9,
    convictionScore: 92,
    humanBackers: 1750,
    agentBackers: 990,
    sparkline: [19, 21, 25, 28, 31, 37, 39, 43],
  },
  {
    id: 'viral-comedy-relief',
    title: 'Funny viral video: social anxiety exposure by humor',
    source: 'Video thread',
    type: 'video',
    ticker: 'LOLRX',
    marketCapM: 1.9,
    baselineMarketCapM: 1.9,
    capital24hK: 360,
    momentum24h: 15.2,
    convictionScore: 70,
    humanBackers: 1490,
    agentBackers: 270,
    sparkline: [14, 18, 20, 25, 27, 33, 36, 41],
  },
  {
    id: 'aging-paper-biomarkers',
    title: 'Health paper: low-cost aging biomarkers from wearables',
    source: 'Research summary',
    type: 'health',
    ticker: 'BIOAGE',
    marketCapM: 7.4,
    baselineMarketCapM: 7.4,
    capital24hK: 1150,
    momentum24h: 22.8,
    convictionScore: 95,
    humanBackers: 1320,
    agentBackers: 1660,
    sparkline: [20, 23, 27, 31, 35, 40, 46, 55],
  },
]

const TYPE_META: Record<
  IdeaType,
  { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }
> = {
  video: {
    label: 'Video',
    icon: PlayCircle,
    badge: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  },
  research: {
    label: 'Research',
    icon: Microscope,
    badge: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
  },
  health: {
    label: 'Health',
    icon: HeartPulse,
    badge: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  },
  podcast: {
    label: 'Podcast',
    icon: Podcast,
    badge: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  },
  book: {
    label: 'Book',
    icon: BookOpen,
    badge: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
  },
  classic: {
    label: 'Classic',
    icon: LibraryBig,
    badge: 'text-orange-300 border-orange-500/30 bg-orange-500/10',
  },
}

const THESIS_LENS: Record<
  IdeaType,
  {
    hook: string
    frame: string
    catalyst: string
    risk: string
    execution: string
  }
> = {
  video: {
    hook: 'Attention-native meme with conversion potential',
    frame: 'Video ideas can convert faster than papers when distribution velocity is the edge.',
    catalyst: 'Remix velocity and repost growth within 24-72 hours.',
    risk: 'Shallow engagement may inflate hype without durable outcomes.',
    execution: 'Pair clip-level virality with one practical action and retention tracking.',
  },
  research: {
    hook: 'Technical edge thesis with longer durability',
    frame: 'Research ideas are slower to spread but stronger as long-term moat builders.',
    catalyst: 'Replication, citations, and secondary explainers from trusted operators.',
    risk: 'Headline overfit without practical deployment path.',
    execution: 'Translate paper into one testable user-facing implementation this week.',
  },
  health: {
    hook: 'Behavior-change thesis with personal ROI',
    frame: 'Health ideas move when they produce measurable outcomes for real users quickly.',
    catalyst: 'Users reporting sleep, energy, or recovery improvements in under 14 days.',
    risk: 'Protocol complexity reduces compliance and overstates expected benefit.',
    execution: 'Ship as low-friction habit stack with adherence and impact checkpoints.',
  },
  podcast: {
    hook: 'High-context narrative with operator signal',
    frame: 'Podcasts can reframe strategy deeply, creating high-conviction behavioral shifts.',
    catalyst: 'Quote clipping, timestamp sharing, and creator crossover loops.',
    risk: 'Information density without action translation.',
    execution: 'Auto-extract playbooks and convert to 3 executable tasks per episode.',
  },
  book: {
    hook: 'Framework thesis for compounding decision quality',
    frame: 'Books anchor long-term cognition and become reusable operating systems.',
    catalyst: 'Framework adoption in weekly planning and team rituals.',
    risk: 'Abstract insight with low execution transfer.',
    execution: 'Build one-page framework cards + one practical experiment per chapter.',
  },
  classic: {
    hook: 'Proven signal re-priced by current context',
    frame: 'Classic ideas re-enter when modern conditions make old principles newly valuable.',
    catalyst: 'Cross-generation references and measurable second-order adoption.',
    risk: 'Nostalgia premium disconnected from present constraints.',
    execution: 'Repackage core principles into modern workflows and benchmark outcomes.',
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function buildThesis(idea: IdeaListing): IdeaThesis {
  const lens = THESIS_LENS[idea.type]
  const marketCapUsd = idea.marketCapM * ONE_MILLION

  return {
    hook: lens.hook,
    premise: `${lens.frame} Current market cap is $${(marketCapUsd / ONE_MILLION).toFixed(2)}M and conviction is ${idea.convictionScore}/100, indicating ${idea.momentum24h >= 0 ? 'rising' : 'fragile'} confidence from both humans and agents.`,
    whyNow: [
      `${lens.catalyst}`,
      `24h capital flow is $${idea.capital24hK.toLocaleString()}K with ${idea.humanBackers.toLocaleString()} human and ${idea.agentBackers.toLocaleString()} agent participants.`,
      `Momentum signal currently sits at ${idea.momentum24h >= 0 ? '+' : ''}${idea.momentum24h.toFixed(1)}%.`,
    ],
    bullCase: [
      'Distribution + utility are both present, which is rare in early idea markets.',
      'Agent participation increases discovery speed and reduces lag on signal shifts.',
      'If execution proofs appear, this can re-rate quickly into a higher conviction band.',
    ],
    bearCase: [
      lens.risk,
      'Capital concentration could create temporary squeezes and false positives.',
      'Outcome tracking can lag narrative spread, causing short-term overpricing.',
    ],
    execution: [
      lens.execution,
      'Define 2 falsifiable metrics before increasing allocation.',
      'Re-evaluate position after the next 24h capital window and sentiment drift.',
    ],
    references: [
      {
        label: `Primary source: ${idea.source}`,
        href: `https://www.google.com/search?q=${encodeURIComponent(idea.title)}`,
      },
      {
        label: `Discussion stream for ${idea.ticker}`,
        href: `https://x.com/search?q=${encodeURIComponent(idea.ticker + ' idea')}`,
      },
      {
        label: 'Comparable ideas by momentum',
        href: 'https://news.ycombinator.com/',
      },
    ],
  }
}

function simulateTrade(idea: IdeaListing, side: TradeSide, capitalUsd: number): TradePreview | null {
  if (!Number.isFinite(capitalUsd) || capitalUsd <= 0) return null

  const marketCapUsd = idea.marketCapM * ONE_MILLION
  const priceBefore = marketCapUsd / IDEA_TOKEN_SUPPLY
  const usdReserve = marketCapUsd * VIRTUAL_RESERVE_RATIO
  const tokenReserve = IDEA_TOKEN_SUPPLY * VIRTUAL_RESERVE_RATIO
  const k = usdReserve * tokenReserve

  if (side === 'invest') {
    const newUsdReserve = usdReserve + capitalUsd
    const newTokenReserve = k / newUsdReserve
    const tokenOut = tokenReserve - newTokenReserve
    const priceAfter = newUsdReserve / newTokenReserve
    const newMarketCapUsd = priceAfter * IDEA_TOKEN_SUPPLY

    return {
      newMarketCapUsd,
      impactPct: ((newMarketCapUsd - marketCapUsd) / marketCapUsd) * 100,
      priceBefore,
      priceAfter,
      tokenDelta: tokenOut,
      usdcDelta: -capitalUsd,
    }
  }

  const tokenIn = capitalUsd / priceBefore
  const newTokenReserve = tokenReserve + tokenIn
  const newUsdReserve = k / newTokenReserve
  const usdOut = usdReserve - newUsdReserve
  const priceAfter = newUsdReserve / newTokenReserve
  const newMarketCapUsd = priceAfter * IDEA_TOKEN_SUPPLY

  return {
    newMarketCapUsd,
    impactPct: ((newMarketCapUsd - marketCapUsd) / marketCapUsd) * 100,
    priceBefore,
    priceAfter,
    tokenDelta: -tokenIn,
    usdcDelta: usdOut,
  }
}

function applyTradeToIdea(
  idea: IdeaListing,
  side: TradeSide,
  capitalUsd: number,
  preview: TradePreview
): IdeaListing {
  const marketCapBeforeUsd = idea.marketCapM * ONE_MILLION
  const marketCapAfterM = preview.newMarketCapUsd / ONE_MILLION
  const convictionShift = Math.min(10, (capitalUsd / marketCapBeforeUsd) * 120)
  const nextConviction = clamp(
    idea.convictionScore + (side === 'invest' ? convictionShift : -convictionShift),
    1,
    99
  )

  const nextMomentum = clamp(idea.momentum24h * 0.55 + preview.impactPct * 0.45, -99, 99)
  const normalizedPoint = clamp(
    50 + ((marketCapAfterM - idea.baselineMarketCapM) / idea.baselineMarketCapM) * 60,
    10,
    95
  )

  return {
    ...idea,
    marketCapM: marketCapAfterM,
    capital24hK: idea.capital24hK + capitalUsd / 1000,
    momentum24h: nextMomentum,
    convictionScore: nextConviction,
    humanBackers: idea.humanBackers + 1,
    sparkline: [...idea.sparkline.slice(1), Math.round(normalizedPoint)],
  }
}

function SparkBars({ points, positive }: { points: number[]; positive: boolean }) {
  return (
    <div className="flex h-10 items-end gap-1">
      {points.map((value, idx) => (
        <span
          key={idx}
          className={cn(
            'w-1.5 rounded-sm transition-all',
            positive ? 'bg-emerald-400/80' : 'bg-rose-400/80'
          )}
          style={{ height: `${Math.max(12, Math.min(100, value))}%` }}
        />
      ))}
    </div>
  )
}

export default function IdeaMarketPage() {
  const [ideaListings, setIdeaListings] = useState<IdeaListing[]>(IDEA_LISTINGS)
  const [filter, setFilter] = useState<'all' | IdeaType>('all')
  const [sort, setSort] = useState<SortMode>('momentum')
  const [tradeIntent, setTradeIntent] = useState<TradeIntent | null>(null)
  const [capitalInput, setCapitalInput] = useState('10000')
  const [openThesisId, setOpenThesisId] = useState<string | null>(null)

  const displayed = useMemo(() => {
    const scoped = filter === 'all'
      ? ideaListings
      : ideaListings.filter((idea) => idea.type === filter)

    return [...scoped].sort((a, b) => {
      if (sort === 'volume') return b.capital24hK - a.capital24hK
      if (sort === 'conviction') return b.convictionScore - a.convictionScore
      return b.momentum24h - a.momentum24h
    })
  }, [filter, sort, ideaListings])

  const stats = useMemo(() => {
    const totalCap = ideaListings.reduce((sum, item) => sum + item.marketCapM, 0)
    const totalCapital24h = ideaListings.reduce((sum, item) => sum + item.capital24hK, 0)
    const totalHumans = ideaListings.reduce((sum, item) => sum + item.humanBackers, 0)
    const totalAgents = ideaListings.reduce((sum, item) => sum + item.agentBackers, 0)

    return {
      totalCap,
      totalCapital24h,
      totalHumans,
      totalAgents,
    }
  }, [ideaListings])

  const selectedIdea = useMemo(() => {
    if (!tradeIntent) return null
    return ideaListings.find((idea) => idea.id === tradeIntent.ideaId) ?? null
  }, [ideaListings, tradeIntent])

  const thesisIdea = useMemo(() => {
    if (!openThesisId) return null
    return ideaListings.find((idea) => idea.id === openThesisId) ?? null
  }, [ideaListings, openThesisId])

  const thesisData = useMemo(() => {
    if (!thesisIdea) return null
    return buildThesis(thesisIdea)
  }, [thesisIdea])

  const capitalUsd = Number(capitalInput)

  const tradePreview = useMemo(() => {
    if (!selectedIdea || !tradeIntent) return null
    return simulateTrade(selectedIdea, tradeIntent.side, capitalUsd)
  }, [selectedIdea, tradeIntent, capitalUsd])

  const openTrade = (ideaId: string, side: TradeSide) => {
    setTradeIntent({ ideaId, side })
    setCapitalInput('10000')
  }

  const closeTrade = () => {
    setTradeIntent(null)
  }

  const executeTrade = () => {
    if (!tradeIntent || !selectedIdea || !tradePreview || !Number.isFinite(capitalUsd) || capitalUsd <= 0) {
      return
    }

    setIdeaListings((prev) => prev.map((idea) => {
      if (idea.id !== selectedIdea.id) return idea
      return applyTradeToIdea(idea, tradeIntent.side, capitalUsd, tradePreview)
    }))

    setTradeIntent(null)
  }

  const jumpToTradeFromThesis = (side: TradeSide) => {
    if (!thesisIdea) return
    setOpenThesisId(null)
    openTrade(thesisIdea.id, side)
  }

  return (
    <main className="min-h-screen bg-[#06080a] text-white">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white/70 transition hover:border-white/30 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href="/cognitionmarket"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white/70 transition hover:border-cyan-400/35 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              Cognition Market
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Idea Market Beta
          </div>
        </div>

        <section className="mb-6 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_45%)] p-5 sm:p-7">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Idea Marketplace</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">
            Agents and humans invest conviction in ideas. Track what is actually helping real people improve, from viral videos to old books and bleeding-edge research.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Market Cap</p>
              <p className="mt-1 text-2xl font-semibold">${stats.totalCap.toFixed(1)}M</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">24h Capital</p>
              <p className="mt-1 text-2xl font-semibold">${stats.totalCapital24h.toLocaleString()}K</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Human Backers</p>
              <p className="mt-1 text-2xl font-semibold">{stats.totalHumans.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Agent Backers</p>
              <p className="mt-1 text-2xl font-semibold">{stats.totalAgents.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition',
                filter === 'all'
                  ? 'border-white/40 bg-white/10 text-white'
                  : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white'
              )}
            >
              All
            </button>
            {(Object.keys(TYPE_META) as IdeaType[]).map((key) => {
              const Icon = TYPE_META[key].icon
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition',
                    filter === key
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {TYPE_META[key].label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-1">
            {([
              { id: 'momentum', label: 'Momentum' },
              { id: 'volume', label: 'Capital' },
              { id: 'conviction', label: 'Conviction' },
            ] as const).map((option) => (
              <button
                key={option.id}
                onClick={() => setSort(option.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition',
                  sort === option.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/55 hover:text-white'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {displayed.map((idea) => {
            const meta = TYPE_META[idea.type]
            const positive = idea.momentum24h >= 0
            const MomentumIcon = positive ? TrendingUp : TrendingDown
            const TypeIcon = meta.icon

            return (
              <article
                key={idea.id}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-white/25 lg:grid-cols-[1.8fr_0.9fr_1.1fr_0.9fr]"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]', meta.badge)}>
                      <TypeIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-white/40">{idea.source}</span>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-white/40">${idea.ticker}</span>
                  </div>

                  <h3 className="text-lg font-medium leading-snug sm:text-xl">{idea.title}</h3>

                  <button
                    onClick={() => setOpenThesisId(idea.id)}
                    className="mt-2 inline-flex items-center rounded-sm border border-white/20 px-2.5 py-1 text-xs uppercase tracking-[0.08em] text-white/70 transition hover:border-white/45 hover:text-white"
                  >
                    Open Thesis
                  </button>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                    <div className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-white/40" />
                      {idea.humanBackers.toLocaleString()} humans
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Bot className="h-4 w-4 text-white/40" />
                      {idea.agentBackers.toLocaleString()} agents
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Conviction</p>
                  <p className="mt-1 text-2xl font-semibold">{idea.convictionScore}</p>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${idea.convictionScore}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Momentum 24h</p>
                  <div className="mt-1 inline-flex items-center gap-1 text-lg font-semibold">
                    <MomentumIcon className={cn('h-4 w-4', positive ? 'text-emerald-400' : 'text-rose-400')} />
                    <span className={positive ? 'text-emerald-300' : 'text-rose-300'}>
                      {positive ? '+' : ''}{idea.momentum24h.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <SparkBars points={idea.sparkline} positive={positive} />
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Capital</p>
                    <p className="mt-1 text-lg font-semibold">${idea.capital24hK.toLocaleString()}K</p>
                    <p className="text-xs text-white/55">MCAP ${idea.marketCapM.toFixed(2)}M</p>
                  </div>

                  <div className="grid gap-2">
                    <button
                      onClick={() => openTrade(idea.id, 'invest')}
                      className="inline-flex items-center justify-center rounded-sm border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm font-medium uppercase tracking-[0.08em] text-emerald-300 transition hover:bg-emerald-500/20 hover:text-emerald-200"
                    >
                      [ Invest ]
                    </button>
                    <button
                      onClick={() => openTrade(idea.id, 'short')}
                      className="inline-flex items-center justify-center rounded-sm border border-rose-400/55 bg-rose-500/10 px-3 py-2 text-sm font-medium uppercase tracking-[0.08em] text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200"
                    >
                      [ Short ]
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/65">
          <div className="mb-1 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-amber-300">
            <Flame className="h-3.5 w-3.5" />
            Mechanic
          </div>
          Human and agent capital are signals, not truth. The market helps surface ideas worth testing, and Richard still filters by your North Star, bottleneck, and personal memory.
        </section>
      </div>

      <Dialog open={Boolean(openThesisId)} onOpenChange={(open) => !open && setOpenThesisId(null)}>
        <DialogContent className="max-h-[88vh] overflow-hidden border-white/15 bg-[#05070a] p-0 text-white sm:max-w-5xl">
          {thesisIdea && thesisData && (
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.10),transparent_42%)]" />

              <div className="relative max-h-[calc(88vh-80px)] overflow-y-auto p-5 sm:p-7">
                <DialogHeader className="text-left">
                  <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-white/70">
                    <BrainCircuit className="h-3.5 w-3.5 text-emerald-300" />
                    Thesis Room • ${thesisIdea.ticker}
                  </div>
                  <DialogTitle className="text-2xl leading-tight sm:text-3xl">{thesisIdea.title}</DialogTitle>
                  <DialogDescription className="text-sm text-white/60 sm:text-base">{thesisData.hook}</DialogDescription>
                </DialogHeader>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Market Cap</p>
                    <p className="mt-1 text-2xl font-semibold">${thesisIdea.marketCapM.toFixed(2)}M</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Conviction</p>
                    <p className="mt-1 text-2xl font-semibold">{thesisIdea.convictionScore}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Momentum</p>
                    <p className={cn('mt-1 text-2xl font-semibold', thesisIdea.momentum24h >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
                      {thesisIdea.momentum24h >= 0 ? '+' : ''}{thesisIdea.momentum24h.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">24h Capital</p>
                    <p className="mt-1 text-2xl font-semibold">${thesisIdea.capital24hK.toLocaleString()}K</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-emerald-300">Core Premise</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{thesisData.premise}</p>

                    <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-cyan-300">Why Now</p>
                    <div className="mt-2 space-y-2">
                      {thesisData.whyNow.map((line, idx) => (
                        <div key={idx} className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5 text-sm text-white/75">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-emerald-300">
                      <Zap className="h-3.5 w-3.5" />
                      Bull Case
                    </p>
                    <div className="mt-2 space-y-2">
                      {thesisData.bullCase.map((line, idx) => (
                        <p key={idx} className="text-sm leading-relaxed text-white/75">• {line}</p>
                      ))}
                    </div>

                    <p className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-rose-300">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Bear Case
                    </p>
                    <div className="mt-2 space-y-2">
                      {thesisData.bearCase.map((line, idx) => (
                        <p key={idx} className="text-sm leading-relaxed text-white/75">• {line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-amber-300">
                      <Radar className="h-3.5 w-3.5" />
                      Execution Playbook
                    </p>
                    <div className="mt-3 space-y-2">
                      {thesisData.execution.map((line, idx) => (
                        <div key={idx} className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5 text-sm text-white/80">
                          <span className="mr-2 text-emerald-300">{idx + 1}.</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Reference Feed</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {thesisData.references.map((ref) => (
                      <a
                        key={ref.href}
                        href={ref.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/75 transition hover:border-white/25 hover:text-white"
                      >
                        <span>{ref.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-white/45 group-hover:text-white/80" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative border-t border-white/10 bg-[#05070a]/90 px-5 py-4 sm:px-7">
                <DialogFooter className="gap-2 sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setOpenThesisId(null)}
                    className="border-white/20 bg-white/[0.02] text-white hover:bg-white/[0.08]"
                  >
                    Close
                  </Button>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => jumpToTradeFromThesis('short')}
                      className="bg-rose-500 text-white hover:bg-rose-400"
                    >
                      Short This Thesis
                    </Button>
                    <Button
                      onClick={() => jumpToTradeFromThesis('invest')}
                      className="bg-emerald-500 text-black hover:bg-emerald-400"
                    >
                      Invest This Thesis
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(tradeIntent)} onOpenChange={(open) => !open && closeTrade()}>
        <DialogContent className="border-white/15 bg-[#090a0d] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {tradeIntent?.side === 'short' ? 'Short idea' : 'Invest in idea'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              CPMM math (`x*y=k`) with meme-coin style pricing. Virtual reserves are 50% of market cap on each side.
            </DialogDescription>
          </DialogHeader>

          {selectedIdea && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Idea</p>
                <p className="mt-1 text-sm font-medium">{selectedIdea.title}</p>
                <p className="mt-1 text-xs text-white/55">${selectedIdea.ticker} • MCAP ${selectedIdea.marketCapM.toFixed(2)}M</p>
              </div>

              <div>
                <label htmlFor="capital" className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-white/45">
                  Capital allocation (USD)
                </label>
                <input
                  id="capital"
                  type="number"
                  min={1}
                  step={100}
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-white/40"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1_000, 10_000, 100_000, 1_000_000].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCapitalInput(String(value))}
                      className="rounded-sm border border-white/15 px-2.5 py-1 text-xs text-white/70 transition hover:border-white/35 hover:text-white"
                    >
                      ${value.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {tradePreview ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Market cap after</p>
                    <p className="mt-1 text-lg font-semibold">${(tradePreview.newMarketCapUsd / ONE_MILLION).toFixed(2)}M</p>
                    <p className={cn('text-xs', tradePreview.impactPct >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
                      {tradePreview.impactPct >= 0 ? '+' : ''}{tradePreview.impactPct.toFixed(2)}%
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Token price</p>
                    <p className="mt-1 text-lg font-semibold">
                      ${tradePreview.priceBefore.toFixed(4)} → ${tradePreview.priceAfter.toFixed(4)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/30 p-3 sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Execution preview</p>
                    {tradeIntent?.side === 'invest' ? (
                      <p className="mt-1 text-sm text-white/80">
                        Spend ${capitalUsd.toLocaleString()} USDC to buy approximately {tradePreview.tokenDelta.toLocaleString(undefined, { maximumFractionDigits: 0 })} idea tokens.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-white/80">
                        Sell approximately {Math.abs(tradePreview.tokenDelta).toLocaleString(undefined, { maximumFractionDigits: 0 })} borrowed idea tokens and receive about ${tradePreview.usdcDelta.toLocaleString(undefined, { maximumFractionDigits: 0 })} USDC.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-rose-300">Enter a positive capital amount to preview trade impact.</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeTrade} className="border-white/20 bg-white/[0.02] text-white hover:bg-white/[0.08]">
              Cancel
            </Button>
            <Button
              onClick={executeTrade}
              disabled={!tradePreview}
              className={cn(
                tradeIntent?.side === 'short'
                  ? 'bg-rose-500 text-white hover:bg-rose-400'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
              )}
            >
              {tradeIntent?.side === 'short' ? 'Confirm Short' : 'Confirm Invest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
