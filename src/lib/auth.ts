import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import { UserLoginSchema, GuestLoginSchema } from "./schemas";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const guestLogin = GuestLoginSchema.safeParse(credentials);
        if (guestLogin.success) {
          const user = await prisma.user.findUnique({
            where: { serializedId: guestLogin.data.serializedId },
          });
          if (user && user.role === Role.AWAIT_REGISTER) return user;
        }

        const validatedFields = UserLoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { username, password } = validatedFields.data;
          const user = await prisma.user.findUnique({
            where: { username },
          });
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;
      const isPublicRoute = pathname === "/login" || pathname === "/register";

      if (isPublicRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (role === Role.ADMIN) {
        return true;
      }

      if (role === Role.USER || role === Role.AWAIT_REGISTER) {
        const allowedPaths = [
          "/",
          "/commands",
          "/commands/deleted",
          "/commands/new",
          "/system-stats",
        ];
        const allowedPatterns = [
          /^\/groups\/[^/]+$/,
          /^\/commands\/[^/]+\/edit$/,
        ];

        const isAllowed =
          allowedPaths.some((p) => pathname === p) ||
          allowedPatterns.some((pattern) => pattern.test(pathname));

        if (isAllowed) {
          return true;
        }
      }

      return Response.redirect(new URL("/", nextUrl));
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.serializedId = user.serializedId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.serializedId = token.serializedId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
