export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/",
    "/commands/:path*",
    "/groups/:path*",
    "/system-stats/:path*",
    "/users/:path*",
    "/login",
    "/register",
  ],
};
