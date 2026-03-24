import Link from "next/link"
import { Gamepad2, TrendingDown, TrendingUp, Users } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GameSummary } from "@/lib/types"

export function GameCard({ game }: { game: GameSummary }) {
  const Order = game.sortOrder === "HIGHER_IS_BETTER" ? TrendingUp : TrendingDown
  return (
    <Link href={`/games/${game.slug}`} className="block">
      <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-lg">
        <CardHeader>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="gap-1">
              <Order className="h-3 w-3" />
              {game.sortOrder === "HIGHER_IS_BETTER" ? "High score" : "Lowest wins"}
            </Badge>
          </div>
          <CardTitle>{game.name}</CardTitle>
          {game.description && <CardDescription>{game.description}</CardDescription>}
          <p className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" /> {game.playerCount} players
            </span>
            <span>{game.scoreCount} scores</span>
          </p>
        </CardHeader>
      </Card>
    </Link>
  )
}
