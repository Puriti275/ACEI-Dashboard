import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { AceiRole } from "@/types/next-auth";

export type SessionInfo = { email: string; role: AceiRole };

/**
 * The single source of truth for "who is asking". Memoized per request so it can
 * be called freely from layouts, pages, data modules, and server actions.
 */
export const getSession = cache(async (): Promise<SessionInfo | null> => {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return { email, role: session.user.role ?? "admin" };
});

export async function requireSession(): Promise<SessionInfo> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireSuperAdmin(): Promise<SessionInfo> {
  const session = await requireSession();
  if (session.role !== "super_admin") redirect("/briefing?denied=profiles");
  return session;
}

export function canSeePII(role: AceiRole): boolean {
  return role === "super_admin";
}
