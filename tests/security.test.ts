import { describe, expect, it } from "vitest"
import { bearerToken, generateApiKey, hashApiKey, verifyApiKey } from "@/lib/api-keys"
import { createSessionToken, verifySessionToken, SESSION_TTL_SECONDS } from "@/lib/admin-session"
import { RateLimiter } from "@/lib/rate-limit"

describe("API keys", () => {
  it("generates unique keys whose hash verifies", () => {
    const a = generateApiKey()
    const b = generateApiKey()
    expect(a.key).not.toBe(b.key)
    expect(a.key.startsWith("lb_")).toBe(true)
    expect(a.prefix).toBe(a.key.slice(0, 9))
    expect(verifyApiKey(a.key, a.hash)).toBe(true)
    expect(verifyApiKey(b.key, a.hash)).toBe(false)
  })

  it("never stores the key itself", () => {
    const { key, hash } = generateApiKey()
    expect(hash).not.toContain(key)
    expect(hash).toBe(hashApiKey(key))
    expect(hash).toHaveLength(64)
  })

  it("parses Bearer headers", () => {
    expect(bearerToken("Bearer lb_abc")).toBe("lb_abc")
    expect(bearerToken("bearer lb_abc")).toBe("lb_abc")
    expect(bearerToken("Basic xyz")).toBeNull()
    expect(bearerToken(null)).toBeNull()
  })
})

describe("admin session", () => {
  const secret = "a-very-long-test-secret"
  const now = Date.UTC(2026, 2, 20, 10)

  it("accepts a valid token", async () => {
    const token = await createSessionToken(secret, now)
    expect(await verifySessionToken(token, secret, now + 1000)).toBe(true)
  })

  it("rejects tampered, foreign or expired tokens", async () => {
    const token = await createSessionToken(secret, now)
    const [exp, sig] = token.split(".")
    expect(await verifySessionToken(`${Number(exp) + 3600}.${sig}`, secret, now)).toBe(false)
    expect(await verifySessionToken(token, "another-long-secret-value", now)).toBe(false)
    expect(await verifySessionToken(token, secret, now + (SESSION_TTL_SECONDS + 1) * 1000)).toBe(false)
    expect(await verifySessionToken(undefined, secret, now)).toBe(false)
    expect(await verifySessionToken("garbage", secret, now)).toBe(false)
  })
})

describe("RateLimiter", () => {
  it("allows a burst up to capacity, then limits", () => {
    const limiter = new RateLimiter(3, 1)
    const t = 1_000_000
    expect(limiter.take("k", t).allowed).toBe(true)
    expect(limiter.take("k", t).allowed).toBe(true)
    expect(limiter.take("k", t).allowed).toBe(true)
    const limited = limiter.take("k", t)
    expect(limited.allowed).toBe(false)
    if (!limited.allowed) expect(limited.retryAfter).toBe(1)
  })

  it("refills over time and keeps keys independent", () => {
    const limiter = new RateLimiter(1, 0.5)
    const t = 1_000_000
    expect(limiter.take("a", t).allowed).toBe(true)
    expect(limiter.take("a", t).allowed).toBe(false)
    expect(limiter.take("b", t).allowed).toBe(true)
    expect(limiter.take("a", t + 2000).allowed).toBe(true)
  })
})
