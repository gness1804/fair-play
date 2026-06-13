import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Resolve the SQLite file URL from DATABASE_URL env var.
// Expected format: "file:./dev.db" or "file:/absolute/path/dev.db"
function getDbUrl(): string {
  return process.env.DATABASE_URL ?? "file:./dev.db";
}

function createPrismaClient(): PrismaClient {
  // Prisma 7 requires a driver adapter for SQLite
  const adapter = new PrismaLibSql({ url: getDbUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
