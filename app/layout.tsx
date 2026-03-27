import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Realtime Leaderboard",
  description: "Live rankings for any game — submit scores through an API and watch the leaderboard update instantly.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
          <SiteHeader />
          {children}
        </div>
        <Toaster position="bottom-right" />
        {/* Vercel Analytics only exists on Vercel deployments */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
