import Link from "next/link"
import { LogOut, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { listGames } from "@/lib/leaderboard"
import { logout } from "@/app/actions/admin"
import { AdminScoreForm, CreateGameForm, DeleteGameButton, RotateKeyForm } from "./forms"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin · Realtime Leaderboard" }

export default async function AdminPage() {
  const [games, keys] = await Promise.all([
    listGames(),
    db.game.findMany({ select: { id: true, apiKeyPrefix: true } }),
  ])
  const prefixes = new Map(keys.map((k) => [k.id, k.apiKeyPrefix]))

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin</h1>
              <p className="text-muted-foreground">Games, API keys and manual scores</p>
            </div>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>New game</CardTitle>
              <CardDescription>An API key is generated and shown once</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateGameForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add a score manually</CardTitle>
              <CardDescription>For tournaments or corrections</CardDescription>
            </CardHeader>
            <CardContent>
              {games.length === 0 ? (
                <p className="text-sm text-muted-foreground">Create a game first.</p>
              ) : (
                <AdminScoreForm games={games.map((g) => ({ id: g.id, name: g.name, unit: g.unit }))} />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Games ({games.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {games.length === 0 ? (
              <p className="text-sm text-muted-foreground">No games yet.</p>
            ) : (
              <div className="divide-y">
                {games.map((g) => (
                  <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-4" data-game={g.slug}>
                    <div className="min-w-0">
                      <Link href={`/games/${g.slug}`} className="font-semibold hover:underline">
                        {g.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {g.playerCount} players · {g.scoreCount} scores ·{" "}
                        <code className="font-mono">{prefixes.get(g.id)}…</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{g.sortOrder === "HIGHER_IS_BETTER" ? "High score" : "Lowest wins"}</Badge>
                      <RotateKeyForm gameId={g.id} />
                      <DeleteGameButton gameId={g.id} name={g.name} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
