import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div
      style={{
        maxWidth: "768px",
        margin: "0 auto",
        padding: "var(--space-8) var(--space-6)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--fs-h1)",
          fontWeight: 700,
          color: "var(--fg)",
          margin: "0 0 var(--space-4)",
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: "var(--fg-muted)", marginBottom: "var(--space-6)" }}>
        Signed in as{" "}
        <strong style={{ color: "var(--fg)" }}>
          {session.user.name ?? session.user.email}
        </strong>{" "}
        ({session.user.email})
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
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
          }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
