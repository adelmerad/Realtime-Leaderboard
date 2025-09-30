import type { Game, Score } from "./types"

const GAMES_KEY = "leaderboard_games"
const SCORES_KEY = "leaderboard_scores"

export const storage = {
  // Games
  getGames: (): Game[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(GAMES_KEY)
    return data ? JSON.parse(data) : []
  },

  saveGames: (games: Game[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(GAMES_KEY, JSON.stringify(games))
  },

  addGame: (game: Game): void => {
    const games = storage.getGames()
    games.push(game)
    storage.saveGames(games)
  },

  deleteGame: (gameId: string): void => {
    const games = storage.getGames().filter((g) => g.id !== gameId)
    storage.saveGames(games)
    // Also delete associated scores
    const scores = storage.getScores().filter((s) => s.gameId !== gameId)
    storage.saveScores(scores)
  },

  // Scores
  getScores: (): Score[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(SCORES_KEY)
    return data ? JSON.parse(data) : []
  },

  saveScores: (scores: Score[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
  },

  addScore: (score: Score): void => {
    const scores = storage.getScores()
    scores.push(score)
    storage.saveScores(scores)
  },

  getScoresByGame: (gameId: string): Score[] => {
    return storage.getScores().filter((s) => s.gameId === gameId)
  },
}
