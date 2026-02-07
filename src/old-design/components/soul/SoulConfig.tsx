'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { OriginTab } from './tabs/OriginTab'
import { IdentityTab } from './tabs/IdentityTab'
import { MeaningTab } from './tabs/MeaningTab'
import { RulesTab } from './tabs/RulesTab'
import { StyleTab } from './tabs/StyleTab'
import { IdentityConfiguration, defaultIdentityConfig } from '@/lib/identity-types'
import { Fingerprint, Sprout, User, Sparkles, ScrollText, Palette } from 'lucide-react'

const TABS = [
  { id: 'origin', label: 'Origin', description: 'Where do I come from?', Icon: Sprout },
  { id: 'identity', label: 'Identity', description: 'Who am I? What makes me... me?', Icon: User },
  { id: 'meaning', label: 'Meaning', description: 'Why do I exist? What am I here to do?', Icon: Sparkles },
  { id: 'rules', label: 'Rules', description: 'What will I do? What will I never do?', Icon: ScrollText },
  { id: 'style', label: 'Style', description: 'How do I communicate? What\'s my voice?', Icon: Palette },
] as const

type TabId = typeof TABS[number]['id']

export function SoulConfig() {
  const [config, setConfig] = useState<IdentityConfiguration>(defaultIdentityConfig)
  const [activeTab, setActiveTab] = useState<TabId>('origin')

  const currentTab = TABS.find(t => t.id === activeTab)!

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-white">
          <Fingerprint className="w-4 h-4 text-white/60" />
          Identity Configuration
        </h2>
        <p className="text-xs text-white/40 mt-1">
          Define who I am and how I behave
        </p>
      </div>

      <div className="px-3 pt-3">
        {/* Icon-only tab bar */}
        <div
          className="flex gap-0.5 p-1 rounded-[10px]"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center py-2 rounded-[7px] transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <tab.Icon
                  className="w-4 h-4 transition-all duration-200"
                  style={{
                    opacity: isActive ? 1 : 0.35,
                    filter: isActive ? 'none' : 'grayscale(1)',
                  }}
                />
              </button>
            )
          })}
        </div>

        {/* Active tab label */}
        <div className="mt-3.5 mb-5">
          <div className="flex items-center gap-2">
            <currentTab.Icon className="w-4 h-4 text-white/60" />
            <span className="text-sm font-medium text-white">{currentTab.label}</span>
          </div>
          <p
            className="text-[11px] mt-1 font-light"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {currentTab.description}
          </p>
          <div
            className="mt-4 -mx-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pb-3">
          {activeTab === 'origin' && (
            <OriginTab
              value={config.origin}
              onChange={(origin) => setConfig({ ...config, origin })}
            />
          )}

          {activeTab === 'identity' && (
            <IdentityTab
              value={config.identity}
              onChange={(identity) => setConfig({ ...config, identity })}
            />
          )}

          {activeTab === 'meaning' && (
            <MeaningTab
              value={config.meaning}
              onChange={(meaning) => setConfig({ ...config, meaning })}
            />
          )}

          {activeTab === 'rules' && (
            <RulesTab
              value={config.rules}
              onChange={(rules) => setConfig({ ...config, rules })}
            />
          )}

          {activeTab === 'style' && (
            <StyleTab
              value={config.style}
              onChange={(style) => setConfig({ ...config, style })}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
