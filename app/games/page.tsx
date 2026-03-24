import { Gamepad2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { GameCard } from "@/components/game-card"
import { listGames } from "@/lib/leaderboard"

export const dynamic = "force-dynamic"
export const metadata = { title: "Games · Realtime Leaderboard" }

export default async function GamesPage() {
  const games = await listGames()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Games</h1>
          </div>
          <p className="text-lg text-muted-foreground">Pick a game to follow its live leaderboard</p>
        </div>

        {games.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gamepad2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg text-muted-foreground">No games yet</p>
              <p className="text-sm text-muted-foreground">Games are created from the admin dashboard.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {games.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
