import { describe, expect, it } from "vitest"
import { formatValue, isBetter, periodStart, rankScores } from "@/lib/ranking"
import type { BestScore } from "@/lib/types"

const s = (playerName: string, value: number, minutes = 0): BestScore => ({
  playerId: playerName.toLowerCase(),
  playerName,
  value,
  achievedAt: new Date(Date.UTC(2026, 2, 10, 12, minutes)),
})

describe("rankScores", () => {
  it("ranks highest first for high-score games", () => {
    const ranked = rankScores([s("Lina", 300), s("Sarah", 900), s("Karim", 500)], "HIGHER_IS_BETTER")
    expect(ranked.map((e) => [e.rank, e.playerName])).toEqual([
      [1, "Sarah"],
      [2, "Karim"],
      [3, "Lina"],
    ])
  })

  it("ranks lowest first for time-based games", () => {
    const ranked = rankScores([s("Lina", 312.5), s("Sarah", 298.1), s("Karim", 305)], "LOWER_IS_BETTER")
    expect(ranked.map((e) => e.playerName)).toEqual(["Sarah", "Karim", "Lina"])
  })

  it("gives tied players the same rank and skips the next one", () => {
    const ranked = rankScores([s("A", 100, 5), s("B", 100, 1), s("C", 90), s("D", 80)], "HIGHER_IS_BETTER")
    expect(ranked.map((e) => [e.playerName, e.rank])).toEqual([
      ["B", 1], // reached 100 first
      ["A", 1],
      ["C", 3],
      ["D", 4],
    ])
  })

  it("returns an empty board without scores", () => {
    expect(rankScores([], "HIGHER_IS_BETTER")).toEqual([])
  })
})

describe("isBetter", () => {
  it("compares according to the sort order", () => {
    expect(isBetter(10, 5, "HIGHER_IS_BETTER")).toBe(true)
    expect(isBetter(10, 5, "LOWER_IS_BETTER")).toBe(false)
    expect(isBetter(10, undefined, "LOWER_IS_BETTER")).toBe(true)
  })
})

describe("periodStart", () => {
  // Thursday 12 March 2026, 15:30 UTC
  const now = new Date(Date.UTC(2026, 2, 12, 15, 30))

  it("is null for all time", () => {
    expect(periodStart("all", now)).toBeNull()
  })

  it("starts at midnight UTC for today", () => {
    expect(periodStart("day", now)?.toISOString()).toBe("2026-03-12T00:00:00.000Z")
  })

  it("starts on Monday for this week", () => {
    expect(periodStart("week", now)?.toISOString()).toBe("2026-03-09T00:00:00.000Z")
    // On a Sunday the week still started the previous Monday
    expect(periodStart("week", new Date(Date.UTC(2026, 2, 15, 10)))?.toISOString()).toBe("2026-03-09T00:00:00.000Z")
  })
})

describe("formatValue", () => {
  it("formats integers and decimals with the unit", () => {
    expect(formatValue(12000, "points")).toBe("12,000 points")
    expect(formatValue(298.125, "seconds")).toBe("298.125 seconds")
  })
})
