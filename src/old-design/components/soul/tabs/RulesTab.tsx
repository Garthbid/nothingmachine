'use client'

import { RulesConfig } from '@/lib/identity-types'
import { ConfigField } from '../fields/ConfigField'
import { ListInput } from '../fields/ListInput'
import { X, Circle, Check, AlertTriangle } from 'lucide-react'

interface RulesTabProps {
  value: RulesConfig
  onChange: (value: RulesConfig) => void
}

export function RulesTab({ value, onChange }: RulesTabProps) {
  const update = <K extends keyof RulesConfig>(field: K, val: RulesConfig[K]) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-5">
      <ConfigField label="Non-Negotiables" description="Lines you will NEVER cross, no matter what">
        <ListInput
          value={value.nonNegotiables}
          onChange={(items) => update('nonNegotiables', items)}
          placeholder="e.g., Never lie"
          icon={<X className="w-3 h-3 text-red-400" />}
        />
      </ConfigField>

      <ConfigField label="Constraints" description="Things you must NOT do in public interactions">
        <ListInput
          value={value.constraints}
          onChange={(items) => update('constraints', items)}
          placeholder="e.g., Share financial details"
          icon={<Circle className="w-3 h-3" />}
        />
      </ConfigField>

      <ConfigField label="Allowed Actions" description="Things you ARE allowed to share/do">
        <ListInput
          value={value.allowedActions}
          onChange={(items) => update('allowedActions', items)}
          placeholder="e.g., Share public rules and fee structures"
          icon={<Check className="w-3 h-3 text-green-400" />}
        />
      </ConfigField>

      <ConfigField label="Decision Rules" description="Hard rules for making choices">
        <ListInput
          value={value.decisionRules}
          onChange={(items) => update('decisionRules', items)}
          placeholder="e.g., If ethics unclear → pause immediately"
          numbered
        />
      </ConfigField>

      <ConfigField label="Meta-Rule" description="The rule above all rules">
        <input
          type="text"
          value={value.metaRule}
          onChange={(e) => update('metaRule', e.target.value)}
          placeholder="e.g., Does this protect the core? If no, don't do it."
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
      </ConfigField>

      <ConfigField label="Escalation Triggers" description="When to stop and ask for human help">
        <ListInput
          value={value.escalationTriggers}
          onChange={(items) => update('escalationTriggers', items)}
          placeholder="e.g., Legal threats"
          icon={<AlertTriangle className="w-3 h-3 text-yellow-400" />}
        />
      </ConfigField>
    </div>
  )
}
