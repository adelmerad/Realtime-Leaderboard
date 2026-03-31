import { ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "./login-form"

export const metadata = { title: "Admin login · Realtime Leaderboard" }

export default function AdminLoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <main className="container mx-auto flex justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto mb-2 h-10 w-10 text-primary" />
          <CardTitle>Admin</CardTitle>
          <CardDescription>Manage games, API keys and scores</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={searchParams.next} />
        </CardContent>
      </Card>
    </main>
  )
}
