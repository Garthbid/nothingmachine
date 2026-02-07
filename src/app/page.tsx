'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Header } from '@/components/layout/Header'
import { BlankSlate } from '@/components/marketplace/BlankSlate'
import { TemplateMarketplace } from '@/components/marketplace/TemplateMarketplace'
import { CheckoutDialog } from '@/components/marketplace/CheckoutDialog'
import { MobileLayout } from '@/components/mobile/MobileLayout'

export default function Home() {
  const { hasTemplate, showMarketplace } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Loading state
  if (!mounted) {
    return (
      <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-white/40">Loading...</div>
        </div>
      </div>
    )
  }

  // Full page marketplace
  if (showMarketplace) {
    return (
      <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex-1 overflow-hidden">
          <TemplateMarketplace />
        </div>
        <CheckoutDialog />
      </div>
    )
  }

  // Blank slate - no template purchased yet
  if (!hasTemplate) {
    return (
      <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex-1">
          <BlankSlate />
        </div>
        <CheckoutDialog />
      </div>
    )
  }

  // App with template
  return (
    <MobileLayout />
  )
}
