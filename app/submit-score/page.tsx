"use client"

import type React from "react"

import { useState } from "react"
import { useLeaderboard } from "@/contexts/leaderboard-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function SubmitScorePage() {
  const { games, addScore } = useLeaderboard()
  const { toast } = useToast()
  const [selectedGameId, setSelectedGameId] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [score, setScore] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGameId || !playerName.trim() || !score) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const scoreValue = Number.parseFloat(score)
    if (isNaN(scoreValue)) {
      toast({
        title: "Invalid Score",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    addScore(selectedGameId, playerName.trim(), scoreValue)

    toast({
      title: "Score Submitted!",
      description: `${playerName}'s score of ${scoreValue} has been added`,
    })

    // Reset form
    setPlayerName("")
    setScore("")
    setIsSubmitting(false)
  }

  const selectedGame = games.find((g) => g.id === selectedGameId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Submit Score</h1>
            </div>
            <p className="text-muted-foreground text-lg">Add a new score to the leaderboard</p>
          </div>

          {games.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No games available</p>
                <p className="text-muted-foreground text-sm mb-4">Create a game first before submitting scores</p>
                <Link href="/games">
                  <Button>Go to Games</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Score Details</CardTitle>
                <CardDescription>Enter the player name and score</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Game Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="game">Select Game</Label>
                    <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                      <SelectTrigger id="game">
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
                  </div>

                  {/* Player Name */}
                  <div className="space-y-2">
                    <Label htmlFor="playerName">Player Name</Label>
                    <Input
                      id="playerName"
                      placeholder="Enter player name..."
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                  </div>

                  {/* Score */}
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      type="number"
                      step="any"
                      placeholder="Enter score..."
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Score
                  </Button>
                </form>

                {/* Selected Game Info */}
                {selectedGame && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Submitting to:</p>
                    <p className="font-semibold">{selectedGame.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Link */}
          {games.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/leaderboard">
                <Button variant="outline">View Leaderboard</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
