"use client"

import { useEffect, useRef, useState } from "react"

export type ConnectionStatus = "connecting" | "live" | "reconnecting"

/**
 * Subscribe to a Server-Sent Events endpoint. EventSource reconnects on its own;
 * this hook only tracks the status and dispatches named events to handlers.
 */
export function useEventSource(url: string | null, handlers: Record<string, (data: unknown) => void>): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!url) return
    setStatus("connecting")
    const source = new EventSource(url)
    source.onopen = () => setStatus("live")
    source.onerror = () => setStatus("reconnecting")

    const names = Object.keys(handlersRef.current)
    const listeners = names.map((name) => {
      const listener = (e: MessageEvent) => {
        try {
          handlersRef.current[name]?.(JSON.parse(e.data))
        } catch {
          // ignore malformed frames
        }
      }
      source.addEventListener(name, listener)
      return [name, listener] as const
    })

    return () => {
      listeners.forEach(([name, l]) => source.removeEventListener(name, l))
      source.close()
    }
    // handler names are static for a given component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return status
}
