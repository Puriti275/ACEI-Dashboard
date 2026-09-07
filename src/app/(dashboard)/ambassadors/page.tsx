import type { Metadata } from "next";
import { requireSession, canSeePII } from "@/lib/dal";
import { getAmbassadorMetrics } from "@/lib/metrics/ambassadors";
import { toTable } from "@/lib/metrics/shared";
import { parseRangeKey } from "@/lib/metrics/window";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { RangeBoundary } from "@/components/range-boundary";
import { ChartCard, ChartEmpty } from "@/components/charts/chart-card";
import { ChartGrid, GridSpan, StatRow } from "@/components/charts/chart-grid";
import { CategoryBar, TrendChart } from "@/components/charts/primitives";

export const metadata: Metadata = { title: "Ambassadors" };

export default async function AmbassadorsPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const [{ window }, { role }] = await Promise.all([searchParams, requireSession()]);
  const m = await getAmbassadorMetrics(parseRangeKey(window), canSeePII(role));

  return (
    <div>
      <PageHeader
        title="Ambassadors"
        description="From Ambassador Tracking — outreach activity and the students it reaches."
        actions={<RefreshButton />}
      />

      <RangeBoundary>
      <StatRow tiles={m.tiles} />

      <ChartGrid>
        <ChartCard
          title="Activities over time"
          subtitle={`${m.perPeriodLabel} · ${m.rangeLabel}`}
          table={toTable(m.activitiesPerPeriod, "Activities")}
        >
          {m.activitiesPerPeriod.some((d) => d.value > 0) ? (
            <CategoryBar data={m.activitiesPerPeriod} orientation="vertical" />
          ) : (
            <ChartEmpty message="No activities dated in this window." />
          )}
        </ChartCard>

        <ChartCard
          title="Students reached over time"
          subtitle={`${m.perPeriodLabel} · ${m.rangeLabel}`}
          table={toTable(m.studentsReachedPerPeriod, "Students")}
        >
          {m.studentsReachedPerPeriod.some((d) => d.value > 0) ? (
            <TrendChart data={m.studentsReachedPerPeriod} type="area" />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="By activity type" subtitle={m.rangeLabel} table={toTable(m.byActivity, "Activities")}>
          {m.byActivity.length ? <CategoryBar data={m.byActivity} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard title="By location" subtitle={m.rangeLabel} table={toTable(m.byLocation, "Activities")}>
          {m.byLocation.length ? <CategoryBar data={m.byLocation} /> : <ChartEmpty />}
        </ChartCard>

        <GridSpan full>
          <ChartCard
            title="Leaderboard"
            subtitle={`Activities logged · ${m.rangeLabel}`}
            table={toTable(m.leaderboard, "Activities")}
          >
            {m.leaderboard.length ? <CategoryBar data={m.leaderboard} /> : <ChartEmpty />}
          </ChartCard>
        </GridSpan>
      </ChartGrid>
      </RangeBoundary>
    </div>
  );
}
