import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/briefing");

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            A
          </span>
          <div>
            <h1 className="text-lg font-semibold leading-tight">ACEI Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Anderson Center · UT Knoxville</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Access is limited to Anderson Center administrators.
        </p>
      </div>
    </main>
  );
}
