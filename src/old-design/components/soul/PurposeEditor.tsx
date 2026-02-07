'use client'

import { useStore } from '@/lib/store'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Compass, Star } from 'lucide-react'

export function PurposeEditor() {
  const { soulConfig, updateSoulConfig } = useStore()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-500" />
            Purpose
          </CardTitle>
          <CardDescription className="text-xs">
            Why do I exist? What drives me?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={soulConfig.purpose}
            onChange={(e) => updateSoulConfig({ purpose: e.target.value })}
            placeholder="Define your purpose..."
            className="min-h-[100px] text-sm resize-none"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            North Star
          </CardTitle>
          <CardDescription className="text-xs">
            What am I optimizing for? The ultimate goal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={soulConfig.northStar}
            onChange={(e) => updateSoulConfig({ northStar: e.target.value })}
            placeholder="Define your north star metric or goal..."
            className="min-h-[80px] text-sm resize-none"
          />
        </CardContent>
      </Card>

      <div className="p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground italic">
          "The answer to AGI is not more intelligence. It's love."
        </p>
      </div>
    </div>
  )
}
