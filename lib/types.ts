export interface Game {
  id: string
  name: string
  createdAt: number
}

export interface Score {
  id: string
  gameId: string
  playerName: string
  score: number
  timestamp: number
}

export interface LeaderboardEntry {
  playerName: string
  score: number
  rank: number
  timestamp: number
}
