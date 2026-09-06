import type { DefaultSession } from "next-auth";

export type AceiRole = "admin" | "super_admin";

declare module "next-auth" {
  interface Session {
    user: {
      role: AceiRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AceiRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AceiRole;
  }
}
