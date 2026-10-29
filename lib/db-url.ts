/**
 * Behind PgBouncer in transaction mode (e.g. Neon "-pooler" hosts) Prisma must not reuse
 * prepared statements across pooled server connections: add `pgbouncer=true` automatically.
 */
export function withPoolerSupport(url: string | undefined): string | undefined {
  if (!url) return url
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("-pooler") && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true")
      return parsed.toString()
    }
  } catch {
    // leave unparsable URLs untouched; Prisma reports the error
  }
  return url
}
