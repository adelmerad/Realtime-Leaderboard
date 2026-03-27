import Link from "next/link"
import { Trophy } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Trophy className="h-5 w-5 text-primary" />
          Realtime Leaderboard
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/games" className="hover:text-foreground">
            Games
          </Link>
          <Link href="/docs" className="hover:text-foreground">
            API
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
