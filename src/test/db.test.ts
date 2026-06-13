import { describe, it, expect, vi } from "vitest";

// Mock PrismaClient to test singleton behavior
vi.mock("@prisma/client", () => {
  class PrismaClientMock {
    $connect = vi.fn();
    $disconnect = vi.fn();
  }
  return { PrismaClient: PrismaClientMock };
});

describe("db singleton", () => {
  it("returns the same PrismaClient instance across imports", async () => {
    // Clear the global singleton between tests
    const g = globalThis as unknown as { prisma: unknown };
    delete g.prisma;

    const { db: db1 } = await import("@/lib/db");
    const { db: db2 } = await import("@/lib/db");

    expect(db1).toBe(db2);
  });
});
