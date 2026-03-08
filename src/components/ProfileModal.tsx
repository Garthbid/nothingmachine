'use client'

import { useMemo, useState } from 'react'
import { useProfileStore, type UserProfile } from '@/lib/profile-store'
import { useEditorStore } from '@/lib/editor-store'
import { rankBrainTemplates } from '@/lib/brain-templates'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronRight,
  Lock,
  Mail,
  Sparkles,
  Target,
  UserRound,
  X,
} from 'lucide-react'

type StepId = 'account' | 'identity' | 'interests' | 'template'

const STEPS: Array<{ id: StepId; label: string; hint: string }> = [
  { id: 'account', label: 'Sign Up', hint: 'Create your account' },
  { id: 'identity', label: 'Profile', hint: 'Set your name + main goal' },
  { id: 'interests', label: 'Interests', hint: 'Tell us what you care about' },
  { id: 'template', label: 'Brain', hint: 'Pick your agent brain' },
]

const INTEREST_SUGGESTIONS = [
  'AI',
  'Startups',
  'Health',
  'Fitness',
  'Investing',
  'Content',
  'YouTube',
  'Sales',
  'Coding',
  'Productivity',
  'Psychology',
  'Learning',
  'Books',
  'Podcast',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useProfileStore()

  if (!open) return null

  return <ProfileModalFlow profile={profile} onClose={onClose} />
}

function ProfileModalFlow({ profile, onClose }: { profile: UserProfile | null; onClose: () => void }) {
  const { setProfile } = useProfileStore()
  const { setFieldValue } = useEditorStore()

  const isReturning = Boolean(profile?.onboardingCompleted)

  const [step, setStep] = useState<StepId>(isReturning ? 'identity' : 'account')
  const [email, setEmail] = useState(profile?.email || '')
  const [password, setPassword] = useState('')
  const [name, setName] = useState(profile?.name || '')
  const [mainGoal, setMainGoal] = useState(profile?.mainGoal || '')
  const [interestInput, setInterestInput] = useState('')
  const [keyInterests, setKeyInterests] = useState<string[]>(profile?.keyInterests || [])
  const [selectedTemplateId, setSelectedTemplateId] = useState(profile?.selectedTemplateId || '')

  const visibleSteps = isReturning ? STEPS.filter((item) => item.id !== 'account') : STEPS

  const rankedTemplates = useMemo(
    () => rankBrainTemplates(mainGoal, keyInterests, 5),
    [mainGoal, keyInterests]
  )

  const resolvedTemplateId =
    rankedTemplates.some((item) => item.template.id === selectedTemplateId)
      ? selectedTemplateId
      : rankedTemplates[0]?.template.id || ''

  const activeIndex = visibleSteps.findIndex((item) => item.id === step)
  const currentStep = visibleSteps[Math.max(activeIndex, 0)]

  const canContinueFromAccount = isReturning || (EMAIL_REGEX.test(email.trim()) && password.length >= 6)
  const canContinueFromIdentity = name.trim().length >= 2 && mainGoal.trim().length >= 8
  const canContinueFromInterests = keyInterests.length > 0
  const canFinish = Boolean(resolvedTemplateId)

  const addInterest = (raw: string) => {
    const value = raw.trim().replace(/\s+/g, ' ')
    if (!value) return
    if (keyInterests.some((item) => item.toLowerCase() === value.toLowerCase())) return
    setKeyInterests((prev) => [...prev, value].slice(0, 10))
    setInterestInput('')
  }

  const removeInterest = (interest: string) => {
    setKeyInterests((prev) => prev.filter((item) => item !== interest))
  }

  const goBack = () => {
    const index = visibleSteps.findIndex((item) => item.id === step)
    if (index <= 0) return
    setStep(visibleSteps[index - 1].id)
  }

  const goNext = () => {
    const index = visibleSteps.findIndex((item) => item.id === step)
    if (index < 0 || index >= visibleSteps.length - 1) return
    setStep(visibleSteps[index + 1].id)
  }

  const selectedTemplate = rankedTemplates.find((item) => item.template.id === resolvedTemplateId)?.template

  const finishOnboarding = () => {
    if (!selectedTemplate) return

    const safeName = name.trim()
    const safeGoal = mainGoal.trim()
    const safeEmail = email.trim() || profile?.email || ''

    for (const [fieldId, value] of Object.entries(selectedTemplate.fieldValues)) {
      setFieldValue(fieldId, value)
    }

    setFieldValue('creatorName', safeName)
    setFieldValue(
      'creatorRelationship',
      `Configured by ${safeName} as a personal agent partner for long-term growth.`
    )
    setFieldValue(
      'whyCreated',
      `To help ${safeName} achieve ${safeGoal} while protecting attention and compounding decision quality.`
    )
    setFieldValue('northStar', safeGoal)
    setFieldValue('_focusNorthStar', safeGoal)
    setFieldValue('_focusBottleneck', selectedTemplate.defaultBottleneck)
    setFieldValue(
      'worldContext',
      `${selectedTemplate.fieldValues.worldContext}. Key interests: ${keyInterests.join(', ')}`
    )

    setProfile({
      name: safeName,
      bio: `${selectedTemplate.archetype}: ${selectedTemplate.oneLiner}`,
      ...(safeEmail ? { email: safeEmail } : {}),
      mainGoal: safeGoal,
      keyInterests,
      selectedTemplateId: selectedTemplate.id,
      selectedTemplateName: selectedTemplate.name,
      onboardingCompleted: true,
    })

    onClose()
  }

  const handlePrimaryAction = () => {
    if (step === 'account') {
      if (!canContinueFromAccount) return
      goNext()
      return
    }

    if (step === 'identity') {
      if (!canContinueFromIdentity) return
      goNext()
      return
    }

    if (step === 'interests') {
      if (!canContinueFromInterests) return
      goNext()
      return
    }

    if (!canFinish) return
    finishOnboarding()
  }

  const primaryDisabled =
    (step === 'account' && !canContinueFromAccount) ||
    (step === 'identity' && !canContinueFromIdentity) ||
    (step === 'interests' && !canContinueFromInterests) ||
    (step === 'template' && !canFinish)

  return (
    <div className="fixed inset-0 z-[220] overflow-y-auto bg-black/75 backdrop-blur-sm">
      <div className="mx-auto flex min-h-screen w-full items-start justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-6">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#06090d] text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:rounded-3xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_46%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_42%)]" />

          <div className="relative border-b border-white/10 px-4 py-4 sm:px-7 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-white/70">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Nothing Machine Onboarding
                </p>
                <h2 className="mt-2 text-xl font-semibold leading-tight sm:text-2xl">
                  {isReturning ? 'Tune Your Agent Brain' : 'Set Up Your Agent in 30 Seconds'}
                </h2>
                <p className="mt-1 text-sm text-white/65">{currentStep?.hint}</p>
              </div>

              <button
                onClick={onClose}
                className="rounded-md border border-white/15 bg-white/[0.02] p-2 text-white/60 transition hover:border-white/35 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {visibleSteps.map((item, index) => {
                const active = item.id === step
                const done = index < activeIndex
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs transition',
                      active
                        ? 'border-cyan-300/55 bg-cyan-500/10 text-cyan-200'
                        : done
                        ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-200'
                        : 'border-white/10 bg-white/[0.02] text-white/55'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="uppercase tracking-[0.08em]">{item.label}</span>
                      {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">0{index + 1}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative max-h-[68vh] overflow-y-auto px-4 py-4 sm:px-7 sm:py-6">
            {step === 'account' && (
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 sm:col-span-2">
                  <p className="text-sm text-white/75">
                    Mobile-first signup, then we instantly tune your machine to your goals.
                  </p>
                </div>

                <label className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-white/45">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full rounded-lg border border-white/15 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                    />
                  </div>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-white/45">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-lg border border-white/15 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                    />
                  </div>
                </label>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:col-span-2">
                  <p className="text-xs text-white/60">
                    Demo note: this is local onboarding UX for your MVP. Auth wiring can be connected to backend later.
                  </p>
                </div>
              </section>
            )}

            {step === 'identity' && (
              <section className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-white/45">Your Name</span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Garth"
                      className="w-full rounded-lg border border-white/15 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                    />
                  </div>
                </label>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">Outcome</p>
                  <p className="mt-1 text-sm text-white/70">
                    We use your goal to rank the best starting brain templates automatically.
                  </p>
                </div>

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-white/45">
                    <Target className="h-3.5 w-3.5" /> Main Goal
                  </span>
                  <textarea
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    placeholder="Example: Replace social media with a daily high-signal learning and execution loop that helps me grow my business."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>
              </section>
            )}

            {step === 'interests' && (
              <section className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-white/75">
                    Add a few topics you care about. Richard will use these to personalize feed filtering and idea ranking.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {keyInterests.length === 0 ? (
                    <p className="text-sm text-white/45">No interests yet. Add at least one to continue.</p>
                  ) : (
                    keyInterests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => removeInterest(interest)}
                        className="inline-flex items-center gap-1 rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200 transition hover:border-cyan-200"
                      >
                        {interest}
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        addInterest(interestInput)
                      }
                    }}
                    placeholder="Add an interest and press Enter"
                    className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/50"
                  />
                  <Button
                    type="button"
                    onClick={() => addInterest(interestInput)}
                    className="bg-cyan-500 text-black hover:bg-cyan-400"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {INTEREST_SUGGESTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => addInterest(interest)}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.08em] text-white/65 transition hover:border-white/35 hover:text-white"
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 'template' && (
              <section className="space-y-4">
                <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-4">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-cyan-200">
                    <BrainCircuit className="h-4 w-4" />
                    Pick your agent brain to get started
                  </p>
                  <p className="mt-1 text-sm text-white/75">
                    Ranked for your goal: <span className="text-white">{mainGoal || 'No goal provided yet'}</span>
                  </p>
                </div>

                <div className="grid gap-3">
                  {rankedTemplates.map((item) => {
                    const active = item.template.id === resolvedTemplateId
                    return (
                      <button
                        key={item.template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(item.template.id)}
                        className={cn(
                          'w-full rounded-xl border p-4 text-left transition',
                          active
                            ? 'border-cyan-300/55 bg-cyan-500/10'
                            : 'border-white/12 bg-black/30 hover:border-white/35'
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-base font-semibold text-white">{item.template.name}</p>
                            <p className="text-xs uppercase tracking-[0.08em] text-white/50">{item.template.archetype}</p>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-2.5 py-1 text-xs text-white/75">
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
                            Match {item.score}%
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-white/75">{item.template.oneLiner}</p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.matchedKeywords.length > 0 ? (
                            item.matchedKeywords.slice(0, 4).map((match) => (
                              <span
                                key={match}
                                className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-emerald-200"
                              >
                                {match}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-white/45">General purpose fit</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="relative border-t border-white/10 bg-[#05080c]/95 px-4 py-3 sm:px-7 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-white/50">
                {activeIndex + 1}/{visibleSteps.length} • {currentStep?.label}
              </div>

              <div className="flex items-center gap-2">
                {activeIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={goBack}
                    className="border-white/20 bg-white/[0.02] text-white hover:bg-white/[0.08]"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}

                <Button
                  onClick={handlePrimaryAction}
                  disabled={primaryDisabled}
                  className={cn(
                    step === 'template'
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-cyan-500 text-black hover:bg-cyan-400',
                    primaryDisabled && 'opacity-50'
                  )}
                >
                  {step === 'template' ? 'Launch My Machine' : 'Continue'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
