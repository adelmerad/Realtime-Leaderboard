import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LeaderboardProvider } from "@/contexts/leaderboard-context"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Realtime Leaderboard",
  description: "Track scores and rankings in realtime",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <LeaderboardProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Toaster />
        </LeaderboardProvider>
        <Analytics />
      </body>
    </html>
  )
}
