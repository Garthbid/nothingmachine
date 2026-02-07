'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus, GripVertical } from 'lucide-react'

interface ListInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  icon?: React.ReactNode
  numbered?: boolean
}

export function ListInput({ value, onChange, placeholder = 'Add item...', icon, numbered = false }: ListInputProps) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      onChange([...value, input.trim()])
      setInput('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleAdd = () => {
    if (input.trim()) {
      onChange([...value, input.trim()])
      setInput('')
    }
  }

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-md group"
        >
          <GripVertical className="w-4 h-4 text-white/20 cursor-grab" />
          {numbered && (
            <span className="text-xs text-white/40 w-4">{index + 1}.</span>
          )}
          {icon && <span className="text-white/40">{icon}</span>}
          <span className="flex-1 text-sm text-white/80">{item}</span>
          <button
            onClick={() => handleRemove(index)}
            className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  )
}
