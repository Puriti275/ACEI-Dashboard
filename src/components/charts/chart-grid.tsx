import { cn } from "@/lib/utils";

export function ChartGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

export function GridSpan({
  children,
  full,
}: {
  children: React.ReactNode;
  full?: boolean;
}) {
  return <div className={cn(full && "lg:col-span-2")}>{children}</div>;
}

export function StatRow({
  tiles,
}: {
  tiles: { label: string; value: string; hint?: string }[];
}) {
  return (
    <section
      aria-label="Summary"
      className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
    >
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {tile.label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight">{tile.value}</p>
          {tile.hint && <p className="mt-0.5 text-xs text-muted-foreground">{tile.hint}</p>}
        </div>
      ))}
    </section>
  );
}
