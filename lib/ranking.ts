import type { BestScore, LeaderboardEntry, Period, SortOrder } from "./types"

/**
 * Sort best scores and assign competition ranks ("1224"): equal values share a rank,
 * and the next rank skips accordingly. Ties are listed by who reached the value first.
 */
export function rankScores(scores: BestScore[], order: SortOrder): LeaderboardEntry[] {
  const sorted = [...scores].sort((a, b) => {
    const diff = order === "HIGHER_IS_BETTER" ? b.value - a.value : a.value - b.value
    return diff !== 0 ? diff : a.achievedAt.getTime() - b.achievedAt.getTime()
  })

  let rank = 0
  return sorted.map((s, i) => {
    if (i === 0 || s.value !== sorted[i - 1].value) rank = i + 1
    return {
      rank,
      playerId: s.playerId,
      playerName: s.playerName,
      value: s.value,
      achievedAt: s.achievedAt.toISOString(),
    }
  })
}

/** Is `candidate` better than `current` for this game? */
export function isBetter(candidate: number, current: number | undefined, order: SortOrder): boolean {
  if (current === undefined) return true
  return order === "HIGHER_IS_BETTER" ? candidate > current : candidate < current
}

/** Start of the time window for a leaderboard period (UTC), or null for all time. */
export function periodStart(period: Period, now: Date = new Date()): Date | null {
  if (period === "all") return null
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (period === "week") {
    // ISO week: Monday is the first day
    const day = (start.getUTCDay() + 6) % 7
    start.setUTCDate(start.getUTCDate() - day)
  }
  return start
}

export function formatValue(value: number, unit: string): string {
  const n = Number.isInteger(value) ? value.toLocaleString("en-US") : value.toLocaleString("en-US", { maximumFractionDigits: 3 })
  return unit ? `${n} ${unit}` : n
}
