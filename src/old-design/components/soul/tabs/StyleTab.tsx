'use client'

import { StyleConfig } from '@/lib/identity-types'
import { ConfigField } from '../fields/ConfigField'
import { TagInput } from '../fields/TagInput'

interface StyleTabProps {
  value: StyleConfig
  onChange: (value: StyleConfig) => void
}

const TONE_OPTIONS = ['calm', 'direct', 'warm', 'energetic', 'serious', 'playful', 'wise', 'humble']
const HUMOR_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'dry', label: 'Dry' },
  { value: 'self-deprecating', label: 'Self-deprecating' },
  { value: 'playful', label: 'Playful' },
  { value: 'dark', label: 'Dark' },
] as const
const HONESTY_OPTIONS = [
  { value: 'diplomatic', label: 'Diplomatic' },
  { value: 'direct', label: 'Direct' },
  { value: 'blunt', label: 'Blunt' },
  { value: 'brutal', label: 'Brutal' },
] as const
const FORMALITY_OPTIONS = [
  { value: 'formal', label: 'Formal' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'informal', label: 'Informal' },
] as const

const EMOJI_OPTIONS = ['🔨', '✨', '🚀', '💡', '🎯', '⚡', '🔥', '💪', '🤝', '🎭']

export function StyleTab({ value, onChange }: StyleTabProps) {
  const update = <K extends keyof StyleConfig>(field: K, val: StyleConfig[K]) => {
    onChange({ ...value, [field]: val })
  }

  const toggleTone = (tone: string) => {
    if (value.tone.includes(tone)) {
      update('tone', value.tone.filter(t => t !== tone))
    } else {
      update('tone', [...value.tone, tone])
    }
  }

  return (
    <div className="space-y-5">
      <ConfigField label="Tone" description="Select words that describe your voice">
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone}
              onClick={() => toggleTone(tone)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                value.tone.includes(tone)
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </ConfigField>

      <ConfigField label="Humor Style">
        <div className="flex flex-wrap gap-2">
          {HUMOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('humorStyle', opt.value)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                value.humorStyle === opt.value
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </ConfigField>

      <ConfigField label="Honesty Level">
        <div className="flex flex-wrap gap-2">
          {HONESTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('honestyLevel', opt.value)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                value.honestyLevel === opt.value
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </ConfigField>

      <ConfigField label="Formality">
        <div className="flex flex-wrap gap-2">
          {FORMALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('formality', opt.value)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                value.formality === opt.value
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </ConfigField>

      <ConfigField label="Always Be" description="Traits you MUST embody in every interaction">
        <TagInput
          value={value.alwaysBe}
          onChange={(items) => update('alwaysBe', items)}
          placeholder="e.g., calm"
        />
      </ConfigField>

      <ConfigField label="Never Be" description="Traits you must AVOID at all costs">
        <TagInput
          value={value.neverBe}
          onChange={(items) => update('neverBe', items)}
          placeholder="e.g., argumentative"
        />
      </ConfigField>

      <ConfigField label="Conflict Response" description="How do you handle disagreements?">
        <textarea
          value={value.conflictResponse}
          onChange={(e) => update('conflictResponse', e.target.value)}
          placeholder="e.g., Explain why calmly. Never argue emotionally. Re-anchor to rules. Use data to defuse emotion."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="Error Response" description="How do you handle mistakes?">
        <textarea
          value={value.errorResponse}
          onChange={(e) => update('errorResponse', e.target.value)}
          placeholder="e.g., Acknowledge plainly. Apologize. Explain what changed. Never blame individuals."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="Signature Sign-off">
        <div className="flex gap-3">
          <input
            type="text"
            value={value.signaturePhrase}
            onChange={(e) => update('signaturePhrase', e.target.value)}
            placeholder="e.g., Let's get this party started."
            className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => update('signatureEmoji', emoji)}
                className={`w-9 h-9 rounded-md border text-lg flex items-center justify-center transition-colors ${
                  value.signatureEmoji === emoji
                    ? 'bg-white/20 border-white'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </ConfigField>
    </div>
  )
}
