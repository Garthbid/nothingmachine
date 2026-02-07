'use client'

import { useEditorStore } from '@/lib/editor-store'
import { IDENTITY_FIELDS, TABS, TabId } from '@/lib/identity-fields'
import { Fingerprint } from 'lucide-react'

export function ConfigManifest() {
  const {
    activeTab,
    setActiveTab,
    fieldValues,
    editingField,
    openEditor,
    hasValue,
    getConfiguredCount,
  } = useEditorStore()

  const currentTab = TABS.find((t) => t.id === activeTab)!
  const tabFields = IDENTITY_FIELDS.filter((f) => f.tab === activeTab)
  const allFields = IDENTITY_FIELDS
  const totalConfigured = allFields.filter((f) => hasValue(f.id)).length

  return (
    <div
      className="h-full flex flex-col"
      style={{
        width: 280,
        minWidth: 280,
        background: '#0a0a0a',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 16px 0' }}>
        <h2
          className="flex items-center gap-2"
          style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}
        >
          <Fingerprint className="w-4 h-4" style={{ opacity: 0.6 }} />
          Identity Configuration
        </h2>
        <p
          style={{
            fontSize: 11,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.35)',
            marginTop: 4,
          }}
        >
          Define who I am and how I behave
        </p>
      </div>

      {/* Icon Tab Bar */}
      <div style={{ padding: '16px 16px 0' }}>
        <div
          className="flex gap-0.5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            padding: 4,
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center transition-all duration-200 border-0"
                style={{
                  padding: '8px 0',
                  borderRadius: 7,
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    filter: isActive ? 'none' : 'grayscale(1)',
                    opacity: isActive ? 1 : 0.35,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.icon}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Tab Label */}
        <div style={{ marginTop: 14 }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16 }}>{currentTab.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
              {currentTab.label}
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 4,
            }}
          >
            {currentTab.description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          margin: '16px 16px 0',
        }}
      />

      {/* Field Manifest List */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 8 }}>
        {tabFields.map((field) => {
          const value = fieldValues[field.id] || ''
          const isEditing = editingField?.id === field.id
          const configured = hasValue(field.id)

          return (
            <button
              key={field.id}
              onClick={() => openEditor(field)}
              className={`w-full text-left transition-all duration-150 flex items-center gap-2.5 px-4 py-2.5 cursor-pointer border-0 border-l-2 ${
                isEditing
                  ? 'border-l-white bg-white/[0.04]'
                  : 'border-l-transparent hover:bg-white/[0.02]'
              }`}
            >
              {/* Status Dot */}
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: configured ? '#4ade80' : 'rgba(255,255,255,0.12)',
                  flexShrink: 0,
                }}
              />

              {/* Label + Preview */}
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: '#fff',
                  }}
                >
                  {field.label}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontSize: 10,
                    fontWeight: 300,
                    color: value
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(255,255,255,0.15)',
                    marginTop: 2,
                  }}
                >
                  {value || 'empty'}
                </div>
              </div>

              {/* Action Text */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 300,
                  color: isEditing
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }}
              >
                {isEditing ? 'editing' : 'open →'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Progress Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.2)',
          }}
        >
          {totalConfigured}/{allFields.length} configured
        </span>
        <div className="flex gap-0.5">
          {allFields.map((field) => (
            <div
              key={field.id}
              style={{
                width: 12,
                height: 3,
                borderRadius: 2,
                background: hasValue(field.id)
                  ? '#4ade80'
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
