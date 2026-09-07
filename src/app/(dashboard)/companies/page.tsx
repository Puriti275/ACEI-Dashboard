import type { Metadata } from "next";
import { getCompanyMetrics } from "@/lib/metrics/companies";
import { toTable } from "@/lib/metrics/shared";
import { fmtCompactCurrency } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { RefreshButton } from "@/components/refresh-button";
import { ChartCard, ChartEmpty } from "@/components/charts/chart-card";
import { ChartGrid, GridSpan, StatRow } from "@/components/charts/chart-grid";
import { CategoryBar, DonutChart } from "@/components/charts/primitives";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const m = await getCompanyMetrics();

  return (
    <div>
      <PageHeader
        title="Company Profiles"
        description="The venture registry — formation stage, funding, industry, and ACEI engagement."
        actions={<RefreshButton />}
      />

      <StatRow tiles={m.tiles} />

      <ChartGrid>
        <GridSpan full>
          <ChartCard
            title="Formation stage"
            subtitle="Business Entity — the idea-to-LLC progression"
            table={toTable(m.formation, "Ventures")}
          >
            {m.formation.length ? <CategoryBar data={m.formation} /> : <ChartEmpty />}
          </ChartCard>
        </GridSpan>

        <GridSpan full>
          <ChartCard title="By industry" table={toTable(m.byIndustry, "Ventures")}>
            {m.byIndustry.length ? <CategoryBar data={m.byIndustry} /> : <ChartEmpty />}
          </ChartCard>
        </GridSpan>

        <ChartCard title="Scalable vs. lifestyle" table={toTable(m.scalableLifestyle, "Ventures")}>
          {m.scalableLifestyle.length ? (
            <DonutChart data={m.scalableLifestyle} />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="ACEI status" table={toTable(m.aceiStatus, "Ventures")}>
          {m.aceiStatus.length ? <DonutChart data={m.aceiStatus} /> : <ChartEmpty />}
        </ChartCard>

        <ChartCard
          title="Days since last ACEI contact"
          table={toTable(m.engagementRecency, "Ventures")}
        >
          {m.engagementRecency.length ? (
            <CategoryBar data={m.engagementRecency} orientation="vertical" />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="Entered by semester" table={toTable(m.bySemester, "Ventures")}>
          {m.bySemester.length ? (
            <CategoryBar data={m.bySemester} orientation="vertical" />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <GridSpan full>
          <ChartCard
            title="Top ventures by capital raised"
            table={{
              columns: ["Venture", "Total raised"],
              rows: m.topFunded.map((d) => [d.label, fmtCompactCurrency(d.value)]),
            }}
          >
            {m.topFunded.length ? (
              <CategoryBar data={m.topFunded} valueFormat="currencyCompact" />
            ) : (
              <ChartEmpty message="No funding amounts recorded yet." />
            )}
          </ChartCard>
        </GridSpan>
      </ChartGrid>
    </div>
  );
}
