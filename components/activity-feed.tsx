"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatValue } from "@/lib/ranking"
import type { ScoreEvent } from "@/lib/types"
import { LiveBadge } from "./live-badge"
import { useEventSource } from "./use-event-source"

const MAX_ITEMS = 10

export function ActivityFeed() {
  const [items, setItems] = useState<ScoreEvent[]>([])

  const status = useEventSource("/api/stream", {
    recent(data) {
      setItems(data as ScoreEvent[])
    },
    score(data) {
      setItems((prev) => [data as ScoreEvent, ...prev].slice(0, MAX_ITEMS))
    },
    "game-deleted"(data) {
      const { gameId } = data as { gameId: string }
      setItems((prev) => prev.filter((i) => i.gameId !== gameId))
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Live activity
        </CardTitle>
        <LiveBadge status={status} />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Waiting for the first scores…</p>
        ) : (
          <ul className="space-y-3" aria-label="Recent scores">
            {items.map((item) => (
              <li key={`${item.gameId}-${item.playerName}-${item.submittedAt}`} className="flex items-center justify-between gap-4 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-medium">{item.playerName}</span> scored{" "}
                  <span className="font-semibold text-primary">{formatValue(item.value, item.unit)}</span> in{" "}
                  <Link href={`/games/${item.gameSlug}`} className="underline-offset-4 hover:underline">
                    {item.gameName}
                  </Link>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
