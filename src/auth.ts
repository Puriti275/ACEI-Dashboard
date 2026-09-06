import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyCredentials } from "@/lib/auth/allowlist";
import type { AceiRole } from "@/types/next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await verifyCredentials(email, password);
        if (!user) return null;

        return { id: user.email, email: user.email, name: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const role = (user as { role?: AceiRole } | undefined)?.role;
      if (role) token.role = role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token as { role?: AceiRole }).role ?? "admin";
      }
      return session;
    },
  },
});
