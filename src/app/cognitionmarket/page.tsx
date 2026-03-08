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
  Radar,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

type UpgradeType = 'personality' | 'memory' | 'prompt' | 'routine' | 'guardrail' | 'voice'
type SortMode = 'fit' | 'adoption' | 'impact'
type ApplyMode = 'live' | 'sandbox'

type CognitionPack = {
  id: string
  title: string
  vendor: string
  summary: string
  type: UpgradeType
  moduleKey: string
  fitScore: number
  baselineFit: number
  impact7d: number
  adoption7d: number
  reliability: number
  activeInstalls: number
  humanBackers: number
  agentBackers: number
  trend: number[]
}

type ApplyIntent = {
  packId: string
  mode: ApplyMode
}

type ApplyPreview = {
  projectedFit: number
  projectedRecall: number
  projectedPromptQuality: number
  projectedRisk: number
}

type BlueprintReference = {
  label: string
  href: string
}

type BlueprintData = {
  hook: string
  premise: string
  personaDelta: string[]
  memoryDelta: string[]
  promptPatch: string[]
  guardrails: string[]
  rollout: string[]
  references: BlueprintReference[]
}

const COGNITION_PACKS: CognitionPack[] = [
  {
    id: 'founder-operator-v3',
    title: 'Founder-Operator Personality Pack v3',
    vendor: 'Richard Labs',
    summary: 'Sharpens tone for truth-seeking, execution pressure, and high-agency coaching.',
    type: 'personality',
    moduleKey: 'PERSONA.FOUNDER.OPS.V3',
    fitScore: 92,
    baselineFit: 92,
    impact7d: 18.4,
    adoption7d: 14.7,
    reliability: 90,
    activeInstalls: 12340,
    humanBackers: 2480,
    agentBackers: 1830,
    trend: [26, 30, 35, 41, 48, 54, 61, 72],
  },
  {
    id: 'memory-graph-lh',
    title: 'Long-Horizon Memory Graph',
    vendor: 'Open Memory Guild',
    summary: 'Organizes life events, goals, and context with durable retrieval over long timelines.',
    type: 'memory',
    moduleKey: 'MEMORY.GRAPH.LONGHORIZON',
    fitScore: 88,
    baselineFit: 88,
    impact7d: 14.1,
    adoption7d: 11.3,
    reliability: 95,
    activeInstalls: 10590,
    humanBackers: 2140,
    agentBackers: 1510,
    trend: [22, 25, 29, 33, 38, 44, 49, 57],
  },
  {
    id: 'prompt-stack-strategic',
    title: 'Strategic System Prompt Stack',
    vendor: 'Signal Forge',
    summary: 'Adds layered prompt routing for planning, critique, and tactical next actions.',
    type: 'prompt',
    moduleKey: 'PROMPT.STRATEGIC.STACK',
    fitScore: 85,
    baselineFit: 85,
    impact7d: 10.2,
    adoption7d: 9.8,
    reliability: 87,
    activeInstalls: 8490,
    humanBackers: 1790,
    agentBackers: 1290,
    trend: [30, 33, 36, 35, 39, 43, 47, 51],
  },
  {
    id: 'daily-review-loop',
    title: 'Daily Review + Check-In Loop',
    vendor: 'North Star Labs',
    summary: 'Creates consistent check-ins, progress reviews, and accountability triggers.',
    type: 'routine',
    moduleKey: 'ROUTINE.DAILY.REVIEW',
    fitScore: 79,
    baselineFit: 79,
    impact7d: 7.3,
    adoption7d: 6.2,
    reliability: 93,
    activeInstalls: 7360,
    humanBackers: 1410,
    agentBackers: 970,
    trend: [34, 35, 39, 40, 43, 46, 49, 53],
  },
  {
    id: 'attention-firewall',
    title: 'Attention Firewall Guardrail',
    vendor: 'Focus Co-op',
    summary: 'Blocks low-signal content loops and enforces intentional feed substitution.',
    type: 'guardrail',
    moduleKey: 'GUARDRAIL.ATTENTION.FIREWALL',
    fitScore: 91,
    baselineFit: 91,
    impact7d: 21.7,
    adoption7d: 19.9,
    reliability: 84,
    activeInstalls: 13220,
    humanBackers: 2860,
    agentBackers: 2010,
    trend: [18, 24, 29, 35, 42, 49, 57, 68],
  },
  {
    id: 'voice-coach-empathetic',
    title: 'Empathic Voice Coach Mode',
    vendor: 'Companion Dynamics',
    summary: 'Tunes voice and phrasing to increase trust and long-term conversation quality.',
    type: 'voice',
    moduleKey: 'VOICE.COACH.EMPATHY',
    fitScore: 74,
    baselineFit: 74,
    impact7d: -3.1,
    adoption7d: 2.7,
    reliability: 78,
    activeInstalls: 5020,
    humanBackers: 980,
    agentBackers: 640,
    trend: [58, 56, 54, 52, 49, 47, 45, 42],
  },
]

const TYPE_META: Record<
  UpgradeType,
  { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }
> = {
  personality: {
    label: 'Personality',
    icon: Sparkles,
    badge: 'text-teal-300 border-teal-500/30 bg-teal-500/10',
  },
  memory: {
    label: 'Memory',
    icon: BookOpen,
    badge: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
  },
  prompt: {
    label: 'Prompt',
    icon: BrainCircuit,
    badge: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
  },
  routine: {
    label: 'Routine',
    icon: Radar,
    badge: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  },
  guardrail: {
    label: 'Guardrail',
    icon: ShieldAlert,
    badge: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
  },
  voice: {
    label: 'Voice',
    icon: Bot,
    badge: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  },
}

const BLUEPRINT_LENS: Record<
  UpgradeType,
  {
    hook: string
    premise: string
    personality: string
    memory: string
    prompt: string
    guardrail: string
    rollout: string
  }
> = {
  personality: {
    hook: 'Narrative depth upgrade for stronger user attachment',
    premise: 'This pack changes how the agent sounds and reacts so the relationship feels more human while staying useful.',
    personality: 'Replace generic assistant tone with adaptive mentor + operator voice tuned to user goals.',
    memory: 'Increase weighting on emotionally salient memories to improve continuity in conversations.',
    prompt: 'Patch persona layer with trait constraints, motivational cadence, and anti-flattery rules.',
    guardrail: 'Reject manipulative language and keep recommendations anchored to measurable outcomes.',
    rollout: 'Start in sandbox for 48h and promote to live if user sentiment and completion rates improve.',
  },
  memory: {
    hook: 'Long-term recall engine for a true second brain',
    premise: 'This pack changes storage and retrieval so context compounds instead of resetting every session.',
    personality: 'Shifts agent behavior toward referencing prior commitments and unresolved loops.',
    memory: 'Moves from flat notes to graph-linked memory with time, topic, and goal edges.',
    prompt: 'Adds retrieval directives and conflict-resolution rules for stale or contradictory memory.',
    guardrail: 'Sensitive memory is redacted by default and only surfaced with explicit relevance.',
    rollout: 'Mirror mode first: compare graph retrieval against current memory before switching primary mode.',
  },
  prompt: {
    hook: 'Structured cognition stack for better reasoning depth',
    premise: 'This pack composes planning, critique, and execution prompts into one coordinated runtime.',
    personality: 'Agent presents clearer rationale and tradeoffs while preserving your preferred tone.',
    memory: 'Attaches prompt routes to memory tags so strategy can pull the right context automatically.',
    prompt: 'Injects role-routed prompt stages: analyst, skeptic, operator, and coach.',
    guardrail: 'Pre-flight checks block hallucinated certainty and force source confidence labels.',
    rollout: 'Apply to high-stakes tasks first, then expand to day-to-day flows if quality holds.',
  },
  routine: {
    hook: 'Behavioral scaffolding that compounds execution',
    premise: 'This pack adds recurring loops that keep goals active and visible without manual micromanagement.',
    personality: 'Agent becomes more proactive with check-ins while respecting interruption preferences.',
    memory: 'Progress snapshots are written daily and tied to each goal thread.',
    prompt: 'Adds daily/weekly review prompts with concise feedback and next-step suggestions.',
    guardrail: 'Caps reminders and enforces cooldown periods to avoid notification fatigue.',
    rollout: 'Enable one routine at a time and track adherence before stacking additional loops.',
  },
  guardrail: {
    hook: 'Attention defense layer for safer information diets',
    premise: 'This pack filters distracting content and raises only high-signal items aligned to user priorities.',
    personality: 'Agent shifts from entertainer mode to protector mode when attention risk is detected.',
    memory: 'Logs distraction triggers and recovery patterns to improve filtering over time.',
    prompt: 'Adds strict relevance tests and anti-doomscroll routing before suggestions are surfaced.',
    guardrail: 'Hard blocks addictive loops and requires explicit override with cooldown warnings.',
    rollout: 'Start with medium strictness, then auto-tighten based on user relapse patterns.',
  },
  voice: {
    hook: 'Conversational trust upgrade for long-term usage',
    premise: 'This pack tunes speaking style and cadence to reduce friction and improve coaching retention.',
    personality: 'Agent shifts to warm-direct delivery while preserving honesty under pressure.',
    memory: 'Personal phrasing preferences and emotional cues are persisted for better continuity.',
    prompt: 'Adds response-style selectors by context: coaching, tactical, reflective, or urgent.',
    guardrail: 'Disallows overdependent framing and encourages user autonomy in decision loops.',
    rollout: 'Roll out to low-stakes conversations first, then expand if retention increases.',
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function buildBlueprint(pack: CognitionPack): BlueprintData {
  const lens = BLUEPRINT_LENS[pack.type]

  return {
    hook: lens.hook,
    premise: `${lens.premise} Current fit score is ${pack.fitScore}/100 with reliability ${pack.reliability}/100 and 7d impact ${pack.impact7d >= 0 ? '+' : ''}${pack.impact7d.toFixed(1)}%.`,
    personaDelta: [
      lens.personality,
      `Aligns behavior with ${pack.humanBackers.toLocaleString()} human preference traces from similar operators.`,
      `Maintains compatibility with ${pack.agentBackers.toLocaleString()} agent co-pilot profiles.`,
    ],
    memoryDelta: [
      lens.memory,
      'Adds relevance decay so old context does not dominate current decisions.',
      'Creates retrieval summaries before long responses for tighter coherence.',
    ],
    promptPatch: [
      lens.prompt,
      'Adds confidence tags and explicit assumptions for each strategic recommendation.',
      'Escalates uncertain outputs to research mode instead of bluffing answers.',
    ],
    guardrails: [
      lens.guardrail,
      'Protects against goal drift by re-checking North Star and bottleneck context.',
      'Implements rollback checkpoint if completion rates drop for two consecutive days.',
    ],
    rollout: [
      lens.rollout,
      'Track recall quality, task completion, and session satisfaction during rollout.',
      'Promote to default only after stable metrics across one full week.',
    ],
    references: [
      {
        label: `Pack docs: ${pack.vendor}`,
        href: `https://www.google.com/search?q=${encodeURIComponent(pack.title + ' documentation')}`,
      },
      {
        label: `Community discussions for ${pack.moduleKey}`,
        href: `https://x.com/search?q=${encodeURIComponent(pack.moduleKey + ' cognition pack')}`,
      },
      {
        label: 'Prompt engineering benchmarks',
        href: 'https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard',
      },
    ],
  }
}

function simulateApply(pack: CognitionPack, mode: ApplyMode, blendPct: number): ApplyPreview | null {
  if (!Number.isFinite(blendPct) || blendPct <= 0 || blendPct > 100) return null

  const intensity = blendPct / 100
  const modeBoost = mode === 'live' ? 1 : 0.68

  return {
    projectedFit: clamp(pack.fitScore + intensity * 8 * modeBoost, 1, 99),
    projectedRecall: clamp(50 + pack.impact7d * 0.9 + intensity * 26 * modeBoost, 1, 99),
    projectedPromptQuality: clamp(55 + pack.fitScore * 0.28 + intensity * 18, 1, 99),
    projectedRisk: clamp((100 - pack.reliability) * (0.35 + intensity * 0.8) + (mode === 'live' ? 2 : 0.8), 1, 40),
  }
}

function applyPack(
  pack: CognitionPack,
  mode: ApplyMode,
  blendPct: number,
  preview: ApplyPreview
): CognitionPack {
  const adoptionLift = (blendPct / 100) * (mode === 'live' ? 6.2 : 2.1)
  const nextImpact = clamp(pack.impact7d * 0.58 + (preview.projectedFit - pack.fitScore) * 1.1, -35, 60)
  const normalizedTrend = clamp(50 + nextImpact * 1.4 + (preview.projectedFit - pack.baselineFit) * 1.3, 8, 95)

  return {
    ...pack,
    fitScore: Math.round(preview.projectedFit),
    impact7d: Number(nextImpact.toFixed(1)),
    adoption7d: Number((pack.adoption7d + adoptionLift).toFixed(1)),
    activeInstalls: mode === 'live' ? pack.activeInstalls + 1 : pack.activeInstalls,
    humanBackers: mode === 'live' ? pack.humanBackers + 1 : pack.humanBackers,
    trend: [...pack.trend.slice(1), Math.round(normalizedTrend)],
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

export default function CognitionMarketPage() {
  const [packs, setPacks] = useState<CognitionPack[]>(COGNITION_PACKS)
  const [filter, setFilter] = useState<'all' | UpgradeType>('all')
  const [sort, setSort] = useState<SortMode>('fit')
  const [openBlueprintId, setOpenBlueprintId] = useState<string | null>(null)
  const [applyIntent, setApplyIntent] = useState<ApplyIntent | null>(null)
  const [blendInput, setBlendInput] = useState('50')

  const displayed = useMemo(() => {
    const scoped = filter === 'all' ? packs : packs.filter((pack) => pack.type === filter)

    return [...scoped].sort((a, b) => {
      if (sort === 'adoption') return b.adoption7d - a.adoption7d
      if (sort === 'impact') return b.impact7d - a.impact7d
      return b.fitScore - a.fitScore
    })
  }, [filter, sort, packs])

  const stats = useMemo(() => {
    const avgFit = packs.reduce((sum, pack) => sum + pack.fitScore, 0) / packs.length
    const totalInstalls = packs.reduce((sum, pack) => sum + pack.activeInstalls, 0)
    const totalHumans = packs.reduce((sum, pack) => sum + pack.humanBackers, 0)
    const totalAgents = packs.reduce((sum, pack) => sum + pack.agentBackers, 0)

    return {
      avgFit,
      totalInstalls,
      totalHumans,
      totalAgents,
    }
  }, [packs])

  const blueprintPack = useMemo(() => {
    if (!openBlueprintId) return null
    return packs.find((pack) => pack.id === openBlueprintId) ?? null
  }, [openBlueprintId, packs])

  const blueprintData = useMemo(() => {
    if (!blueprintPack) return null
    return buildBlueprint(blueprintPack)
  }, [blueprintPack])

  const selectedPack = useMemo(() => {
    if (!applyIntent) return null
    return packs.find((pack) => pack.id === applyIntent.packId) ?? null
  }, [applyIntent, packs])

  const blendPct = Number(blendInput)

  const applyPreview = useMemo(() => {
    if (!selectedPack || !applyIntent) return null
    return simulateApply(selectedPack, applyIntent.mode, blendPct)
  }, [selectedPack, applyIntent, blendPct])

  const openApply = (packId: string, mode: ApplyMode) => {
    setApplyIntent({ packId, mode })
    setBlendInput(mode === 'live' ? '65' : '45')
  }

  const closeApply = () => {
    setApplyIntent(null)
  }

  const runApply = () => {
    if (!selectedPack || !applyIntent || !applyPreview || !Number.isFinite(blendPct) || blendPct <= 0 || blendPct > 100) {
      return
    }

    setPacks((prev) => prev.map((pack) => {
      if (pack.id !== selectedPack.id) return pack
      return applyPack(pack, applyIntent.mode, blendPct, applyPreview)
    }))

    setApplyIntent(null)
  }

  const jumpFromBlueprint = (mode: ApplyMode) => {
    if (!blueprintPack) return
    setOpenBlueprintId(null)
    openApply(blueprintPack.id, mode)
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
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
              href="/ideamarket"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white/70 transition hover:border-emerald-400/35 hover:text-emerald-300 hover:bg-emerald-500/10"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Idea Market
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-cyan-300">
            <BrainCircuit className="h-3.5 w-3.5" />
            Cognition Marketplace
          </div>
        </div>

        <section className="mb-6 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_44%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_44%)] p-5 sm:p-7">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cognition Marketplace</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">
            Upgrade your agent stack with modular cognition packs: personality architecture, memory systems, system prompt runtimes, and guardrails tuned to your North Star.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Live Installs</p>
              <p className="mt-1 text-2xl font-semibold">{stats.totalInstalls.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Average Fit</p>
              <p className="mt-1 text-2xl font-semibold">{stats.avgFit.toFixed(1)}/100</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Human Curators</p>
              <p className="mt-1 text-2xl font-semibold">{stats.totalHumans.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Agent Curators</p>
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
              All Packs
            </button>
            {(Object.keys(TYPE_META) as UpgradeType[]).map((key) => {
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
              { id: 'fit', label: 'Fit' },
              { id: 'adoption', label: 'Adoption' },
              { id: 'impact', label: 'Impact' },
            ] as const).map((option) => (
              <button
                key={option.id}
                onClick={() => setSort(option.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition',
                  sort === option.id ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {displayed.map((pack) => {
            const meta = TYPE_META[pack.type]
            const positive = pack.impact7d >= 0
            const TrendIcon = positive ? TrendingUp : TrendingDown
            const TypeIcon = meta.icon

            return (
              <article
                key={pack.id}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-white/25 lg:grid-cols-[1.8fr_0.8fr_1fr_0.9fr]"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]', meta.badge)}>
                      <TypeIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-white/40">{pack.vendor}</span>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-white/40">{pack.moduleKey}</span>
                  </div>

                  <h3 className="text-lg font-medium leading-snug sm:text-xl">{pack.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">{pack.summary}</p>

                  <button
                    onClick={() => setOpenBlueprintId(pack.id)}
                    className="mt-3 inline-flex items-center rounded-sm border border-white/20 px-2.5 py-1 text-xs uppercase tracking-[0.08em] text-white/70 transition hover:border-white/45 hover:text-white"
                  >
                    Open Blueprint
                  </button>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                    <div className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-white/40" />
                      {pack.humanBackers.toLocaleString()} humans
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Bot className="h-4 w-4 text-white/40" />
                      {pack.agentBackers.toLocaleString()} agents
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Fit Score</p>
                  <p className="mt-1 text-2xl font-semibold">{pack.fitScore}</p>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${pack.fitScore}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/55">Reliability {pack.reliability}/100</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Impact 7d</p>
                  <div className="mt-1 inline-flex items-center gap-1 text-lg font-semibold">
                    <TrendIcon className={cn('h-4 w-4', positive ? 'text-emerald-400' : 'text-rose-400')} />
                    <span className={positive ? 'text-emerald-300' : 'text-rose-300'}>
                      {positive ? '+' : ''}{pack.impact7d.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <SparkBars points={pack.trend} positive={positive} />
                  </div>
                  <p className="mt-2 text-xs text-white/55">Adoption 7d: +{pack.adoption7d.toFixed(1)}%</p>
                </div>

                <div className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Live installs</p>
                    <p className="mt-1 text-lg font-semibold">{pack.activeInstalls.toLocaleString()}</p>
                    <p className="text-xs text-white/55">Module: {pack.moduleKey}</p>
                  </div>

                  <div className="grid gap-2">
                    <button
                      onClick={() => openApply(pack.id, 'live')}
                      className="inline-flex items-center justify-center rounded-sm border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm font-medium uppercase tracking-[0.08em] text-emerald-300 transition hover:bg-emerald-500/20 hover:text-emerald-200"
                    >
                      [ Install ]
                    </button>
                    <button
                      onClick={() => openApply(pack.id, 'sandbox')}
                      className="inline-flex items-center justify-center rounded-sm border border-sky-400/60 bg-sky-500/10 px-3 py-2 text-sm font-medium uppercase tracking-[0.08em] text-sky-300 transition hover:bg-sky-500/20 hover:text-sky-200"
                    >
                      [ Sandbox ]
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
          Install velocity is signal, not truth. Keep upgrades aligned with your North Star and bottleneck, then measure whether they improve actual behavior over time.
        </section>
      </div>

      <Dialog open={Boolean(openBlueprintId)} onOpenChange={(open) => !open && setOpenBlueprintId(null)}>
        <DialogContent className="max-h-[88vh] overflow-hidden border-white/15 bg-[#05070a] p-0 text-white sm:max-w-5xl">
          {blueprintPack && blueprintData && (
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_42%)]" />

              <div className="relative max-h-[calc(88vh-80px)] overflow-y-auto p-5 sm:p-7">
                <DialogHeader className="text-left">
                  <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-white/70">
                    <BrainCircuit className="h-3.5 w-3.5 text-cyan-300" />
                    Cognition Blueprint • {blueprintPack.moduleKey}
                  </div>
                  <DialogTitle className="text-2xl leading-tight sm:text-3xl">{blueprintPack.title}</DialogTitle>
                  <DialogDescription className="text-sm text-white/60 sm:text-base">{blueprintData.hook}</DialogDescription>
                </DialogHeader>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Fit</p>
                    <p className="mt-1 text-2xl font-semibold">{blueprintPack.fitScore}/100</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Reliability</p>
                    <p className="mt-1 text-2xl font-semibold">{blueprintPack.reliability}/100</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Adoption 7d</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-300">+{blueprintPack.adoption7d.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Live Installs</p>
                    <p className="mt-1 text-2xl font-semibold">{blueprintPack.activeInstalls.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-cyan-300">Core Premise</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{blueprintData.premise}</p>

                    <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-emerald-300">Personality Delta</p>
                    <div className="mt-2 space-y-2">
                      {blueprintData.personaDelta.map((line, idx) => (
                        <div key={idx} className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5 text-sm text-white/75">
                          {line}
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-[11px] uppercase tracking-[0.08em] text-violet-300">Memory Graph Changes</p>
                    <div className="mt-2 space-y-2">
                      {blueprintData.memoryDelta.map((line, idx) => (
                        <div key={idx} className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5 text-sm text-white/75">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-emerald-300">
                      <Zap className="h-3.5 w-3.5" />
                      Prompt Patch
                    </p>
                    <div className="mt-2 space-y-2">
                      {blueprintData.promptPatch.map((line, idx) => (
                        <p key={idx} className="text-sm leading-relaxed text-white/75">• {line}</p>
                      ))}
                    </div>

                    <p className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-rose-300">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Guardrails
                    </p>
                    <div className="mt-2 space-y-2">
                      {blueprintData.guardrails.map((line, idx) => (
                        <p key={idx} className="text-sm leading-relaxed text-white/75">• {line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-amber-300">
                      <Radar className="h-3.5 w-3.5" />
                      Rollout Plan
                    </p>
                    <div className="mt-3 space-y-2">
                      {blueprintData.rollout.map((line, idx) => (
                        <div key={idx} className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5 text-sm text-white/80">
                          <span className="mr-2 text-cyan-300">{idx + 1}.</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Reference Feed</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {blueprintData.references.map((ref) => (
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
                    onClick={() => setOpenBlueprintId(null)}
                    className="border-white/20 bg-white/[0.02] text-white hover:bg-white/[0.08]"
                  >
                    Close
                  </Button>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => jumpFromBlueprint('sandbox')}
                      className="bg-sky-500 text-white hover:bg-sky-400"
                    >
                      Sandbox This Pack
                    </Button>
                    <Button
                      onClick={() => jumpFromBlueprint('live')}
                      className="bg-emerald-500 text-black hover:bg-emerald-400"
                    >
                      Install Live
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(applyIntent)} onOpenChange={(open) => !open && closeApply()}>
        <DialogContent className="border-white/15 bg-[#090a0d] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {applyIntent?.mode === 'live' ? 'Install cognition pack' : 'Sandbox cognition pack'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Blend this pack into your current agent stack and preview projected cognition deltas before applying.
            </DialogDescription>
          </DialogHeader>

          {selectedPack && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Pack</p>
                <p className="mt-1 text-sm font-medium">{selectedPack.title}</p>
                <p className="mt-1 text-xs text-white/55">{selectedPack.moduleKey} • Fit {selectedPack.fitScore}/100</p>
              </div>

              <div>
                <label htmlFor="blend" className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-white/45">
                  Blend allocation (% of stack)
                </label>
                <input
                  id="blend"
                  type="number"
                  min={1}
                  max={100}
                  step={5}
                  value={blendInput}
                  onChange={(e) => setBlendInput(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-white/40"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[25, 50, 75, 100].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBlendInput(String(value))}
                      className="rounded-sm border border-white/15 px-2.5 py-1 text-xs text-white/70 transition hover:border-white/35 hover:text-white"
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              {applyPreview ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Projected Fit</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-300">{applyPreview.projectedFit.toFixed(1)}/100</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Projected Recall</p>
                    <p className="mt-1 text-lg font-semibold">{applyPreview.projectedRecall.toFixed(1)}/100</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Prompt Coherence</p>
                    <p className="mt-1 text-lg font-semibold">{applyPreview.projectedPromptQuality.toFixed(1)}/100</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Drift Risk</p>
                    <p className={cn('mt-1 text-lg font-semibold', applyPreview.projectedRisk < 15 ? 'text-emerald-300' : 'text-rose-300')}>
                      {applyPreview.projectedRisk.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-rose-300">Enter a blend value from 1-100 to preview stack impact.</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeApply} className="border-white/20 bg-white/[0.02] text-white hover:bg-white/[0.08]">
              Cancel
            </Button>
            <Button
              onClick={runApply}
              disabled={!applyPreview}
              className={cn(
                applyIntent?.mode === 'live'
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                  : 'bg-sky-500 text-white hover:bg-sky-400'
              )}
            >
              {applyIntent?.mode === 'live' ? 'Confirm Install' : 'Run Sandbox'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
