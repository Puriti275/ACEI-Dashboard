import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export function ComingSoon({
  title,
  description,
  points,
}: {
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card className="p-6">
        <p className="text-sm font-medium">Planned for this screen</p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {points.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          The data layer for this table is wired up; the visualizations land next.
        </p>
      </Card>
    </div>
  );
}
