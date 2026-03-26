import Link from "next/link"
import { BarChart3, Gamepad2, Trophy, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityFeed } from "@/components/activity-feed"
import { GameCard } from "@/components/game-card"
import { getStats, listGames } from "@/lib/leaderboard"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [stats, games] = await Promise.all([getStats(), listGames()])

  const tiles = [
    { label: "Games", value: stats.games, icon: Gamepad2 },
    { label: "Players", value: stats.players, icon: Users },
    { label: "Scores", value: stats.scores, icon: BarChart3 },
    { label: "Scores today", value: stats.today, icon: Zap },
  ]

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-4 text-balance text-5xl font-bold">Realtime Leaderboard</h1>
          <p className="mx-auto max-w-2xl text-balance text-xl text-muted-foreground">
            Submit scores from any game through a simple API and watch the rankings update live for every viewer.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/games">Browse leaderboards</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">Read the API docs</Link>
            </Button>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {tiles.map((t) => (
            <Card key={t.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.label}</CardTitle>
                <t.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t.value.toLocaleString("en-US")}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <h2 className="mb-4 text-2xl font-semibold">Games</h2>
            {games.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No games yet. An admin can create the first one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {games.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            )}
          </section>
          <section className="lg:col-span-2">
            <ActivityFeed />
          </section>
        </div>
      </div>
    </main>
  )
}
