'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Constraint } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConstraintsList() {
  const { soulConfig, updateConstraint, updateSoulConfig } = useStore()
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newConstraint, setNewConstraint] = useState({ name: '', description: '' })

  const sortedConstraints = [...soulConfig.constraints].sort((a, b) => b.weight - a.weight)

  const handleAddConstraint = () => {
    if (!newConstraint.name.trim()) return

    const constraint: Constraint = {
      id: `constraint-${Date.now()}`,
      name: newConstraint.name,
      description: newConstraint.description,
      enabled: true,
      weight: 75,
    }

    updateSoulConfig({
      constraints: [...soulConfig.constraints, constraint],
    })

    setNewConstraint({ name: '', description: '' })
    setShowNewDialog(false)
  }

  const handleDeleteConstraint = (id: string) => {
    updateSoulConfig({
      constraints: soulConfig.constraints.filter((c) => c.id !== id),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Active Constraints</h3>
          <p className="text-xs text-muted-foreground">Rules I will never break</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowNewDialog(true)}>
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {sortedConstraints.map((constraint) => (
          <div
            key={constraint.id}
            className={cn(
              'p-3 rounded-lg border transition-colors',
              constraint.enabled
                ? 'bg-background border-border'
                : 'bg-muted/50 border-transparent opacity-60'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Checkbox
                  checked={constraint.enabled}
                  onCheckedChange={(checked) =>
                    updateConstraint(constraint.id, { enabled: !!checked })
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{constraint.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteConstraint(constraint.id)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {constraint.description}
                </p>
                {constraint.enabled && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">Weight:</span>
                    <Slider
                      value={[constraint.weight]}
                      onValueChange={([value]) =>
                        updateConstraint(constraint.id, { weight: value })
                      }
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-8 text-right">
                      {constraint.weight}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Constraint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newConstraint.name}
                onChange={(e) =>
                  setNewConstraint((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Honesty"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newConstraint.description}
                onChange={(e) =>
                  setNewConstraint((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="e.g., Always tell the truth, even when uncomfortable"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddConstraint} disabled={!newConstraint.name.trim()}>
              Add Constraint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
