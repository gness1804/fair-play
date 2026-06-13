import { describe, it, expect } from "vitest";
import { authConfig } from "@/auth.config";

describe("authConfig", () => {
  it("has Google provider configured", () => {
    expect(authConfig.providers).toBeDefined();
    expect(authConfig.providers.length).toBeGreaterThan(0);
  });

  it("sets signIn page to /", () => {
    expect(authConfig.pages?.signIn).toBe("/");
  });

  it("authorized callback returns false for unauthenticated protected routes", () => {
    const authorized = authConfig.callbacks?.authorized;
    expect(authorized).toBeDefined();
    if (!authorized) return;

    const result = authorized({
      auth: null,
      request: {
        nextUrl: { pathname: "/dashboard" },
      } as unknown as Parameters<typeof authorized>[0]["request"],
    });

    expect(result).toBe(false);
  });

  it("authorized callback returns true for unauthenticated public routes", () => {
    const authorized = authConfig.callbacks?.authorized;
    expect(authorized).toBeDefined();
    if (!authorized) return;

    const result = authorized({
      auth: null,
      request: {
        nextUrl: { pathname: "/" },
      } as unknown as Parameters<typeof authorized>[0]["request"],
    });

    expect(result).toBe(true);
  });

  it("authorized callback returns true for authenticated users on protected routes", () => {
    const authorized = authConfig.callbacks?.authorized;
    expect(authorized).toBeDefined();
    if (!authorized) return;

    const result = authorized({
      auth: { user: { name: "Test", email: "test@example.com" }, expires: "" },
      request: {
        nextUrl: { pathname: "/dashboard" },
      } as unknown as Parameters<typeof authorized>[0]["request"],
    });

    expect(result).toBe(true);
  });
});
