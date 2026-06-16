import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Couple, User } from "@prisma/client";

// Couple-scoped authorization. Every server action / loader that touches
// couple data must resolve the current user from the session (never from a
// client-supplied id) and check membership before reading or writing.

/** The DB User for the current session, or null if unauthenticated/unknown. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  // The PrismaAdapter stores the Google email verbatim; look it up exactly.
  return db.user.findUnique({ where: { email } });
}

export interface UserWithCouple {
  user: User | null;
  couple: (Couple & { members: User[] }) | null;
}

/** Current user plus their couple (with members), resolved from the session. */
export async function getCurrentUserWithCouple(): Promise<UserWithCouple> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { user: null, couple: null };

  const user = await db.user.findUnique({
    where: { email },
    include: { couple: { include: { members: true } } },
  });

  return { user, couple: user?.couple ?? null };
}

/**
 * Assert the current user is a member of `coupleId`. Throws on failure.
 * Returns the authenticated user on success.
 */
export async function assertCoupleMember(coupleId: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user || user.coupleId !== coupleId) {
    throw new Error("Not authorized for this couple.");
  }
  return user;
}
