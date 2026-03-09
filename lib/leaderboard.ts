import { Prisma } from "@prisma/client"
import { db } from "./db"
import { periodStart, rankScores } from "./ranking"
import type { BestScore, GameSummary, Leaderboard, Period } from "./types"

export const LEADERBOARD_LIMIT = 100

type GameRef = { id: string; slug: string; name: string; unit: string; sortOrder: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER" }

/** Best score of every player for a game within the period (one row per player). */
async function bestScores(game: GameRef, period: Period): Promise<BestScore[]> {
  const since = periodStart(period)
  const direction = Prisma.raw(game.sortOrder === "HIGHER_IS_BETTER" ? "DESC" : "ASC")
  const window = since ? Prisma.sql`AND s."submittedAt" >= ${since}` : Prisma.empty

  return db.$queryRaw<BestScore[]>`
    SELECT DISTINCT ON (s."playerId")
      s."playerId" AS "playerId",
      p."displayName" AS "playerName",
      s.value AS value,
      s."submittedAt" AS "achievedAt"
    FROM "Score" s
    JOIN "Player" p ON p.id = s."playerId"
    WHERE s."gameId" = ${game.id} ${window}
    ORDER BY s."playerId", s.value ${direction}, s."submittedAt" ASC
  `
}

export async function getLeaderboard(game: GameRef, period: Period, limit = LEADERBOARD_LIMIT): Promise<Leaderboard> {
  const ranked = rankScores(await bestScores(game, period), game.sortOrder)
  return {
    game: { slug: game.slug, name: game.name, unit: game.unit, sortOrder: game.sortOrder },
    period,
    entries: ranked.slice(0, limit),
    totalPlayers: ranked.length,
    generatedAt: new Date().toISOString(),
  }
}

export async function findGameBySlug(slug: string) {
  return db.game.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, description: true, unit: true, sortOrder: true, createdAt: true },
  })
}

export async function listGames(): Promise<GameSummary[]> {
  const games = await db.game.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, name: true, description: true, sortOrder: true, unit: true, createdAt: true, _count: { select: { scores: true } } },
  })
  const players = await db.score.groupBy({ by: ["gameId", "playerId"], _count: true })
  const playersPerGame = new Map<string, number>()
  for (const p of players) playersPerGame.set(p.gameId, (playersPerGame.get(p.gameId) ?? 0) + 1)

  return games.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.name,
    description: g.description,
    sortOrder: g.sortOrder,
    unit: g.unit,
    createdAt: g.createdAt.toISOString(),
    scoreCount: g._count.scores,
    playerCount: playersPerGame.get(g.id) ?? 0,
  }))
}

export async function getStats() {
  const [games, players, scores, today] = await Promise.all([
    db.game.count(),
    db.player.count(),
    db.score.count(),
    db.score.count({ where: { submittedAt: { gte: periodStart("day") ?? undefined } } }),
  ])
  return { games, players, scores, today }
}

export async function recentScores(limit = 10) {
  const rows = await db.score.findMany({
    orderBy: { submittedAt: "desc" },
    take: limit,
    select: {
      value: true,
      submittedAt: true,
      player: { select: { displayName: true } },
      game: { select: { id: true, slug: true, name: true, unit: true } },
    },
  })
  return rows.map((r) => ({
    type: "score" as const,
    gameId: r.game.id,
    gameSlug: r.game.slug,
    gameName: r.game.name,
    unit: r.game.unit,
    playerName: r.player.displayName,
    value: r.value,
    submittedAt: r.submittedAt.toISOString(),
  }))
}
