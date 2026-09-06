import type { Metadata } from "next";
import { CalendarClock, TriangleAlert } from "lucide-react";
import { getBriefing } from "@/lib/metrics/briefing";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import {
  fmtCompactCurrency,
  fmtDelta,
  fmtInt,
  fmtHours,
  fmtShortDate,
  fmtWeekday,
  pctDelta,
} from "@/lib/format";

export const metadata: Metadata = { title: "Briefing" };

export default async function BriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const [{ denied }, briefing] = await Promise.all([searchParams, getBriefing()]);

  const { kpis } = briefing;
  const delta = pctDelta(kpis.coachingInteractions30, kpis.coachingInteractionsPrev30);
  const generated = new Date(briefing.generatedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
      <PageHeader
        title="Morning Briefing"
        description={`${briefing.termLabel} · data as of ${generated}`}
        actions={<RefreshButton />}
      />

      {denied === "profiles" && (
        <Card className="mb-6 border-warning/40 bg-warning/10 p-4 text-sm">
          That section shows person-level student data and is limited to super admins. You are seeing
          aggregates only.
        </Card>
      )}

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Students engaged · 30d"
          value={fmtInt(kpis.studentsEngaged30)}
          hint="distinct students in a coaching session"
        />
        <KpiCard
          label="Coaching interactions · 30d"
          value={fmtInt(kpis.coachingInteractions30)}
          delta={{
            text: fmtDelta(delta),
            direction:
              delta === null
                ? "none"
                : delta > 0
                  ? "up"
                  : delta < 0
                    ? "down"
                    : "flat",
          }}
          hint="vs. prior 30 days"
        />
        <KpiCard
          label={`Mentoring hours · ${briefing.termLabel}`}
          value={fmtHours(kpis.mentoringHoursTerm)}
          hint="sum of session durations"
        />
        <KpiCard
          label="Upcoming events · 14d"
          value={fmtInt(kpis.upcomingEvents14)}
          hint="on the ACEI calendar"
        />
        <KpiCard
          label="Ambassador reach · 30d"
          value={fmtInt(kpis.ambassadorReach30)}
          hint="students interacted with"
        />
        <KpiCard
          label="Capital raised · all ventures"
          value={fmtCompactCurrency(kpis.capitalRaised)}
          hint="total funding across Company Profiles"
        />
        <KpiCard
          label="Open deliverables"
          value={fmtInt(kpis.deliverablesOpen)}
          tone={kpis.deliverablesOverdue > 0 ? "warning" : "default"}
          hint={
            kpis.deliverablesOverdue > 0
              ? `${kpis.deliverablesOverdue} past due`
              : "from coaching sessions"
          }
        />
        <KpiCard
          label="Students / ventures tracked"
          value={`${fmtInt(briefing.totals.students)} / ${fmtInt(briefing.totals.companies)}`}
          hint="records in the base"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-semibold">Next 14 days</h2>
          </div>
          {briefing.upcoming.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nothing scheduled in the next two weeks.</p>
          ) : (
            <ul className="divide-y divide-border">
              {briefing.upcoming.map((event) => (
                <li key={event.id} className="flex items-baseline justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.location ?? "Location TBD"}
                      {event.internalExternal ? ` · ${event.internalExternal}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs">
                    {event.needsSpeakers && (
                      <span className="rounded bg-warning/15 px-1.5 py-0.5 font-medium text-warning">
                        needs judges
                      </span>
                    )}
                    <span className="tabular-nums text-muted-foreground">
                      {fmtWeekday(event.date)} {fmtShortDate(event.date)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <TriangleAlert className="size-4 text-muted-foreground" aria-hidden />
              <h2 className="text-sm font-semibold">Needs attention</h2>
            </div>
            {briefing.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All clear this morning.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {briefing.alerts.map((alert) => (
                  <li key={alert} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
                    {alert}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Last 7 days of activity</h2>
            {briefing.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No coaching or ambassador activity logged.</p>
            ) : (
              <ul className="divide-y divide-border">
                {briefing.recent.map((item) => (
                  <li key={`${item.kind}-${item.id}`} className="flex items-baseline justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="capitalize">{item.kind}</span> · {item.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {fmtShortDate(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
