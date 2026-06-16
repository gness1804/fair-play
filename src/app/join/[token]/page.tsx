import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { acceptInvite } from "@/app/actions/couple";
import { evaluateInviteAcceptance, inviteRejectionMessage } from "@/lib/invitations";
import { Button, Card, CardBody } from "@/components/ui";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "var(--space-12) var(--space-6)",
      }}
    >
      {children}
    </div>
  );
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const session = await auth();
  const sessionEmail = session?.user?.email;
  // Middleware gates /join, but guard defensively.
  if (!sessionEmail) redirect("/");

  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { couple: { include: { members: true } }, sender: true },
  });

  const user = await db.user.findUnique({ where: { email: sessionEmail } });

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
    userCoupleId: user?.coupleId ?? null,
    now: new Date(),
  });

  // The server-side evaluation is authoritative: on reload after a lost race
  // the DB already reflects the post-race state, so this renders the accurate
  // reason without trusting any client-supplied query param.
  if (!evaluation.ok) {
    const reason = evaluation.reason;
    return (
      <Shell>
        <Card>
          <CardBody>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--fs-h2)",
                color: "var(--fg)",
                margin: "0 0 var(--space-3)",
              }}
            >
              Can&rsquo;t join
            </h1>
            <p style={{ color: "var(--fg-muted)", margin: 0, lineHeight: "var(--lh-body)" }}>
              {inviteRejectionMessage(reason)}
            </p>
          </CardBody>
        </Card>
      </Shell>
    );
  }

  const senderName = invitation?.sender.name ?? invitation?.sender.email ?? "Your partner";

  return (
    <Shell>
      <Card>
        <CardBody>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--fs-h2)",
              color: "var(--fg)",
              margin: "0 0 var(--space-3)",
            }}
          >
            Join Fair Play
          </h1>
          <p
            style={{
              color: "var(--fg-muted)",
              margin: "0 0 var(--space-6)",
              lineHeight: "var(--lh-body)",
            }}
          >
            <strong style={{ color: "var(--fg)" }}>{senderName}</strong> invited you
            to set up Fair Play together.
          </p>
          <form action={acceptInvite}>
            <input type="hidden" name="token" value={token} />
            <Button type="submit" size="lg" fullWidth>
              Accept invitation
            </Button>
          </form>
        </CardBody>
      </Card>
    </Shell>
  );
}
