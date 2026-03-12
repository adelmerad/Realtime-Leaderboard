import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

const PREFIX = "lb_"

/** Generate a new API key. Only its hash is stored; the key is shown once to the admin. */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = PREFIX + randomBytes(24).toString("base64url")
  return { key, hash: hashApiKey(key), prefix: key.slice(0, PREFIX.length + 6) }
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

/** Constant-time comparison of a presented key against a stored hash. */
export function verifyApiKey(key: string, storedHash: string): boolean {
  const a = Buffer.from(hashApiKey(key), "hex")
  const b = Buffer.from(storedHash, "hex")
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Extract the key from an `Authorization: Bearer <key>` header. */
export function bearerToken(header: string | null): string | null {
  if (!header) return null
  const match = header.match(/^Bearer\s+(\S+)$/i)
  return match ? match[1] : null
}
