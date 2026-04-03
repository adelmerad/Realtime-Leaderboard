import { PrismaClient, type SortOrder } from "@prisma/client"
import { generateApiKey } from "../lib/api-keys"

const db = new PrismaClient()

const GAMES: { name: string; slug: string; description: string; sortOrder: SortOrder; unit: string; range: [number, number] }[] = [
  { name: "Space Invaders", slug: "space-invaders", description: "Classic arcade shooter — highest score wins", sortOrder: "HIGHER_IS_BETTER", unit: "points", range: [800, 12000] },
  { name: "Mario 1-1 Speedrun", slug: "mario-1-1-speedrun", description: "Fastest completion of world 1-1", sortOrder: "LOWER_IS_BETTER", unit: "seconds", range: [298, 420] },
  { name: "Chess Puzzles", slug: "chess-puzzles", description: "Puzzles solved in a 5-minute rush", sortOrder: "HIGHER_IS_BETTER", unit: "puzzles", range: [8, 45] },
]

const PLAYERS = ["Sarah", "Yacine", "Lina", "Karim", "Amel", "Rayan", "Nour", "Islam", "Meriem", "Walid", "Ines", "Sofiane"]

// Deterministic pseudo-random numbers so the demo data is stable
let seed = 42
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

async function main() {
  console.log("Seeding database...")
  await db.score.deleteMany()
  await db.player.deleteMany()
  await db.game.deleteMany()

  const players = await Promise.all(
    PLAYERS.map((name) => db.player.create({ data: { nameKey: name.toLowerCase(), displayName: name } })),
  )

  for (const g of GAMES) {
    const { key, hash, prefix } = generateApiKey()
    const { range, ...data } = g
    const game = await db.game.create({ data: { ...data, apiKeyHash: hash, apiKeyPrefix: prefix } })

    const scores = []
    for (const player of players) {
      const attempts = 1 + Math.floor(random() * 4)
      for (let i = 0; i < attempts; i++) {
        const raw = range[0] + random() * (range[1] - range[0])
        const value = g.unit === "seconds" ? Math.round(raw * 100) / 100 : Math.round(raw)
        const submittedAt = new Date(Date.now() - Math.floor(random() * 10 * 24 * 3600 * 1000))
        scores.push({ gameId: game.id, playerId: player.id, value, submittedAt, source: "API" as const })
      }
    }
    await db.score.createMany({ data: scores })
    console.log(`  ${g.name}: ${scores.length} scores — API key: ${key}`)
  }
  console.log("Done. Save the API keys above to submit scores.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
