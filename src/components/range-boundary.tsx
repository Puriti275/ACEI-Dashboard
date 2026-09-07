"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { DEFAULT_RANGE, RANGE_OPTIONS } from "@/lib/metrics/window";
import { cn } from "@/lib/utils";

/**
 * Wraps the range-filtered content of a page. Owns the time-window control and,
 * while the new range is loading, dims the content, runs a top progress bar, and
 * shows an "Updating…" status so the change is unmistakable.
 */
export function RangeBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = params.get("window") ?? DEFAULT_RANGE;

  function select(key: string) {
    if (key === current) return;
    const next = new URLSearchParams(params);
    if (key === DEFAULT_RANGE) next.delete("window");
    else next.set("window", key);
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Time window"
          className="inline-flex rounded-lg border border-border bg-background p-0.5 text-sm"
        >
          {RANGE_OPTIONS.map((option) => {
            const active = option.key === current;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                disabled={isPending}
                onClick={() => select(option.key)}
                className={cn(
                  "rounded-md px-2.5 py-1 font-medium transition-colors disabled:cursor-progress",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <span
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-opacity",
            isPending ? "opacity-100" : "opacity-0",
          )}
        >
          <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
          Updating…
        </span>
      </div>

      <div className="relative" aria-busy={isPending}>
        {isPending && (
          <div
            className="pointer-events-none absolute inset-x-0 -top-1 z-10 h-0.5 overflow-hidden rounded-full bg-primary/15"
            aria-hidden
          >
            <div className="h-full w-1/4 rounded-full bg-primary [animation:loading-bar_1.1s_ease-in-out_infinite] motion-reduce:animate-none" />
          </div>
        )}
        <div
          className={cn(
            "transition-[opacity,filter] duration-200",
            isPending && "pointer-events-none select-none opacity-40 blur-[1px]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
