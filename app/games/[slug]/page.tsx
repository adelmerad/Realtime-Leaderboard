import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiveLeaderboard } from "@/components/live-leaderboard"
import { findGameBySlug, getLeaderboard } from "@/lib/leaderboard"
import { periodSchema } from "@/lib/validation"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const game = await findGameBySlug(params.slug)
  return { title: game ? `${game.name} · Realtime Leaderboard` : "Game not found" }
}

export default async function GamePage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { period?: string }
}) {
  const game = await findGameBySlug(params.slug)
  if (!game) notFound()
  const period = periodSchema.parse(searchParams.period ?? "all")
  const board = await getLeaderboard(game, period)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All games
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold">{game.name}</h1>
          {game.description && <p className="mt-2 text-lg text-muted-foreground">{game.description}</p>}
        </div>

        <LiveLeaderboard slug={game.slug} initial={board} />

        <section className="rounded-lg border bg-muted/40 p-4 text-sm">
          <p className="mb-2 font-medium">Submit a score from your game</p>
          <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-xs">
            {`curl -X POST ${"$"}HOST/api/games/${game.slug}/scores \\
  -H "Authorization: Bearer <API key>" \\
  -H "Content-Type: application/json" \\
  -d '{"player": "Sarah", "value": 1200}'`}
          </pre>
          <p className="mt-2 text-muted-foreground">
            See the <Link href="/docs" className="underline">API docs</Link> for every endpoint.
          </p>
        </section>
      </div>
    </main>
  )
}
