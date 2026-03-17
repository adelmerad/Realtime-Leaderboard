import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { bearerToken, verifyApiKey } from "@/lib/api-keys"
import { getLeaderboard } from "@/lib/leaderboard"
import { scoreLimiter } from "@/lib/rate-limit"
import { recordScore } from "@/lib/scores"
import { submitScoreSchema } from "@/lib/validation"

export const dynamic = "force-dynamic"

/**
 * Submit a score from a game client or server.
 *   POST /api/games/:slug/scores
 *   Authorization: Bearer <game API key>
 *   { "player": "Sarah", "value": 1200 }
 */
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const game = await db.game.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, name: true, unit: true, sortOrder: true, apiKeyHash: true },
  })
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 })

  const key = bearerToken(request.headers.get("authorization"))
  if (!key || !verifyApiKey(key, game.apiKeyHash)) {
    return NextResponse.json(
      { error: "Missing or invalid API key" },
      { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="scores"' } },
    )
  }

  const limit = scoreLimiter.take(game.id)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions, slow down" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 })
  }
  const parsed = submitScoreSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid score", details: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })) },
      { status: 422 },
    )
  }

  const score = await recordScore(game, parsed.data.player, parsed.data.value, "API")
  const board = await getLeaderboard(game, "all")
  const entry = board.entries.find((e) => e.playerId === score.player.id)

  return NextResponse.json(
    {
      score: { id: score.id, player: score.player.displayName, value: score.value, submittedAt: score.submittedAt },
      rank: entry?.rank ?? null,
      personalBest: entry?.value ?? score.value,
    },
    { status: 201 },
  )
}
