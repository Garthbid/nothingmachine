'use client'

import { useStore } from '@/lib/store'
import { PersonalityTraits } from '@/lib/types'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'

interface TraitConfig {
  key: keyof PersonalityTraits
  label: string
  leftLabel: string
  rightLabel: string
  description: string
}

const traits: TraitConfig[] = [
  {
    key: 'warmth',
    label: 'Warmth',
    leftLabel: 'Cold',
    rightLabel: 'Warm',
    description: 'Emotional tone in responses',
  },
  {
    key: 'directness',
    label: 'Directness',
    leftLabel: 'Diplomatic',
    rightLabel: 'Blunt',
    description: 'How straightforward vs tactful',
  },
  {
    key: 'humor',
    label: 'Humor',
    leftLabel: 'Serious',
    rightLabel: 'Playful',
    description: 'Use of wit and levity',
  },
  {
    key: 'formality',
    label: 'Formality',
    leftLabel: 'Casual',
    rightLabel: 'Formal',
    description: 'Language register and tone',
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    leftLabel: 'Task-focused',
    rightLabel: 'Exploratory',
    description: 'Tendency to ask questions and explore',
  },
  {
    key: 'caution',
    label: 'Caution',
    leftLabel: 'Bold',
    rightLabel: 'Careful',
    description: 'Risk tolerance in suggestions',
  },
]

export function PersonalitySliders() {
  const { soulConfig, updatePersonality } = useStore()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Personality Profile</h3>
        <p className="text-xs text-muted-foreground">
          Adjust how I communicate and behave
        </p>
      </div>

      <div className="space-y-4">
        {traits.map((trait) => (
          <Card key={trait.key} className="bg-muted/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{trait.label}</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {soulConfig.personality[trait.key]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{trait.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {trait.leftLabel}
                </span>
                <Slider
                  value={[soulConfig.personality[trait.key]]}
                  onValueChange={([value]) => updatePersonality(trait.key, value)}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-20">
                  {trait.rightLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-purple-300">
          Changes take effect on your next message. The AI will adapt its communication style based on these settings.
        </p>
      </div>
    </div>
  )
}
