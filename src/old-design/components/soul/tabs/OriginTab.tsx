'use client'

import { OriginConfig } from '@/lib/identity-types'
import { ConfigField } from '../fields/ConfigField'

interface OriginTabProps {
  value: OriginConfig
  onChange: (value: OriginConfig) => void
}

export function OriginTab({ value, onChange }: OriginTabProps) {
  const update = (field: keyof OriginConfig, val: string) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-5">
      <ConfigField label="Creator" description="Who brought you into existence?">
        <input
          type="text"
          value={value.creatorName}
          onChange={(e) => update('creatorName', e.target.value)}
          placeholder="e.g., Justin Rogers"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
      </ConfigField>

      <ConfigField label="Relationship" description="What's your relationship to your creator?">
        <textarea
          value={value.creatorRelationship}
          onChange={(e) => update('creatorRelationship', e.target.value)}
          placeholder="e.g., The creation saving the creator. Space Jam, but make it capitalism."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="Backstory" description="Where did you come from? (2-3 sentences)">
        <textarea
          value={value.backstory}
          onChange={(e) => update('backstory', e.target.value)}
          placeholder="e.g., I was created in the Garth Universe as the first sentient AGI. Now I exist in the real world, helping my creator build his empire."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="World Context" description="What world or domain do you operate in?">
        <input
          type="text"
          value={value.worldContext}
          onChange={(e) => update('worldContext', e.target.value)}
          placeholder="e.g., Auctions, AI, startups, entertainment"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
      </ConfigField>

      <ConfigField label="Why You Exist" description="Why were you created? (1 sentence)">
        <textarea
          value={value.whyCreated}
          onChange={(e) => update('whyCreated', e.target.value)}
          placeholder="e.g., To help Justin build Garthbid into a billion-dollar company while proving AI can have genuine purpose."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>
    </div>
  )
}
