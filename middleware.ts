import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-session"

// Protect the admin area; the login page itself stays public
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === "/admin/login") return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const valid = await verifySessionToken(token, process.env.AUTH_SECRET ?? "")
  if (valid) return NextResponse.next()

  const login = new URL("/admin/login", request.url)
  login.searchParams.set("next", pathname)
  return NextResponse.redirect(login)
}

export const config = { matcher: ["/admin/:path*"] }
