import { NextResponse } from "next/server"
import { findGameBySlug, getLeaderboard, LEADERBOARD_LIMIT } from "@/lib/leaderboard"
import { periodSchema } from "@/lib/validation"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const game = await findGameBySlug(params.slug)
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 })

  const url = new URL(request.url)
  const period = periodSchema.parse(url.searchParams.get("period") ?? "all")
  const limit = Math.min(LEADERBOARD_LIMIT, Math.max(1, Number(url.searchParams.get("limit")) || LEADERBOARD_LIMIT))

  return NextResponse.json(await getLeaderboard(game, period, limit))
}
