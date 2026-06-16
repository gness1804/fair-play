"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  evaluateInviteAcceptance,
  generateInviteToken,
  inviteExpiry,
  normalizeEmail,
  MAX_COUPLE_MEMBERS,
  type InviteRejection,
} from "@/lib/invitations";
import { nextPhase } from "@/lib/phase";

// Internal signal for a state change detected *inside* the accept transaction
// (lost race for the invite or the second seat). Not exported — "use server"
// modules may only export async functions.
class InviteRaceError extends Error {
  constructor(public readonly reason: InviteRejection) {
    super(reason);
    this.name = "InviteRaceError";
  }
}

export type InviteFormState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "success"; token: string };

const inviteSchema = z.object({
  email: z.string().trim().email().max(254),
});

/**
 * Create (if needed) the current user's couple and issue a single-use invite
 * for the given email. Re-inviting revokes any prior pending invite. The couple
 * is capped at two members. Returns form state for useActionState.
 */
export async function createInvite(
  _prev: InviteFormState,
  formData: FormData
): Promise<InviteFormState> {
  const session = await auth();
  const sessionEmail = session?.user?.email;
  if (!sessionEmail) redirect("/");

  const parsed = inviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", error: "Please enter a valid email address." };
  }
  const inviteeEmail = normalizeEmail(parsed.data.email);

  if (normalizeEmail(sessionEmail) === inviteeEmail) {
    return { status: "error", error: "You can't invite yourself." };
  }

  const user = await db.user.findUnique({
    where: { email: sessionEmail },
    include: { couple: { include: { members: true } } },
  });
  if (!user) redirect("/");

  if (user.couple && user.couple.members.length >= MAX_COUPLE_MEMBERS) {
    return { status: "error", error: "Your couple already has two members." };
  }

  const token = generateInviteToken();
  const now = new Date();

  await db.$transaction(async (tx) => {
    let coupleId = user.coupleId;

    if (!coupleId) {
      const couple = await tx.couple.create({ data: { phase: "INVITE" } });
      coupleId = couple.id;
      await tx.user.update({
        where: { id: user.id },
        data: { coupleId },
      });
    }

    // Single active invite: revoke any prior pending invites for this couple.
    await tx.invitation.updateMany({
      where: { coupleId, status: "PENDING" },
      data: { status: "REVOKED" },
    });

    await tx.invitation.create({
      data: {
        coupleId,
        senderId: user.id,
        inviteeEmail,
        token,
        status: "PENDING",
        expiresAt: inviteExpiry(now),
      },
    });
  });

  return { status: "success", token };
}

/**
 * Accept an invitation. Re-validates server-side via evaluateInviteAcceptance
 * (never trusts the client), joins the couple, marks the invite ACCEPTED, and
 * advances the phase to QUESTIONNAIRE once the couple has two members.
 */
export async function acceptInvite(formData: FormData): Promise<void> {
  const token = formData.get("token");
  if (typeof token !== "string" || token.length === 0) {
    redirect("/onboarding/invite");
  }

  const session = await auth();
  const sessionEmail = session?.user?.email;
  if (!sessionEmail) redirect("/");

  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { couple: { include: { members: true } } },
  });

  const user = await db.user.findUnique({ where: { email: sessionEmail } });
  if (!user) redirect("/");

  const evaluation = evaluateInviteAcceptance({
    invitation: invitation
      ? {
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          inviteeEmail: invitation.inviteeEmail,
          coupleId: invitation.coupleId,
        }
      : null,
    sessionEmail,
    memberCount: invitation?.couple.members.length ?? 0,
    userCoupleId: user.coupleId,
    now: new Date(),
  });

  if (!evaluation.ok || !invitation) {
    const reason = evaluation.ok ? "NOT_FOUND" : evaluation.reason;
    redirect(`/join/${encodeURIComponent(token)}?error=${reason}`);
  }

  try {
    await db.$transaction(async (tx) => {
      // Consume the invite atomically: only one accept can flip PENDING.
      // Re-checking status here (not just in the earlier evaluate) closes the
      // TOCTOU window between read and write.
      const consumed = await tx.invitation.updateMany({
        where: { id: invitation.id, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
      if (consumed.count !== 1) {
        throw new InviteRaceError("NOT_PENDING");
      }

      // Re-check the seat cap inside the transaction. The joining user is not
      // yet a member, so this counts existing members only.
      const memberCount = await tx.user.count({
        where: { coupleId: invitation.coupleId },
      });
      if (memberCount >= MAX_COUPLE_MEMBERS) {
        throw new InviteRaceError("COUPLE_FULL");
      }

      await tx.user.update({
        where: { id: user.id },
        data: { coupleId: invitation.coupleId },
      });

      if (
        memberCount + 1 >= MAX_COUPLE_MEMBERS &&
        invitation.couple.phase === "INVITE"
      ) {
        await tx.couple.update({
          where: { id: invitation.coupleId },
          data: { phase: nextPhase("INVITE") },
        });
      }
    });
  } catch (err) {
    // A lost race rolls back the whole transaction. Send the visitor back to
    // the join page; the DB now reflects the post-race truth and the page's
    // live evaluation will render the accurate reason.
    if (err instanceof InviteRaceError) {
      redirect(`/join/${encodeURIComponent(token)}`);
    }
    throw err;
  }

  redirect("/dashboard");
}
