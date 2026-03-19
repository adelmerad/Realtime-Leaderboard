import { NextResponse } from "next/server"
import { findGameBySlug, getLeaderboard } from "@/lib/leaderboard"
import { eventStream } from "@/lib/sse"
import { periodSchema } from "@/lib/validation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const DEBOUNCE_MS = 200

/** Live leaderboard: a snapshot on connect, then a fresh ranking after every new score. */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const game = await findGameBySlug(params.slug)
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 })
  const period = periodSchema.parse(new URL(request.url).searchParams.get("period") ?? "all")

  let timer: ReturnType<typeof setTimeout> | null = null

  return eventStream(request, {
    async start(send) {
      send("leaderboard", await getLeaderboard(game, period))
    },
    onEvent(event, send, close) {
      if (event.gameId !== game.id) return
      if (event.type === "game-deleted") {
        send("game-deleted", { slug: game.slug })
        close()
        return
      }
      send("score", event)
      // Coalesce bursts of scores into a single ranking refresh
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        timer = null
        send("leaderboard", await getLeaderboard(game, period))
      }, DEBOUNCE_MS)
    },
  })
}
