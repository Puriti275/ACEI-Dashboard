import type { Metadata } from "next";
import { requireSession, canSeePII } from "@/lib/dal";
import { getStudentMetrics } from "@/lib/metrics/students";
import { toTable } from "@/lib/metrics/shared";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { ChartCard, ChartEmpty } from "@/components/charts/chart-card";
import { ChartGrid, GridSpan, StatRow } from "@/components/charts/chart-grid";
import { CategoryBar, DonutChart } from "@/components/charts/primitives";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage() {
  const { role } = await requireSession();
  const pii = canSeePII(role);
  const m = await getStudentMetrics(pii);

  return (
    <div>
      <PageHeader
        title="Students"
        description={
          pii
            ? "Who the Anderson Center serves — journey stage, demographics, and how students find ACEI."
            : "Aggregates only. Groups smaller than 5 are withheld at your access level."
        }
        actions={<RefreshButton />}
      />

      <StatRow tiles={m.tiles} />

      <ChartGrid>
        <GridSpan full>
          <ChartCard
            title="Stage of development"
            subtitle="Self-reported point on the entrepreneurial journey"
            table={toTable(m.stage, "Students")}
          >
            {m.stage.some((d) => d.value > 0) ? (
              <CategoryBar data={m.stage} />
            ) : (
              <ChartEmpty />
            )}
          </ChartCard>
        </GridSpan>

        <GridSpan full>
          <ChartCard title="By college" table={toTable(m.byCollege, "Students")}>
            {m.byCollege.length ? <CategoryBar data={m.byCollege} /> : <ChartEmpty />}
          </ChartCard>
        </GridSpan>

        <ChartCard title="Gender" table={toTable(m.gender, "Students")}>
          {m.gender.length ? <DonutChart data={m.gender} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard title="Race / ethnicity" table={toTable(m.race, "Students")}>
          {m.race.length ? <CategoryBar data={m.race} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard
          title="Other demographics"
          subtitle="Veteran · first-generation · rural"
          table={toTable(m.otherDemographics, "Students")}
        >
          {m.otherDemographics.length ? (
            <CategoryBar data={m.otherDemographics} />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard
          title="Referral source"
          subtitle="How did you hear about the Anderson Center?"
          table={toTable(m.referral, "Students")}
        >
          {m.referral.length ? <CategoryBar data={m.referral} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard title="Graduation year" table={toTable(m.graduationYear, "Students")}>
          {m.graduationYear.length ? (
            <CategoryBar data={m.graduationYear} orientation="vertical" />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="Credly badges earned" table={toTable(m.badges, "Students")}>
          {m.badges.length ? <CategoryBar data={m.badges} /> : <ChartEmpty />}
        </ChartCard>
      </ChartGrid>
    </div>
  );
}
