import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  delta?: { text: string; direction: "up" | "down" | "flat" | "none" };
  tone?: "default" | "warning" | "critical";
};

export function KpiCard({ label, value, hint, delta, tone = "default" }: KpiCardProps) {
  const DeltaIcon =
    delta?.direction === "up"
      ? ArrowUpRight
      : delta?.direction === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
          tone === "warning" && "text-warning",
          tone === "critical" && "text-destructive",
        )}
      >
        {value}
      </p>
      <div className="mt-1.5 flex min-h-5 items-center gap-1.5 text-xs text-muted-foreground">
        {delta && delta.direction !== "none" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              delta.direction === "up" && "text-success",
              delta.direction === "down" && "text-destructive",
            )}
          >
            <DeltaIcon className="size-3.5" aria-hidden />
            {delta.text}
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </Card>
  );
}
