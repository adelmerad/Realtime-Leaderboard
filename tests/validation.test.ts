import { describe, expect, it } from "vitest"
import { createGameSchema, periodSchema, slugify, submitScoreSchema } from "@/lib/validation"
import { sseFrame } from "@/lib/realtime"

describe("submitScoreSchema", () => {
  it("accepts a valid score and trims the name", () => {
    expect(submitScoreSchema.parse({ player: "  Sarah ", value: "1200" })).toEqual({ player: "Sarah", value: 1200 })
  })

  it("accepts accented names and decimals", () => {
    expect(submitScoreSchema.safeParse({ player: "Inès_B", value: 298.45 }).success).toBe(true)
  })

  it("rejects bad names and values", () => {
    expect(submitScoreSchema.safeParse({ player: "S", value: 10 }).success).toBe(false)
    expect(submitScoreSchema.safeParse({ player: "<script>", value: 10 }).success).toBe(false)
    expect(submitScoreSchema.safeParse({ player: "Sarah", value: "abc" }).success).toBe(false)
    expect(submitScoreSchema.safeParse({ player: "Sarah", value: Infinity }).success).toBe(false)
    expect(submitScoreSchema.safeParse({ player: "Sarah", value: 1e12 }).success).toBe(false)
  })
})

describe("createGameSchema", () => {
  it("defaults the unit to points", () => {
    expect(createGameSchema.parse({ name: "Tetris", sortOrder: "HIGHER_IS_BETTER", unit: "" }).unit).toBe("points")
  })
})

describe("periodSchema", () => {
  it("falls back to all time for unknown values", () => {
    expect(periodSchema.parse("week")).toBe("week")
    expect(periodSchema.parse("month")).toBe("all")
  })
})

describe("slugify", () => {
  it("builds URL-friendly slugs", () => {
    expect(slugify("Mario 1-1 Speedrun!")).toBe("mario-1-1-speedrun")
    expect(slugify("Échecs Éclair")).toBe("echecs-eclair")
    expect(slugify("***")).toBe("game")
  })
})

describe("sseFrame", () => {
  it("encodes a named Server-Sent Event", () => {
    expect(sseFrame("score", { a: 1 })).toBe('event: score\ndata: {"a":1}\n\n')
  })
})
