import { auth } from "@/lib/auth";

export default auth;

export const config = {
  matcher: [
    "/((?!api/auth/register|api/auth/signin|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};
