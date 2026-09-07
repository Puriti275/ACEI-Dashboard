import type { Metadata } from "next";
import { getCoachingMetrics } from "@/lib/metrics/coaching";
import { toTable } from "@/lib/metrics/shared";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { ChartCard, ChartEmpty } from "@/components/charts/chart-card";
import { ChartGrid, GridSpan, StatRow } from "@/components/charts/chart-grid";
import { CategoryBar, TrendChart } from "@/components/charts/primitives";

export const metadata: Metadata = { title: "Coaching" };

export default async function CoachingPage() {
  const m = await getCoachingMetrics();

  return (
    <div>
      <PageHeader
        title="Coaching & Mentoring"
        description="From Interactions - Student & Mentors. Session counts, topics, mentor load, and follow-ups."
        actions={<RefreshButton />}
      />

      <StatRow tiles={m.tiles} />

      <ChartGrid>
        <GridSpan full>
          <ChartCard
            title="Interactions per week"
            subtitle="Last 16 weeks"
            table={toTable(m.perWeek, "Interactions")}
          >
            {m.perWeek.some((d) => d.value > 0) ? (
              <TrendChart data={m.perWeek} type="area" />
            ) : (
              <ChartEmpty message="No interactions dated in this window." />
            )}
          </ChartCard>
        </GridSpan>

        <ChartCard
          title="By type of interaction"
          subtitle={m.termLabel}
          table={toTable(m.byType, "Interactions")}
        >
          {m.byType.length ? <CategoryBar data={m.byType} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard title="By topic" subtitle={m.termLabel} table={toTable(m.byTopic, "Interactions")}>
          {m.byTopic.length ? <CategoryBar data={m.byTopic} /> : <ChartEmpty />}
        </ChartCard>

        <GridSpan full>
          <ChartCard
            title="Mentor load"
            subtitle={`Interactions per ACEI member · ${m.termLabel}`}
            table={toTable(m.mentorLoad, "Interactions")}
          >
            {m.mentorLoad.length ? <CategoryBar data={m.mentorLoad} /> : <ChartEmpty />}
          </ChartCard>
        </GridSpan>

        <ChartCard
          title="Sessions per student"
          subtitle="All-time distribution"
          table={toTable(m.sessionsPerStudent, "Students")}
        >
          {m.sessionsPerStudent.some((d) => d.value > 0) ? (
            <CategoryBar data={m.sessionsPerStudent} orientation="vertical" />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="By entrepreneur's college"
          subtitle={m.termLabel}
          table={toTable(m.byCollege, "Interactions")}
        >
          {m.byCollege.length ? <CategoryBar data={m.byCollege} /> : <ChartEmpty />}
        </ChartCard>
      </ChartGrid>
    </div>
  );
}
