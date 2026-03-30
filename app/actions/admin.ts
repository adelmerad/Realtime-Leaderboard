"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { generateApiKey } from "@/lib/api-keys"
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  checkAdminPassword,
  createSessionToken,
  sessionSecret,
  verifySessionToken,
} from "@/lib/admin-session"
import { parseForm, type ActionState } from "@/lib/action-state"
import { publish } from "@/lib/realtime"
import { recordScore } from "@/lib/scores"
import { adminScoreSchema, createGameSchema, loginSchema, slugify } from "@/lib/validation"

// Server actions are public endpoints: every admin action re-checks the session itself
async function requireAdmin() {
  const ok = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value, sessionSecret())
  if (!ok) redirect("/admin/login")
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(loginSchema, formData)
  if (!parsed.success) return parsed.state
  if (!checkAdminPassword(parsed.data.password)) return { ok: false, errors: { password: "Wrong password" } }

  cookies().set(SESSION_COOKIE, await createSessionToken(sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  })
  const next = formData.get("next")
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin")
}

export async function logout() {
  cookies().delete(SESSION_COOKIE)
  redirect("/")
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name)
  for (let i = 1; ; i++) {
    const slug = i === 1 ? base : `${base}-${i}`
    if (!(await db.game.findUnique({ where: { slug }, select: { id: true } }))) return slug
  }
}

export async function createGame(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = parseForm(createGameSchema, formData)
  if (!parsed.success) return parsed.state

  const { key, hash, prefix } = generateApiKey()
  try {
    const game = await db.game.create({
      data: { ...parsed.data, slug: await uniqueSlug(parsed.data.name), apiKeyHash: hash, apiKeyPrefix: prefix },
    })
    revalidatePath("/", "layout")
    return { ok: true, message: `${game.name} created.`, data: { apiKey: key, slug: game.slug, name: game.name } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, errors: { name: "A game with this name already exists" } }
    }
    throw error
  }
}

export async function rotateApiKey(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  const gameId = String(formData.get("gameId") ?? "")
  const { key, hash, prefix } = generateApiKey()
  const game = await db.game.update({ where: { id: gameId }, data: { apiKeyHash: hash, apiKeyPrefix: prefix } })
  revalidatePath("/admin")
  return { ok: true, message: `New API key for ${game.name}. The old key stops working now.`, data: { apiKey: key, slug: game.slug, name: game.name } }
}

export async function deleteGame(gameId: string) {
  await requireAdmin()
  const game = await db.game.delete({ where: { id: gameId }, select: { id: true, slug: true } })
  await publish({ type: "game-deleted", gameId: game.id, gameSlug: game.slug })
  revalidatePath("/", "layout")
}

export async function submitScoreAsAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = parseForm(adminScoreSchema, formData)
  if (!parsed.success) return parsed.state

  const game = await db.game.findUnique({ where: { id: parsed.data.gameId } })
  if (!game) return { ok: false, errors: { gameId: "This game no longer exists" } }

  await recordScore(game, parsed.data.player, parsed.data.value, "ADMIN")
  revalidatePath("/", "layout")
  return { ok: true, message: `Score of ${parsed.data.value} recorded for ${parsed.data.player}.` }
}
