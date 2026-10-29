import { describe, expect, it } from "vitest"
import { withPoolerSupport } from "@/lib/db-url"

describe("withPoolerSupport", () => {
  it("adds pgbouncer=true for pooled hosts", () => {
    const url = withPoolerSupport("postgresql://u:p@ep-x-pooler.eu-central-1.aws.neon.tech/db?sslmode=require")
    expect(new URL(url!).searchParams.get("pgbouncer")).toBe("true")
    expect(new URL(url!).searchParams.get("sslmode")).toBe("require")
  })

  it("leaves direct connections and explicit settings alone", () => {
    const direct = "postgresql://u:p@ep-x.eu-central-1.aws.neon.tech/db?sslmode=require"
    expect(withPoolerSupport(direct)).toBe(direct)
    const explicit = "postgresql://u:p@ep-x-pooler.neon.tech/db?pgbouncer=false"
    expect(withPoolerSupport(explicit)).toBe(explicit)
    expect(withPoolerSupport(undefined)).toBeUndefined()
  })
})
