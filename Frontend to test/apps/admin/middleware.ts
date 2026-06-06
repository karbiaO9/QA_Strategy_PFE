import { withAuth } from "next-auth/middleware";
import { ROUTES } from "./config/routes";

export default withAuth({
  pages: {
    signIn: ROUTES.LOGIN,
  },
  secret: process.env.NEXTAUTH_SECRET_ADMIN,
});

export const config = {
  // Protect all routes except auth-related ones
  matcher: [
    "/((?!login|forgot-password|reset-password|verify-otp|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
