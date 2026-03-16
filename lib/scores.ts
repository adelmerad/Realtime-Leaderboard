import { Prisma, type ScoreSource } from "@prisma/client"
import { db } from "./db"
import { publish } from "./realtime"
import type { ScoreEvent } from "./types"

type GameRef = { id: string; slug: string; name: string; unit: string }

/** Save a score (creating the player on first submission) and broadcast it. */
export async function recordScore(game: GameRef, playerName: string, value: number, source: ScoreSource) {
  const nameKey = playerName.trim().toLowerCase()

  const save = () =>
    db.$transaction(async (tx) => {
      const player = await tx.player.upsert({
        where: { nameKey },
        create: { nameKey, displayName: playerName.trim() },
        update: {},
      })
      return tx.score.create({
        data: { gameId: game.id, playerId: player.id, value, source },
        select: { id: true, value: true, submittedAt: true, player: { select: { id: true, displayName: true } } },
      })
    })

  let score
  try {
    score = await save()
  } catch (error) {
    // Two first submissions for the same new player can race on the unique name: retry once
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") score = await save()
    else throw error
  }

  const event: ScoreEvent = {
    type: "score",
    gameId: game.id,
    gameSlug: game.slug,
    gameName: game.name,
    unit: game.unit,
    playerName: score.player.displayName,
    value: score.value,
    submittedAt: score.submittedAt.toISOString(),
  }
  await publish(event)
  return { ...score, event }
}
