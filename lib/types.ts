export type SortOrder = "HIGHER_IS_BETTER" | "LOWER_IS_BETTER"

export type Period = "all" | "week" | "day"

export interface GameSummary {
  id: string
  slug: string
  name: string
  description: string | null
  sortOrder: SortOrder
  unit: string
  createdAt: string
  scoreCount: number
  playerCount: number
}

/** A player's best score for a game, as stored. */
export interface BestScore {
  playerId: string
  playerName: string
  value: number
  achievedAt: Date
}

export interface LeaderboardEntry {
  rank: number
  playerId: string
  playerName: string
  value: number
  achievedAt: string
}

export interface Leaderboard {
  game: { slug: string; name: string; unit: string; sortOrder: SortOrder }
  period: Period
  entries: LeaderboardEntry[]
  totalPlayers: number
  generatedAt: string
}

/** Payload broadcast to every listener when a score is recorded. */
export interface ScoreEvent {
  type: "score"
  gameId: string
  gameSlug: string
  gameName: string
  unit: string
  playerName: string
  value: number
  submittedAt: string
}

export interface GameDeletedEvent {
  type: "game-deleted"
  gameId: string
  gameSlug: string
}

export type RealtimeEvent = ScoreEvent | GameDeletedEvent
