import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [Google],
  pages: {
    signIn: "/",
  },
  callbacks: {
    signIn({ account, profile }) {
      // The invitation email-match control downstream trusts the session
      // email, so only accept a Google email the provider asserts is verified.
      // For Workspace / custom-domain tenants an admin controls this claim, so
      // it must be checked here rather than taken on faith.
      if (account?.provider === "google") {
        const verified = (
          profile as { email_verified?: boolean | string } | undefined
        )?.email_verified;
        return (
          (verified === true || verified === "true") &&
          typeof profile?.email === "string"
        );
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = [
        "/dashboard",
        "/cards",
        "/onboarding",
        "/join",
        "/equity",
        "/redeal",
        "/settings",
      ];
      const isProtected = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        return false; // redirect to signIn page
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
