import type { Metadata } from "next";
import { getEventMetrics } from "@/lib/metrics/events";
import { toTable } from "@/lib/metrics/shared";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { ChartCard, ChartEmpty } from "@/components/charts/chart-card";
import { ChartGrid, GridSpan, StatRow } from "@/components/charts/chart-grid";
import { CategoryBar, DonutChart, StackedBar } from "@/components/charts/primitives";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const m = await getEventMetrics();

  return (
    <div>
      <PageHeader
        title="Events & Competitions"
        description="Outcomes from Event Participation; attendance and attendee mix from Event Registrations."
        actions={<RefreshButton />}
      />

      <StatRow tiles={m.tiles} />

      <ChartGrid>
        <GridSpan full>
          <ChartCard
            title="Participation levels"
            subtitle="Across all recorded event participation"
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
          subtitle="Derived from the event name"
          table={toTable(m.byCategory, "Events")}
        >
          {m.byCategory.length ? <CategoryBar data={m.byCategory} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard title="Registration status" table={toTable(m.registrationStatus, "Registrations")}>
          {m.registrationStatus.length ? (
            <DonutChart data={m.registrationStatus} />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <GridSpan full>
          <ChartCard
            title="Registrations per month"
            subtitle="Last 12 months"
            table={toTable(m.registrationsPerMonth, "Registrations")}
          >
            {m.registrationsPerMonth.some((d) => d.value > 0) ? (
              <CategoryBar data={m.registrationsPerMonth} orientation="vertical" />
            ) : (
              <ChartEmpty message="No registrations dated in this window." />
            )}
          </ChartCard>
        </GridSpan>

        <ChartCard
          title="Attendee affiliation"
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
    </div>
  );
}
