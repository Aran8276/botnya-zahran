import { Role } from "@prisma/client";
import { type DefaultSession, User as DefaultUser } from "next-auth";
import { AdapterUser as DefaultAdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      serializedId: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    serializedId: string;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultAdapterUser {
    role: Role;
    serializedId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    serializedId?: string;
  }
}
