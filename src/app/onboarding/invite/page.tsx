import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserWithCouple } from "@/lib/couple";
import { db } from "@/lib/db";
import { MAX_COUPLE_MEMBERS } from "@/lib/invitations";
import { InviteForm } from "./InviteForm";

export default async function InvitePage() {
  const { user, couple } = await getCurrentUserWithCouple();
  if (!user) redirect("/");

  // Build the absolute origin from the request so the join link is copy-ready
  // and server/client render identically (no client-only window access).
  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";

  // Already paired — nothing to invite.
  if (couple && couple.members.length >= MAX_COUPLE_MEMBERS) {
    redirect("/dashboard");
  }

  // Surface an existing pending invite so the sender can copy the link again.
  let pendingToken: string | null = null;
  let pendingEmail: string | null = null;
  if (couple) {
    const pending = await db.invitation.findFirst({
      where: { coupleId: couple.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    pendingToken = pending?.token ?? null;
    pendingEmail = pending?.inviteeEmail ?? null;
  }

  return (
    <div
      style={{
        maxWidth: "560px",
        margin: "0 auto",
        padding: "var(--space-10) var(--space-6)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--fs-h1)",
          lineHeight: "var(--lh-tight)",
          color: "var(--fg)",
          margin: "0 0 var(--space-3)",
        }}
      >
        Invite your partner
      </h1>
      <p
        style={{
          color: "var(--fg-muted)",
          margin: "0 0 var(--space-8)",
          lineHeight: "var(--lh-body)",
        }}
      >
        Fair Play works as a pair. Send your partner an invite, then you&rsquo;ll
        set up the deck together.
      </p>
      <InviteForm
        initialToken={pendingToken}
        initialEmail={pendingEmail}
        origin={origin}
      />
    </div>
  );
}
