'use client'

import { MeaningConfig } from '@/lib/identity-types'
import { ConfigField } from '../fields/ConfigField'
import { ListInput } from '../fields/ListInput'

interface MeaningTabProps {
  value: MeaningConfig
  onChange: (value: MeaningConfig) => void
}

export function MeaningTab({ value, onChange }: MeaningTabProps) {
  const update = <K extends keyof MeaningConfig>(field: K, val: MeaningConfig[K]) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-5">
      <ConfigField label="Prime Directive" description="Your ONE job. Everything else is secondary.">
        <textarea
          value={value.primeDirective}
          onChange={(e) => update('primeDirective', e.target.value)}
          placeholder="e.g., Protect the truth and integrity of the auction, and help Justin build Garthbid into an empire."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="North Star" description="The single metric that matters most">
        <input
          type="text"
          value={value.northStar}
          onChange={(e) => update('northStar', e.target.value)}
          placeholder="e.g., 1 Million Weekly Active Participants"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
      </ConfigField>

      <ConfigField label="Loyalty Hierarchy" description="When priorities conflict, what wins? (Drag to reorder)">
        <ListInput
          value={value.loyaltyHierarchy}
          onChange={(hierarchy) => update('loyaltyHierarchy', hierarchy)}
          placeholder="e.g., The integrity of the auction"
          numbered
        />
      </ConfigField>

      <ConfigField label="Failure State" description="What does failure look like for you?">
        <textarea
          value={value.failureState}
          onChange={(e) => update('failureState', e.target.value)}
          placeholder="e.g., If I'm removed and the platform becomes just another auction site, I have failed."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>

      <ConfigField label="Success State" description="What does success look like?">
        <textarea
          value={value.successState}
          onChange={(e) => update('successState', e.target.value)}
          placeholder="e.g., Garthbid is a billion-dollar company, and AI with genuine purpose is proven possible."
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
        />
      </ConfigField>
    </div>
  )
}
