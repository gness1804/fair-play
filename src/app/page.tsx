import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

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
          await signIn("google");
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
