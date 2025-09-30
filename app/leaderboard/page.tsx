"use client"

import { useState, useMemo } from "react"
import { useLeaderboard } from "@/contexts/leaderboard-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Medal, Award, Crown } from "lucide-react"
import Link from "next/link"
import type { LeaderboardEntry } from "@/lib/types"

export default function LeaderboardPage() {
  const { games, getScoresByGame } = useLeaderboard()
  const [selectedGameId, setSelectedGameId] = useState("")

  // Calculate leaderboard rankings
  const leaderboard = useMemo((): LeaderboardEntry[] => {
    if (!selectedGameId) return []

    const scores = getScoresByGame(selectedGameId)

    // Group scores by player name and keep their best score
    const playerBestScores = new Map<string, { score: number; timestamp: number }>()

    scores.forEach((score) => {
      const existing = playerBestScores.get(score.playerName)
      if (!existing || score.score > existing.score) {
        playerBestScores.set(score.playerName, {
          score: score.score,
          timestamp: score.timestamp,
        })
      }
    })

    // Convert to array and sort by score (descending)
    const sortedEntries = Array.from(playerBestScores.entries())
      .map(([playerName, data]) => ({
        playerName,
        score: data.score,
        timestamp: data.timestamp,
        rank: 0, // Will be assigned below
      }))
      .sort((a, b) => b.score - a.score)

    // Assign ranks
    sortedEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return sortedEntries
  }, [selectedGameId, getScoresByGame])

  const selectedGame = games.find((g) => g.id === selectedGameId)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/20"
      case 2:
        return "bg-gray-400/10 border-gray-400/20"
      case 3:
        return "bg-amber-600/10 border-amber-600/20"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-muted-foreground text-lg">View live rankings and compete</p>
          </div>

          {games.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No games available</p>
                <p className="text-muted-foreground text-sm mb-4">Create a game first to view leaderboards</p>
                <Link href="/games">
                  <Button>Go to Games</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Game Selection */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Select Game</CardTitle>
                  <CardDescription>Choose a game to view its leaderboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a game..." />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Leaderboard Display */}
              {selectedGame && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      {selectedGame.name} Rankings
                    </CardTitle>
                    <CardDescription>
                      {leaderboard.length} {leaderboard.length === 1 ? "player" : "players"} competing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leaderboard.length === 0 ? (
                      <div className="py-12 text-center">
                        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg mb-2">No scores yet</p>
                        <p className="text-muted-foreground text-sm mb-4">Be the first to submit a score!</p>
                        <Link href="/submit-score">
                          <Button>Submit Score</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leaderboard.map((entry) => (
                          <div
                            key={`${entry.playerName}-${entry.rank}`}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${getRankColor(entry.rank)}`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {/* Rank */}
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background/50 font-bold text-lg">
                                {getRankIcon(entry.rank) || `#${entry.rank}`}
                              </div>

                              {/* Player Info */}
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{entry.playerName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              </div>

                              {/* Score */}
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{entry.score}</div>
                                <div className="text-xs text-muted-foreground">points</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              {selectedGame && leaderboard.length > 0 && (
                <div className="mt-6 text-center">
                  <Link href="/submit-score">
                    <Button>Submit New Score</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
