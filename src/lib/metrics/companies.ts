import "server-only";
import { cache } from "react";
import { getCompanies } from "@/lib/airtable/companies";
import { type Datum, mapToData, orderedTally, sortDesc, tally, topN } from "./shared";

const ENTITY_ORDER = [
  "Not Yet Formed",
  "Sole Proprietorship",
  "General Partnership",
  "Limited Partnership",
  "LLC",
  "S-Corp",
  "C-Corp",
  "Non-Profit",
];

const RECENCY_ORDER = ["0–30 days", "31–90 days", "91–180 days", "180+ days", "No contact logged"];

function recencyBucket(days: number | undefined): string {
  if (days == null || Number.isNaN(days)) return "No contact logged";
  if (days <= 30) return "0–30 days";
  if (days <= 90) return "31–90 days";
  if (days <= 180) return "91–180 days";
  return "180+ days";
}

export type CompanyMetrics = {
  tiles: { label: string; value: string; hint?: string }[];
  formation: Datum[];
  byIndustry: Datum[];
  scalableLifestyle: Datum[];
  aceiStatus: Datum[];
  bySemester: Datum[];
  engagementRecency: Datum[];
  topFunded: Datum[];
};

function compactUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export const getCompanyMetrics = cache(async (): Promise<CompanyMetrics> => {
  const companies = await getCompanies();

  const active = companies.filter((r) => (r.fields["ACEI Status"] ?? []).includes("Active")).length;
  const operating = companies.filter(
    (r) => r.fields["Operating/Out of Business"] === "Operating",
  ).length;
  const totalRaised = companies.reduce((sum, r) => sum + (r.fields["Total Funding Raised"] ?? 0), 0);
  const raisedCount = companies.filter((r) => r.fields["Raised Capital?"] === "Yes").length;
  const stale = companies.filter(
    (r) => (r.fields["Days Since Last Interaction"] ?? 0) > 90,
  ).length;

  const topFunded = companies
    .map((r) => ({
      label: r.fields["Company Name"] ?? "Unnamed venture",
      value: r.fields["Total Funding Raised"] ?? 0,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return {
    tiles: [
      { label: "Ventures", value: companies.length.toLocaleString() },
      {
        label: "Active with ACEI",
        value: active.toLocaleString(),
        hint: `${operating.toLocaleString()} still operating`,
      },
      { label: "Capital raised", value: compactUsd(totalRaised), hint: `${raisedCount} raised any` },
      {
        label: "Stale (90+ days)",
        value: stale.toLocaleString(),
        hint: "no recent ACEI contact",
      },
    ],
    formation: orderedTally(companies, ENTITY_ORDER, (r) => r.fields["Business Entity"]).filter(
      (d) => d.value > 0,
    ),
    byIndustry: topN(mapToData(tally(companies, (r) => r.fields.Industry)), 12),
    scalableLifestyle: sortDesc(mapToData(tally(companies, (r) => r.fields["Scalable/Lifestyle"]))),
    aceiStatus: sortDesc(mapToData(tally(companies, (r) => r.fields["ACEI Status"]))),
    bySemester: sortDesc(
      mapToData(tally(companies, (r) => r.fields["Semester Entered"])),
    ).sort((a, b) => a.label.localeCompare(b.label)),
    engagementRecency: orderedTally(companies, RECENCY_ORDER, (r) =>
      recencyBucket(r.fields["Days Since Last Interaction"]),
    ).filter((d) => d.value > 0),
    topFunded,
  };
});
