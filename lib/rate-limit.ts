/**
 * In-memory token bucket. Good enough for a single instance; behind several
 * instances this should move to a shared store such as Redis.
 */
export class RateLimiter {
  private buckets = new Map<string, { tokens: number; updatedAt: number }>()

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
  ) {}

  /** Try to take one token. Returns how long to wait (in seconds) when limited. */
  take(key: string, now: number = Date.now()): { allowed: true } | { allowed: false; retryAfter: number } {
    const bucket = this.buckets.get(key) ?? { tokens: this.capacity, updatedAt: now }
    const elapsed = (now - bucket.updatedAt) / 1000
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillPerSecond)
    bucket.updatedAt = now

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1
      this.buckets.set(key, bucket)
      return { allowed: true }
    }
    this.buckets.set(key, bucket)
    return { allowed: false, retryAfter: Math.ceil((1 - bucket.tokens) / this.refillPerSecond) }
  }

  /** Drop buckets that are full again, to keep memory bounded. */
  prune(now: number = Date.now()) {
    for (const [key, b] of this.buckets) {
      const tokens = b.tokens + ((now - b.updatedAt) / 1000) * this.refillPerSecond
      if (tokens >= this.capacity) this.buckets.delete(key)
    }
  }
}

// 30 submissions per minute per game key, with bursts of up to 30
const globalForLimiter = globalThis as unknown as { scoreLimiter?: RateLimiter }
export const scoreLimiter = globalForLimiter.scoreLimiter ?? new RateLimiter(30, 0.5)
globalForLimiter.scoreLimiter = scoreLimiter
