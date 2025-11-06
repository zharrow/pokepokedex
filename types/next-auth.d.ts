import NextAuth, { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      badges: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    badges: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    badges: number;
  }
}
