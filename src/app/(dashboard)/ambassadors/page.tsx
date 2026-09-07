import type { Metadata } from "next";
import { requireSession, canSeePII } from "@/lib/dal";
import { getAmbassadorMetrics } from "@/lib/metrics/ambassadors";
import { toTable } from "@/lib/metrics/shared";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { ChartCard, ChartEmpty } from "@/components/charts/chart-card";
import { ChartGrid, GridSpan, StatRow } from "@/components/charts/chart-grid";
import { CategoryBar, TrendChart } from "@/components/charts/primitives";

export const metadata: Metadata = { title: "Ambassadors" };

export default async function AmbassadorsPage() {
  const { role } = await requireSession();
  const m = await getAmbassadorMetrics(canSeePII(role));

  return (
    <div>
      <PageHeader
        title="Ambassadors"
        description="From Ambassador Tracking — outreach activity and the students it reaches."
        actions={<RefreshButton />}
      />

      <StatRow tiles={m.tiles} />

      <ChartGrid>
        <ChartCard
          title="Activities per month"
          subtitle="Last 12 months"
          table={toTable(m.activitiesPerMonth, "Activities")}
        >
          {m.activitiesPerMonth.some((d) => d.value > 0) ? (
            <CategoryBar data={m.activitiesPerMonth} orientation="vertical" />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="Students reached per month"
          subtitle="Last 12 months"
          table={toTable(m.studentsReachedPerMonth, "Students")}
        >
          {m.studentsReachedPerMonth.some((d) => d.value > 0) ? (
            <TrendChart data={m.studentsReachedPerMonth} type="area" />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="By activity type" table={toTable(m.byActivity, "Activities")}>
          {m.byActivity.length ? <CategoryBar data={m.byActivity} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard title="By location" table={toTable(m.byLocation, "Activities")}>
          {m.byLocation.length ? <CategoryBar data={m.byLocation} /> : <ChartEmpty />}
        </ChartCard>

        <GridSpan full>
          <ChartCard
            title="Leaderboard"
            subtitle="Activities logged this term"
            table={toTable(m.leaderboard, "Activities")}
          >
            {m.leaderboard.length ? <CategoryBar data={m.leaderboard} /> : <ChartEmpty />}
          </ChartCard>
        </GridSpan>
      </ChartGrid>
    </div>
  );
}
