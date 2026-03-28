import { redirect } from "next/navigation"

// The global leaderboard page was replaced by one live page per game
export default function LeaderboardPage() {
  redirect("/games")
}
