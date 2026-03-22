"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ArrowUp, Award, Crown, Medal, Sparkles, Trophy } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatValue } from "@/lib/ranking"
import type { Leaderboard, Period, ScoreEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { LiveBadge } from "./live-badge"
import { useEventSource } from "./use-event-source"

const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "week", label: "This week" },
  { value: "day", label: "Today" },
]

type Change = { kind: "new" | "up"; by?: number }

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" aria-label="1st" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" aria-label="2nd" />
  if (rank === 3) return <Award className="h-6 w-6 text-amber-600" aria-label="3rd" />
  return <span className="font-bold">#{rank}</span>
}

function rankColor(rank: number) {
  if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20"
  if (rank === 2) return "bg-gray-400/10 border-gray-400/20"
  if (rank === 3) return "bg-amber-600/10 border-amber-600/20"
  return ""
}

export function LiveLeaderboard({ slug, initial }: { slug: string; initial: Leaderboard }) {
  const router = useRouter()
  const [board, setBoard] = useState(initial)
  const [changes, setChanges] = useState<Record<string, Change>>({})
  const previous = useRef(new Map(initial.entries.map((e) => [e.playerId, e.rank])))

  useEffect(() => {
    setBoard(initial)
    previous.current = new Map(initial.entries.map((e) => [e.playerId, e.rank]))
  }, [initial])

  const status = useEventSource(`/api/games/${slug}/stream?period=${initial.period}`, {
    leaderboard(data) {
      const next = data as Leaderboard
      // Highlight players who are new on the board or climbed
      const diff: Record<string, Change> = {}
      for (const e of next.entries) {
        const before = previous.current.get(e.playerId)
        if (before === undefined) diff[e.playerId] = { kind: "new" }
        else if (e.rank < before) diff[e.playerId] = { kind: "up", by: before - e.rank }
      }
      previous.current = new Map(next.entries.map((e) => [e.playerId, e.rank]))
      setBoard(next)
      if (Object.keys(diff).length) {
        setChanges(diff)
        setTimeout(() => setChanges({}), 2500)
      }
    },
    score(data) {
      const s = data as ScoreEvent
      toast(`${s.playerName} scored ${formatValue(s.value, s.unit)}`)
    },
    "game-deleted"() {
      toast.error("This game was deleted")
      router.push("/games")
    },
  })

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {board.game.name} Rankings
            </CardTitle>
            <CardDescription className="mt-1">
              {board.totalPlayers} {board.totalPlayers === 1 ? "player" : "players"} ·{" "}
              {board.game.sortOrder === "HIGHER_IS_BETTER" ? "highest" : "lowest"} {board.game.unit} wins
            </CardDescription>
          </div>
          <LiveBadge status={status} />
        </div>
        <nav aria-label="Period" className="inline-flex w-fit rounded-lg bg-muted p-1 text-sm">
          {PERIODS.map((p) => {
            const active = p.value === board.period
            return (
              <Link
                key={p.value}
                href={p.value === "all" ? `/games/${slug}` : `/games/${slug}?period=${p.value}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1 font-medium transition-colors",
                  active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </Link>
            )
          })}
        </nav>
      </CardHeader>
      <CardContent>
        {board.entries.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg text-muted-foreground">No scores yet</p>
            <p className="text-sm text-muted-foreground">Scores appear here the moment they are submitted.</p>
          </div>
        ) : (
          <ol className="space-y-3" aria-label="Leaderboard">
            {board.entries.map((entry) => {
              const change = changes[entry.playerId]
              return (
                <li
                  key={entry.playerId}
                  data-player={entry.playerName}
                  data-rank={entry.rank}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border p-4 transition-all duration-700",
                    rankColor(entry.rank),
                    change && "ring-2 ring-primary/60 shadow-md",
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 text-lg">
                    {rankIcon(entry.rank)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 truncate text-lg font-semibold">
                      {entry.playerName}
                      {change?.kind === "new" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                          <Sparkles className="h-3 w-3" /> new
                        </span>
                      )}
                      {change?.kind === "up" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <ArrowUp className="h-3 w-3" /> {change.by}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.achievedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{formatValue(entry.value, "")}</div>
                    <div className="text-xs text-muted-foreground">{board.game.unit}</div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
