import { z } from "zod"

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v)

export const periodSchema = z.enum(["all", "week", "day"]).catch("all")

export const playerNameSchema = z
  .string()
  .trim()
  .min(2, "Player name must have at least 2 characters")
  .max(32, "Player name must have at most 32 characters")
  .regex(/^[\p{L}\p{N} _.\-]+$/u, "Use letters, numbers, spaces, dots, dashes or underscores")

export const scoreValueSchema = z.coerce
  .number({ invalid_type_error: "Score must be a number" })
  .finite("Score must be a finite number")
  .min(-1_000_000_000, "Score is too low")
  .max(1_000_000_000, "Score is too high")

/** Body accepted by POST /api/games/:slug/scores */
export const submitScoreSchema = z.object({
  player: playerNameSchema,
  value: scoreValueSchema,
})

export const createGameSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters").max(60),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  sortOrder: z.enum(["HIGHER_IS_BETTER", "LOWER_IS_BETTER"], {
    errorMap: () => ({ message: "Choose how scores are ranked" }),
  }),
  unit: z.preprocess(emptyToUndefined, z.string().trim().max(16).default("points")),
})

export const adminScoreSchema = z.object({
  gameId: z.string().min(1, "Choose a game"),
  player: playerNameSchema,
  value: scoreValueSchema,
})

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

/** URL-friendly identifier derived from a game name */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "game"
}
