import { describe, expect, it } from "vitest"
import { retryDelay } from "@/lib/realtime"

describe("retryDelay", () => {
  it("backs off exponentially and caps at 30 seconds", () => {
    expect([0, 1, 2, 3, 4].map(retryDelay)).toEqual([1000, 2000, 4000, 8000, 16000])
    expect(retryDelay(5)).toBe(30000)
    expect(retryDelay(20)).toBe(30000)
  })
})
