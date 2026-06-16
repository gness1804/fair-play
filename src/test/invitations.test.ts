import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  generateInviteToken,
  inviteExpiry,
  evaluateInviteAcceptance,
  inviteRejectionMessage,
  DEFAULT_INVITE_TTL_DAYS,
} from "@/lib/invitations";

const NOW = new Date("2026-06-15T12:00:00.000Z");

function pendingInvite(overrides: Partial<{
  status: string;
  expiresAt: Date;
  inviteeEmail: string;
  coupleId: string;
}> = {}) {
  return {
    status: "PENDING",
    expiresAt: new Date("2026-06-20T12:00:00.000Z"),
    inviteeEmail: "partner@example.com",
    coupleId: "couple_1",
    ...overrides,
  };
}

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Partner@Example.COM ")).toBe("partner@example.com");
  });
});

describe("generateInviteToken", () => {
  it("produces a URL-safe token of meaningful length", () => {
    const token = generateInviteToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(32);
  });

  it("produces distinct tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateInviteToken()));
    expect(tokens.size).toBe(100);
  });
});

describe("inviteExpiry", () => {
  it("defaults to the configured TTL ahead of now", () => {
    const expiry = inviteExpiry(NOW);
    const expected = NOW.getTime() + DEFAULT_INVITE_TTL_DAYS * 24 * 60 * 60 * 1000;
    expect(expiry.getTime()).toBe(expected);
  });
});

describe("evaluateInviteAcceptance", () => {
  it("accepts a valid pending invite for the matching email", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite(),
      sessionEmail: "partner@example.com",
      memberCount: 1,
      userCoupleId: null,
      now: NOW,
    });
    expect(result).toEqual({ ok: true });
  });

  it("matches email case-insensitively", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite({ inviteeEmail: "Partner@Example.com" }),
      sessionEmail: "PARTNER@example.COM",
      memberCount: 1,
      userCoupleId: null,
      now: NOW,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a missing invitation", () => {
    const result = evaluateInviteAcceptance({
      invitation: null,
      sessionEmail: "partner@example.com",
      memberCount: 0,
      userCoupleId: null,
      now: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "NOT_FOUND" });
  });

  it("rejects a non-pending invitation", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite({ status: "ACCEPTED" }),
      sessionEmail: "partner@example.com",
      memberCount: 1,
      userCoupleId: null,
      now: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "NOT_PENDING" });
  });

  it("rejects an expired invitation", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite({ expiresAt: new Date("2026-06-14T12:00:00.000Z") }),
      sessionEmail: "partner@example.com",
      memberCount: 1,
      userCoupleId: null,
      now: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "EXPIRED" });
  });

  it("rejects an email mismatch (security boundary)", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite(),
      sessionEmail: "someone-else@example.com",
      memberCount: 1,
      userCoupleId: null,
      now: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "EMAIL_MISMATCH" });
  });

  it("rejects when the user is already in another couple", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite(),
      sessionEmail: "partner@example.com",
      memberCount: 1,
      userCoupleId: "couple_other",
      now: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "ALREADY_IN_COUPLE" });
  });

  it("rejects re-accepting the same couple", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite({ coupleId: "couple_1" }),
      sessionEmail: "partner@example.com",
      memberCount: 1,
      userCoupleId: "couple_1",
      now: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "ALREADY_IN_COUPLE" });
  });

  it("rejects when the couple is already full", () => {
    const result = evaluateInviteAcceptance({
      invitation: pendingInvite(),
      sessionEmail: "partner@example.com",
      memberCount: 2,
      userCoupleId: null,
      now: NOW,
    });
    expect(result).toEqual({ ok: false, reason: "COUPLE_FULL" });
  });
});

describe("inviteRejectionMessage", () => {
  it("returns a non-empty message for every reason", () => {
    const reasons = [
      "NOT_FOUND",
      "NOT_PENDING",
      "EXPIRED",
      "EMAIL_MISMATCH",
      "COUPLE_FULL",
      "ALREADY_IN_COUPLE",
    ] as const;
    for (const reason of reasons) {
      expect(inviteRejectionMessage(reason).length).toBeGreaterThan(0);
    }
  });
});
