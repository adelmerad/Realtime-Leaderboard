import { NextResponse } from "next/server"
import { listGames } from "@/lib/leaderboard"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ games: await listGames() })
}
