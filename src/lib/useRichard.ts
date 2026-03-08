'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  connectToRichard,
  disconnectFromRichard,
  chatSend,
  onStatus,
  onMessage,
  getStatus,
  type ConnectionStatus,
  type RichardMessage,
} from './richard'

export function useRichard() {
  const [status, setStatus] = useState<ConnectionStatus>(getStatus)
  const [, setTick] = useState(0)
  const lastMessageRef = useRef<RichardMessage | null>(null)

  useEffect(() => {
    const unsubStatus = onStatus(setStatus)
    const unsubMessage = onMessage((data) => {
      lastMessageRef.current = data
      setTick((t) => t + 1)
    })

    return () => {
      unsubStatus()
      unsubMessage()
    }
  }, [])

  const connect = useCallback(() => {
    connectToRichard()
  }, [])

  const disconnect = useCallback(() => {
    disconnectFromRichard()
  }, [])

  const send = useCallback((message: string, context?: { name: string; content: string }[]) => {
    return chatSend(message, context)
  }, [])

  return {
    status,
    lastMessage: lastMessageRef.current,
    connect,
    disconnect,
    send,
    isConnected: status === 'connected',
  }
}
