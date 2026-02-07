'use client'

interface ConfigFieldProps {
  label: string
  description?: string
  children: React.ReactNode
}

export function ConfigField({ label, description, children }: ConfigFieldProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-white">{label}</label>
        {description && (
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
