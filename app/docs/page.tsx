import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "API · Realtime Leaderboard" }

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/games/:slug/scores",
    auth: "Bearer <game API key>",
    description: "Submit a score. The player is created on first submission. Rate limited to 30 requests per minute per game.",
    request: `{ "player": "Sarah", "value": 1200 }`,
    response: `201 Created
{ "score": { "id": "…", "player": "Sarah", "value": 1200, "submittedAt": "…" },
  "rank": 3, "personalBest": 1450 }`,
  },
  {
    method: "GET",
    path: "/api/games/:slug/leaderboard?period=all|week|day&limit=100",
    description: "Current ranking: each player's best score in the period, with competition ranks (ties share a rank).",
    response: `{ "game": {…}, "period": "all", "totalPlayers": 42,
  "entries": [{ "rank": 1, "playerName": "Sarah", "value": 1450, "achievedAt": "…" }] }`,
  },
  {
    method: "GET",
    path: "/api/games/:slug/stream?period=all|week|day",
    description: "Server-Sent Events. Sends a `leaderboard` event on connect and after every new score, a `score` event for each submission, and `game-deleted` if the game is removed.",
    response: `event: score
data: { "playerName": "Sarah", "value": 1200, … }

event: leaderboard
data: { "entries": [ … ] }`,
  },
  {
    method: "GET",
    path: "/api/stream",
    description: "Server-Sent Events for every game: the 10 most recent scores on connect, then each new score.",
  },
  { method: "GET", path: "/api/games", description: "List of games with player and score counts." },
  { method: "GET", path: "/api/health", description: "Liveness and database check." },
]

const ERRORS = [
  ["401", "Missing or invalid API key"],
  ["404", "Unknown game"],
  ["422", "Invalid body — details list each field"],
  ["429", "Rate limit reached — see the Retry-After header"],
]

export default function DocsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">API</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Each game gets its own API key from the admin dashboard. Send it as a Bearer token when submitting scores.
          </p>
        </div>

        {ENDPOINTS.map((e) => (
          <Card key={e.path}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 font-mono text-base">
                <Badge variant={e.method === "POST" ? "default" : "secondary"}>{e.method}</Badge>
                {e.path}
              </CardTitle>
              <CardDescription>{e.description}</CardDescription>
              {e.auth && <p className="text-sm">Auth: <code className="font-mono">{e.auth}</code></p>}
            </CardHeader>
            {(e.request || e.response) && (
              <CardContent className="space-y-2">
                {e.request && <pre className="overflow-x-auto rounded bg-muted p-3 font-mono text-xs">{e.request}</pre>}
                {e.response && <pre className="overflow-x-auto rounded bg-muted p-3 font-mono text-xs">{e.response}</pre>}
              </CardContent>
            )}
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {ERRORS.map(([code, text]) => (
                <li key={code}>
                  <code className="font-mono font-semibold">{code}</code> — {text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
