import { PrismaClient } from "@prisma/client"
import { withPoolerSupport } from "./db-url"

// Reuse a single client across hot reloads in development
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: withPoolerSupport(process.env.DATABASE_URL) })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
