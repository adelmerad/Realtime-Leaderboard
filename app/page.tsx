import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Plus, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-balance">Realtime Leaderboard</h1>
            <p className="text-xl text-muted-foreground text-balance">
              Track scores and rankings across multiple games in realtime
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/games" className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Manage Games</CardTitle>
                  <CardDescription>Add new games and manage existing ones</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/submit-score" className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Submit Score</CardTitle>
                  <CardDescription>Add your score for any game</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/leaderboard" className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>View Leaderboard</CardTitle>
                  <CardDescription>See live rankings and compete</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Quick Start */}
          <Card className="mt-12 border-primary/20">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-muted-foreground">Create a new game from the Manage Games page</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-muted-foreground">Submit scores for players in that game</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-muted-foreground">Watch the leaderboard update in realtime</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
