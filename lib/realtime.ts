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

type Hub = { emitter: EventEmitter; listener: Promise<Client> | null }
const globalForHub = globalThis as unknown as { leaderboardHub?: Hub }
const hub: Hub = globalForHub.leaderboardHub ?? { emitter: new EventEmitter(), listener: null }
hub.emitter.setMaxListeners(0)
globalForHub.leaderboardHub = hub

function connectListener(): Promise<Client> {
  if (hub.listener) return hub.listener
  hub.listener = (async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    client.on("notification", (msg) => {
      if (msg.channel !== CHANNEL || !msg.payload) return
      try {
        hub.emitter.emit("event", JSON.parse(msg.payload) as RealtimeEvent)
      } catch {
        // ignore malformed payloads
      }
    })
    client.on("error", () => {
      // Reconnect on the next subscription
      hub.listener = null
      client.end().catch(() => {})
    })
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
