import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cards/:path*",
    "/onboarding/:path*",
    "/join/:path*",
    "/equity/:path*",
    "/redeal/:path*",
    "/settings/:path*",
  ],
};
