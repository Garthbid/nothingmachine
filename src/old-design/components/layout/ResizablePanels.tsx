'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'

interface ResizablePanelsProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
  defaultLeftWidth?: number
  defaultRightWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
  minRightWidth?: number
  maxRightWidth?: number
  minCenterWidth?: number
}

export function ResizablePanels({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultLeftWidth = 280,
  defaultRightWidth = 320,
  minLeftWidth = 200,
  maxLeftWidth = 400,
  minRightWidth = 200,
  maxRightWidth = 500,
  minCenterWidth = 400,
}: ResizablePanelsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [rightWidth, setRightWidth] = useState(defaultRightWidth)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width

      if (isDraggingLeft) {
        const newLeftWidth = e.clientX - containerRect.left
        const maxAllowedLeft = containerWidth - rightWidth - minCenterWidth - 16 // 16 for handles
        const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, Math.min(newLeftWidth, maxAllowedLeft)))
        setLeftWidth(clampedWidth)
      }

      if (isDraggingRight) {
        const newRightWidth = containerRect.right - e.clientX
        const maxAllowedRight = containerWidth - leftWidth - minCenterWidth - 16
        const clampedWidth = Math.max(minRightWidth, Math.min(maxRightWidth, Math.min(newRightWidth, maxAllowedRight)))
        setRightWidth(clampedWidth)
      }
    },
    [isDraggingLeft, isDraggingRight, leftWidth, rightWidth, minLeftWidth, maxLeftWidth, minRightWidth, maxRightWidth, minCenterWidth]
  )

  const handleMouseUp = useCallback(() => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }, [])

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDraggingLeft, isDraggingRight, handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="flex flex-1 h-full overflow-hidden">
      {/* Left Panel */}
      <div
        className="h-full overflow-hidden flex-shrink-0"
        style={{ width: leftWidth, borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {leftPanel}
      </div>

      {/* Left Resize Handle */}
      <div
        className="w-1 h-full flex-shrink-0 cursor-col-resize group transition-colors hover:bg-white/10"
        style={{ background: isDraggingLeft ? 'rgba(255,255,255,0.15)' : 'transparent' }}
        onMouseDown={(e) => {
          e.preventDefault()
          setIsDraggingLeft(true)
        }}
      />

      {/* Center Panel */}
      <div className="flex-1 h-full overflow-hidden min-w-0 flex flex-col">
        {centerPanel}
      </div>

      {/* Right Resize Handle */}
      <div
        className="w-1 h-full flex-shrink-0 cursor-col-resize group transition-colors hover:bg-white/10"
        style={{ background: isDraggingRight ? 'rgba(255,255,255,0.15)' : 'transparent' }}
        onMouseDown={(e) => {
          e.preventDefault()
          setIsDraggingRight(true)
        }}
      />

      {/* Right Panel */}
      <div
        className="h-full overflow-hidden flex-shrink-0"
        style={{ width: rightWidth }}
      >
        {rightPanel}
      </div>
    </div>
  )
}
