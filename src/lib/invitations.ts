import { randomBytes } from "crypto";

// Invitation helpers. The pure functions here hold the load-bearing security
// decisions (email match, expiry, single-use, couple cap) so they can be unit
// tested without a database, and so the server action and any future caller
// share one source of truth.

export const DEFAULT_INVITE_TTL_DAYS = 7;
export const MAX_COUPLE_MEMBERS = 2;

/** Normalize an email for storage and comparison: trimmed + lowercased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Crypto-random, URL-safe, single-use invitation token. */
export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export function inviteExpiry(now: Date, days: number = DEFAULT_INVITE_TTL_DAYS): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export type InviteRejection =
  | "NOT_FOUND"
  | "NOT_PENDING"
  | "EXPIRED"
  | "EMAIL_MISMATCH"
  | "COUPLE_FULL"
  | "ALREADY_IN_COUPLE";

export type InviteEvaluation = { ok: true } | { ok: false; reason: InviteRejection };

interface EvaluateArgs {
  invitation: {
    status: string;
    expiresAt: Date;
    inviteeEmail: string;
    coupleId: string;
  } | null;
  /** The authenticated visitor's email (from the session). */
  sessionEmail: string;
  /** Current member count of the invitation's couple. */
  memberCount: number;
  /** The visitor's existing coupleId, if any. */
  userCoupleId: string | null;
  now: Date;
}

/**
 * Decide whether an authenticated visitor may accept an invitation. Pure: the
 * caller supplies the loaded invitation, the visitor's email/couple, and the
 * couple's member count. Never trusts a client-supplied identity.
 */
export function evaluateInviteAcceptance(args: EvaluateArgs): InviteEvaluation {
  const { invitation, sessionEmail, memberCount, userCoupleId, now } = args;

  if (!invitation) return { ok: false, reason: "NOT_FOUND" };
  if (invitation.status !== "PENDING") return { ok: false, reason: "NOT_PENDING" };
  if (invitation.expiresAt.getTime() < now.getTime()) {
    return { ok: false, reason: "EXPIRED" };
  }
  if (normalizeEmail(invitation.inviteeEmail) !== normalizeEmail(sessionEmail)) {
    return { ok: false, reason: "EMAIL_MISMATCH" };
  }
  // Already attached to a couple (this one or another) — nothing to accept.
  if (userCoupleId) {
    return { ok: false, reason: "ALREADY_IN_COUPLE" };
  }
  if (memberCount >= MAX_COUPLE_MEMBERS) {
    return { ok: false, reason: "COUPLE_FULL" };
  }
  return { ok: true };
}

export function inviteRejectionMessage(reason: InviteRejection): string {
  switch (reason) {
    case "NOT_FOUND":
      return "This invitation link is not valid.";
    case "NOT_PENDING":
      return "This invitation has already been used or revoked.";
    case "EXPIRED":
      return "This invitation has expired. Ask your partner to send a new one.";
    case "EMAIL_MISMATCH":
      return "This invitation was sent to a different email address. Sign in with the invited Google account.";
    case "COUPLE_FULL":
      return "This couple already has two members.";
    case "ALREADY_IN_COUPLE":
      return "You're already part of a couple.";
  }
}
