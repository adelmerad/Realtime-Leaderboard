import { recentScores } from "@/lib/leaderboard"
import { eventStream } from "@/lib/sse"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/** Live activity across all games, used by the home page feed. */
export async function GET(request: Request) {
  return eventStream(request, {
    async start(send) {
      send("recent", await recentScores(10))
    },
    onEvent(event, send) {
      send(event.type, event)
    },
  })
}
