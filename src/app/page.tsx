import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  // After Google sign-in, return to the page the visitor was gated from
  // (e.g. a /join/[token] link). Only allow same-origin relative paths to
  // avoid an open-redirect; reject protocol-relative ("//host") values.
  const { callbackUrl } = await searchParams;
  const redirectTo =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 65px)",
        padding: "var(--space-8) var(--space-6)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--fs-display)",
          lineHeight: "var(--lh-tight)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--fg)",
          margin: "0 0 var(--space-4)",
        }}
      >
        Fair Play
      </h1>
      <p
        style={{
          fontSize: "var(--fs-h4)",
          color: "var(--fg-muted)",
          maxWidth: "480px",
          margin: "0 0 var(--space-8)",
          lineHeight: "var(--lh-body)",
        }}
      >
        A shared system for dividing domestic labor fairly.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo });
        }}
      >
        <button
          type="submit"
          style={{
            background: "var(--action-primary-bg)",
            color: "var(--action-primary-fg)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-6)",
            fontSize: "var(--fs-body)",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background var(--dur-base) var(--ease-standard)",
          }}
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
