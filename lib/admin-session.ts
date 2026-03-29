// Signed admin session cookie. Uses Web Crypto only, so it also runs in the Edge middleware.

export const SESSION_COOKIE = "lb_admin"
export const SESSION_TTL_SECONDS = 12 * 60 * 60

const encoder = new TextEncoder()

function base64url(bytes: ArrayBuffer): string {
  let s = ""
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ])
  return base64url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)))
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Token format: `<expiresAt>.<signature>` */
export async function createSessionToken(secret: string, now: number = Date.now()): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS
  return `${expiresAt}.${await hmac(secret, `admin:${expiresAt}`)}`
}

export async function verifySessionToken(token: string | undefined, secret: string, now: number = Date.now()): Promise<boolean> {
  if (!token || !secret) return false
  const [expiresAt, signature] = token.split(".")
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) * 1000 <= now) return false
  return safeEqual(signature, await hmac(secret, `admin:${expiresAt}`))
}

export function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET must be set (at least 16 characters)")
  return secret
}

/** Constant-time check of the admin password from ADMIN_PASSWORD. */
export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(candidate, expected)
}
