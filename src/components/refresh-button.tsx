"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function refresh() {
    await fetch("/api/revalidate", { method: "POST" }).catch(() => undefined);
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={pending}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium",
        "hover:bg-muted disabled:opacity-60",
      )}
    >
      <RefreshCw className={cn("size-3.5", pending && "animate-spin")} aria-hidden />
      {pending ? "Refreshing" : "Refresh"}
    </button>
  );
}
