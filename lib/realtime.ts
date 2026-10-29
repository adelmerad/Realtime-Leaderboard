import { EventEmitter } from "node:events"
import { Client } from "pg"
import { db } from "./db"
import type { RealtimeEvent } from "./types"

/**
 * Realtime fan-out through PostgreSQL LISTEN/NOTIFY.
 * Every app instance listens on the same channel, so a score saved by one instance
 * reaches the clients connected to all of them.
 */
export const CHANNEL = "leaderboard_events"

type Hub = { emitter: EventEmitter; listener: Promise<Client> | null; retryTimer: ReturnType<typeof setTimeout> | null }
const globalForHub = globalThis as unknown as { leaderboardHub?: Hub }
const hub: Hub = globalForHub.leaderboardHub ?? { emitter: new EventEmitter(), listener: null, retryTimer: null }
hub.emitter.setMaxListeners(0)
globalForHub.leaderboardHub = hub

const MAX_RETRY_MS = 30_000

/** Delay before the n-th reconnection attempt: 1s, 2s, 4s… capped at 30s. */
export function retryDelay(attempt: number): number {
  return Math.min(MAX_RETRY_MS, 1000 * 2 ** attempt)
}

// LISTEN needs a session-level connection: connection poolers (such as Neon "-pooler" URLs,
// PgBouncer in transaction mode) do not support it. Use the direct URL when one is provided.
const listenUrl = () => process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL

/**
 * The connection can drop at any time (network, database restart, serverless databases
 * that suspend when idle). Reconnect with backoff while anyone is subscribed.
 */
function scheduleReconnect(attempt: number) {
  if (hub.retryTimer || hub.emitter.listenerCount("event") === 0) return
  hub.retryTimer = setTimeout(() => {
    hub.retryTimer = null
    connectListener().catch(() => scheduleReconnect(attempt + 1))
  }, retryDelay(attempt))
}

function connectListener(): Promise<Client> {
  if (hub.listener) return hub.listener
  hub.listener = (async () => {
    const client = new Client({ connectionString: listenUrl() })
    client.on("notification", (msg) => {
      if (msg.channel !== CHANNEL || !msg.payload) return
      try {
        hub.emitter.emit("event", JSON.parse(msg.payload) as RealtimeEvent)
      } catch {
        // ignore malformed payloads
      }
    })
    const lost = () => {
      if (hub.listener === null) return
      hub.listener = null
      client.end().catch(() => {})
      scheduleReconnect(0)
    }
    client.on("error", lost)
    client.on("end", lost)
    await client.connect()
    await client.query(`LISTEN ${CHANNEL}`)
    return client
  })().catch((err) => {
    hub.listener = null
    throw err
  })
  return hub.listener
}

/** Subscribe to every realtime event. Returns an unsubscribe function. */
export async function subscribe(onEvent: (event: RealtimeEvent) => void): Promise<() => void> {
  await connectListener()
  hub.emitter.on("event", onEvent)
  return () => {
    hub.emitter.off("event", onEvent)
  }
}

/** Broadcast an event to all instances (payloads must stay under 8 KB). */
export async function publish(event: RealtimeEvent): Promise<void> {
  await db.$executeRaw`SELECT pg_notify(${CHANNEL}, ${JSON.stringify(event)})`
}

/** Encode one Server-Sent Event frame. */
export function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}
