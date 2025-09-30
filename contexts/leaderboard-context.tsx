"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Game, Score } from "@/lib/types"
import { storage } from "@/lib/storage"

interface LeaderboardContextType {
  games: Game[]
  scores: Score[]
  addGame: (name: string) => void
  deleteGame: (gameId: string) => void
  addScore: (gameId: string, playerName: string, score: number) => void
  getScoresByGame: (gameId: string) => Score[]
  refreshData: () => void
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined)

export function LeaderboardProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<Game[]>([])
  const [scores, setScores] = useState<Score[]>([])

  const refreshData = useCallback(() => {
    setGames(storage.getGames())
    setScores(storage.getScores())
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const addGame = useCallback(
    (name: string) => {
      const newGame: Game = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
      }
      storage.addGame(newGame)
      refreshData()
    },
    [refreshData],
  )

  const deleteGame = useCallback(
    (gameId: string) => {
      storage.deleteGame(gameId)
      refreshData()
    },
    [refreshData],
  )

  const addScore = useCallback(
    (gameId: string, playerName: string, score: number) => {
      const newScore: Score = {
        id: crypto.randomUUID(),
        gameId,
        playerName,
        score,
        timestamp: Date.now(),
      }
      storage.addScore(newScore)
      refreshData()
    },
    [refreshData],
  )

  const getScoresByGame = useCallback(
    (gameId: string) => {
      return scores.filter((s) => s.gameId === gameId)
    },
    [scores],
  )

  return (
    <LeaderboardContext.Provider
      value={{
        games,
        scores,
        addGame,
        deleteGame,
        addScore,
        getScoresByGame,
        refreshData,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  )
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext)
  if (context === undefined) {
    throw new Error("useLeaderboard must be used within a LeaderboardProvider")
  }
  return context
}
