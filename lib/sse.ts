import { sseFrame, subscribe } from "./realtime"
import type { RealtimeEvent } from "./types"

const HEARTBEAT_MS = 25_000

type Send = (event: string, data: unknown) => void

/**
 * Build a Server-Sent Events response: sends an initial frame, forwards realtime
 * events, keeps the connection alive and cleans up when the client disconnects.
 */
export function eventStream(
  request: Request,
  handlers: {
    start: (send: Send) => Promise<void>
    onEvent: (event: RealtimeEvent, send: Send, close: () => void) => void | Promise<void>
  },
): Response {
  const encoder = new TextEncoder()
  let cleanup = () => {}

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false
      const send: Send = (event, data) => {
        if (!closed) controller.enqueue(encoder.encode(sseFrame(event, data)))
      }
      const close = () => {
        if (closed) return
        closed = true
        cleanup()
        try {
          controller.close()
        } catch {
          // already closed
        }
      }

      // Tell EventSource to retry after 3s if the connection drops
      controller.enqueue(encoder.encode("retry: 3000\n\n"))

      const unsubscribe = await subscribe((event) => {
        Promise.resolve(handlers.onEvent(event, send, close)).catch(() => close())
      })
      const heartbeat = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(": ping\n\n"))
      }, HEARTBEAT_MS)
      cleanup = () => {
        clearInterval(heartbeat)
        unsubscribe()
      }

      request.signal.addEventListener("abort", close)
      try {
        await handlers.start(send)
      } catch {
        close()
      }
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
