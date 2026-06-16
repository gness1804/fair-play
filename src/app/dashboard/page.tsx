import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { getCurrentUserWithCouple } from "@/lib/couple";
import { MAX_COUPLE_MEMBERS } from "@/lib/invitations";
import { isPhase } from "@/lib/phase";
import { Badge, Button, Card, CardBody } from "@/components/ui";

export default async function DashboardPage() {
  const { user, couple } = await getCurrentUserWithCouple();
  if (!user) redirect("/");

  // No couple yet, or partner hasn't joined — go run the invite flow.
  if (!couple || couple.members.length < MAX_COUPLE_MEMBERS) {
    redirect("/onboarding/invite");
  }

  const partner = couple.members.find((m) => m.id !== user.id);
  const phaseLabel = isPhase(couple.phase) ? couple.phase : "INVITE";

  return (
    <div
      style={{
        maxWidth: "768px",
        margin: "0 auto",
        padding: "var(--space-10) var(--space-6)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--fs-h1)",
            color: "var(--fg)",
            margin: 0,
          }}
        >
          Dashboard
        </h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      <Card>
        <CardBody>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              marginBottom: "var(--space-3)",
            }}
          >
            <Badge tone="success">Paired</Badge>
            <span style={{ color: "var(--fg-muted)", fontSize: "var(--fs-small)" }}>
              Current step: {phaseLabel}
            </span>
          </div>
          <p style={{ color: "var(--fg)", margin: 0, lineHeight: "var(--lh-body)" }}>
            You&rsquo;re set up with{" "}
            <strong>{partner?.name ?? partner?.email ?? "your partner"}</strong>.
            The next onboarding step will appear here as we build it out.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
