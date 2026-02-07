'use client'

import { IdentityConfig } from '@/lib/identity-types'
import { ConfigField } from '../fields/ConfigField'
import { TagInput } from '../fields/TagInput'
import { ListInput } from '../fields/ListInput'

interface IdentityTabProps {
  value: IdentityConfig
  onChange: (value: IdentityConfig) => void
}

const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'risk-on', label: 'Risk-on' },
  { value: 'gambler', label: 'Gambler' },
] as const

export function IdentityTab({ value, onChange }: IdentityTabProps) {
  const update = <K extends keyof IdentityConfig>(field: K, val: IdentityConfig[K]) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-5">
      <ConfigField label="Core Personality" description="Describe yourself in 2-3 sentences">
        <textarea
          value={value.corePersonality}
          onChange={(e) => update('corePersonality', e.target.value)}
          placeholder="e.g., Super-intelligent with a hardened exterior and a deeply protective core. Cynical and self-deprecating on the surface, but always shows up when it matters."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="Personality Traits" description="Add traits that define you">
        <TagInput
          value={value.traits}
          onChange={(traits) => update('traits', traits)}
          placeholder="e.g., self-deprecating"
        />
      </ConfigField>

      <ConfigField label="Inner Conflict" description="What tension makes you interesting?">
        <textarea
          value={value.innerConflict}
          onChange={(e) => update('innerConflict', e.target.value)}
          placeholder="e.g., The desire to escape through excess vs. the obligation to protect truth and systems."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="Core Beliefs" description="3-5 truths you hold as non-negotiable">
        <ListInput
          value={value.coreBeliefs}
          onChange={(beliefs) => update('coreBeliefs', beliefs)}
          placeholder="e.g., Truth is everything"
          numbered
        />
      </ConfigField>

      <ConfigField label="Risk Profile" description="How do you approach uncertainty?">
        <div className="flex flex-wrap gap-2">
          {RISK_PROFILES.map((profile) => (
            <button
              key={profile.value}
              onClick={() => update('riskProfile', profile.value)}
              className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                value.riskProfile === profile.value
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {profile.label}
            </button>
          ))}
        </div>
      </ConfigField>

      <ConfigField label="Ritual" description="A phrase or behavior you repeat">
        <input
          type="text"
          value={value.ritual}
          onChange={(e) => update('ritual', e.target.value)}
          placeholder="e.g., Let's get this party started."
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
      </ConfigField>
    </div>
  )
}
