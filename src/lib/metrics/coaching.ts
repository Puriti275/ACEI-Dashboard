import "server-only";
import { cache } from "react";
import { getInteractions } from "@/lib/airtable/interactions";
import { getNonStudentNameMap } from "@/lib/airtable/non-students";
import { toTime } from "@/lib/dates";
import { type Datum, mapToData, sortDesc, tally, timeBuckets, topN } from "./shared";
import { type RangeKey, inRange, resolveRange } from "./window";

export type CoachingMetrics = {
  rangeLabel: string;
  tiles: { label: string; value: string; hint?: string }[];
  perPeriod: Datum[];
  perPeriodLabel: string;
  byType: Datum[];
  byTopic: Datum[];
  mentorLoad: Datum[];
  sessionsPerStudent: Datum[];
  byCollege: Datum[];
};

export const getCoachingMetrics = cache(
  async (rangeKey: RangeKey): Promise<CoachingMetrics> => {
    const range = resolveRange(rangeKey);
    const [interactions, mentorNames] = await Promise.all([
      getInteractions(),
      getNonStudentNameMap(),
    ]);

    const withTime = interactions.map((r) => ({ r, t: toTime(r.fields["Date and Time"]) }));
    const scoped = withTime.filter((e) => inRange(e.t, range));

    const totalSeconds = scoped.reduce((sum, e) => sum + (e.r.fields.Duration ?? 0), 0);
    const distinctStudents = new Set<string>();
    for (const e of scoped) {
      for (const id of e.r.fields.Entrepreneur ?? []) distinctStudents.add(id);
    }
    const openDeliverables = interactions.filter(
      (r) => r.fields["Deliverable?"] === true && !!r.fields["Deliverable Due Date"],
    ).length;

    // sessions per student — all-time distribution
    const perStudent = new Map<string, number>();
    for (const r of interactions) {
      for (const id of r.fields.Entrepreneur ?? []) {
        perStudent.set(id, (perStudent.get(id) ?? 0) + 1);
      }
    }
    const buckets = { "1": 0, "2": 0, "3": 0, "4": 0, "5+": 0 };
    for (const count of perStudent.values()) {
      if (count >= 5) buckets["5+"] += 1;
      else buckets[String(count) as "1" | "2" | "3" | "4"] += 1;
    }

    return {
      rangeLabel: range.label,
      tiles: [
        { label: `Interactions · ${range.label}`, value: scoped.length.toLocaleString() },
        { label: "Distinct students", value: distinctStudents.size.toLocaleString() },
        {
          label: "Mentoring hours",
          value: Math.round(totalSeconds / 3600).toLocaleString(),
          hint: range.label,
        },
        {
          label: "Avg session",
          value: scoped.length ? `${Math.round(totalSeconds / scoped.length / 60)} min` : "—",
        },
        { label: "Open deliverables", value: openDeliverables.toLocaleString(), hint: "all time" },
      ],
      perPeriod: timeBuckets(
        withTime.map((e) => e.t).filter((t): t is number => t !== null),
        range.bucket,
        range.bucketCount,
      ),
      perPeriodLabel: range.bucket === "week" ? "Weekly" : "Monthly",
      byType: sortDesc(mapToData(tally(scoped, (e) => e.r.fields["Type of Interaction"]))),
      byTopic: sortDesc(mapToData(tally(scoped, (e) => e.r.fields.Topic))),
      mentorLoad: topN(
        mapToData(
          tally(scoped, (e) =>
            (e.r.fields["ACEI Member"] ?? []).map((id) => mentorNames.get(id) ?? "Unknown"),
          ),
        ),
        12,
      ),
      sessionsPerStudent: Object.entries(buckets).map(([label, value]) => ({ label, value })),
      byCollege: topN(mapToData(tally(scoped, (e) => e.r.fields["Entrepreneur College"])), 10),
    };
  },
);
