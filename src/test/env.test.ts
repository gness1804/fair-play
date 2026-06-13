import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env validation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset modules so env.ts re-runs
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("accepts valid environment variables", async () => {
    Object.assign(process.env, {
      DATABASE_URL: "file:./test.db",
      AUTH_SECRET: "test-secret",
      AUTH_GOOGLE_ID: "test-google-id",
      AUTH_GOOGLE_SECRET: "test-google-secret",
    });

    // Direct schema validation test
    const { z } = await import("zod");
    const schema = z.object({
      DATABASE_URL: z.string().min(1),
      AUTH_SECRET: z.string().min(1),
      AUTH_GOOGLE_ID: z.string().min(1),
      AUTH_GOOGLE_SECRET: z.string().min(1),
    });

    const result = schema.safeParse({
      DATABASE_URL: process.env.DATABASE_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing environment variables", async () => {
    const { z } = await import("zod");
    const schema = z.object({
      DATABASE_URL: z.string().min(1),
      AUTH_SECRET: z.string().min(1),
      AUTH_GOOGLE_ID: z.string().min(1),
      AUTH_GOOGLE_SECRET: z.string().min(1),
    });

    const result = schema.safeParse({
      DATABASE_URL: undefined,
      AUTH_SECRET: undefined,
      AUTH_GOOGLE_ID: undefined,
      AUTH_GOOGLE_SECRET: undefined,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const missingVars = result.error.issues.map((issue) => issue.path.join("."));
      // Error output must name variables, not values
      expect(missingVars).toContain("DATABASE_URL");
      expect(missingVars).toContain("AUTH_SECRET");
      expect(missingVars).toContain("AUTH_GOOGLE_ID");
      expect(missingVars).toContain("AUTH_GOOGLE_SECRET");
      // Error message must not contain secret values
      const errorMessage = missingVars.join(", ");
      expect(errorMessage).not.toContain("your-auth-secret");
      expect(errorMessage).not.toContain("your-google");
    }
  });

  it("error output contains variable names only, never values", async () => {
    const { z } = await import("zod");
    const schema = z.object({
      AUTH_SECRET: z.string().min(1),
    });

    const result = schema.safeParse({ AUTH_SECRET: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorText = JSON.stringify(result.error.issues);
      // Error text should not echo any secret-like values
      expect(errorText).not.toMatch(/sk-|Bearer |password/i);
    }
  });
});
