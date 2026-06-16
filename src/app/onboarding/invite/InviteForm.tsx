"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createInvite, type InviteFormState } from "@/app/actions/couple";
import { Button, Card, CardBody, Input } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={pending}>
      Send invite
    </Button>
  );
}

export function InviteForm({
  initialToken,
  initialEmail,
  origin,
}: {
  initialToken: string | null;
  initialEmail: string | null;
  origin: string;
}) {
  const [state, formAction] = useActionState<InviteFormState, FormData>(
    createInvite,
    { status: "idle" }
  );

  const activeToken =
    state.status === "success" ? state.token : initialToken ?? null;
  const joinUrl = activeToken && origin ? `${origin}/join/${activeToken}` : null;

  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable; the link is still selectable on screen.
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <form action={formAction}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input
            name="email"
            type="email"
            label="Partner's email"
            placeholder="partner@example.com"
            required
            defaultValue={initialEmail ?? ""}
            error={state.status === "error" ? state.error : undefined}
            hint="They must sign in with the Google account for this email."
          />
          <SubmitButton />
        </div>
      </form>

      {joinUrl && (
        <Card>
          <CardBody>
            <p
              style={{
                fontSize: "var(--fs-small)",
                color: "var(--fg-muted)",
                margin: "0 0 var(--space-3)",
              }}
            >
              Invite sent. Share this link with your partner:
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <code
                style={{
                  flex: "1 1 240px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--fs-small)",
                  color: "var(--fg)",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "var(--space-2) var(--space-3)",
                  wordBreak: "break-all",
                }}
              >
                {joinUrl}
              </code>
              <Button variant="ghost" size="sm" onClick={copy} type="button">
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p
              style={{
                fontSize: "var(--fs-small)",
                color: "var(--fg-dim)",
                margin: "var(--space-4) 0 0",
              }}
            >
              Waiting for your partner to join. This page will move forward once
              they accept.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
