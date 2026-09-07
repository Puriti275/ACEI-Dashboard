import type { Metadata } from "next";
import { getEventMetrics } from "@/lib/metrics/events";
import { toTable } from "@/lib/metrics/shared";
import { parseRangeKey } from "@/lib/metrics/window";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { RangeBoundary } from "@/components/range-boundary";
import { ChartCard, ChartEmpty } from "@/components/charts/chart-card";
import { ChartGrid, GridSpan, StatRow } from "@/components/charts/chart-grid";
import { CategoryBar, DonutChart, StackedBar } from "@/components/charts/primitives";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const rangeKey = parseRangeKey((await searchParams).window);
  const m = await getEventMetrics(rangeKey);

  return (
    <div>
      <PageHeader
        title="Events & Competitions"
        description="Outcomes from Event Participation; attendance and attendee mix from Event Registrations."
        actions={<RefreshButton />}
      />

      <RangeBoundary>
      <StatRow tiles={m.tiles} />

      <ChartGrid>
        <GridSpan full>
          <ChartCard
            title="Participation levels"
            subtitle="All recorded event participation (all time)"
            table={toTable(m.participationLevels, "People")}
          >
            {m.participationLevels.length ? (
              <CategoryBar data={m.participationLevels} />
            ) : (
              <ChartEmpty />
            )}
          </ChartCard>
        </GridSpan>

        <ChartCard
          title="Events by category"
          subtitle={m.rangeLabel}
          table={toTable(m.byCategory, "Events")}
        >
          {m.byCategory.length ? <CategoryBar data={m.byCategory} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard
          title="Registration status"
          subtitle={m.rangeLabel}
          table={toTable(m.registrationStatus, "Registrations")}
        >
          {m.registrationStatus.length ? (
            <DonutChart data={m.registrationStatus} />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <GridSpan full>
          <ChartCard
            title="Registrations over time"
            subtitle={`${m.perPeriodLabel} · ${m.rangeLabel}`}
            table={toTable(m.registrationsPerPeriod, "Registrations")}
          >
            {m.registrationsPerPeriod.some((d) => d.value > 0) ? (
              <CategoryBar data={m.registrationsPerPeriod} orientation="vertical" />
            ) : (
              <ChartEmpty message="No registrations dated in this window." />
            )}
          </ChartCard>
        </GridSpan>

        <ChartCard
          title="Attendee affiliation"
          subtitle={m.rangeLabel}
          table={toTable(m.attendeeAffiliation, "Registrations")}
        >
          {m.attendeeAffiliation.length ? (
            <CategoryBar data={m.attendeeAffiliation} />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="Internal vs. external by semester"
          subtitle="All time"
          table={{
            columns: ["Semester", "Internal", "External"],
            rows: m.internalExternalBySemester.map((row) => [
              String(row.label),
              Number(row.Internal),
              Number(row.External),
            ]),
          }}
        >
          {m.internalExternalBySemester.length ? (
            <StackedBar
              data={m.internalExternalBySemester}
              keys={[
                { key: "Internal", name: "Internal" },
                { key: "External", name: "External" },
              ]}
            />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </ChartGrid>
      </RangeBoundary>
    </div>
  );
}
