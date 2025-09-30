"use client"

import type React from "react"

import { useState } from "react"
import { useLeaderboard } from "@/contexts/leaderboard-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, ArrowLeft, Gamepad2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function GamesPage() {
  const { games, addGame, deleteGame } = useLeaderboard()
  const [gameName, setGameName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault()
    if (gameName.trim()) {
      addGame(gameName.trim())
      setGameName("")
      setIsAdding(false)
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
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Manage Games</h1>
            </div>
            <p className="text-muted-foreground text-lg">Create and manage your games</p>
          </div>

          {/* Add Game Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Game</CardTitle>
              <CardDescription>Create a new game to track scores</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAdding ? (
                <Button onClick={() => setIsAdding(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Game
                </Button>
              ) : (
                <form onSubmit={handleAddGame} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gameName">Game Name</Label>
                    <Input
                      id="gameName"
                      placeholder="Enter game name..."
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Add Game
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAdding(false)
                        setGameName("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Games List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Games ({games.length})</h2>
            {games.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No games yet</p>
                  <p className="text-muted-foreground text-sm">Create your first game to start tracking scores</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {games.map((game) => (
                  <Card key={game.id} className="transition-all hover:shadow-md">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{game.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(game.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Game?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{game.name}" and all associated scores. This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteGame(game.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
