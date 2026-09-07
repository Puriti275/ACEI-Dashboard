import "server-only";
import { cache } from "react";
import { getInteractions } from "@/lib/airtable/interactions";
import { getNonStudentNameMap } from "@/lib/airtable/non-students";
import { currentTermLabel, currentTermStart, toTime } from "@/lib/dates";
import { type Datum, mapToData, sortDesc, tally, timeBuckets, topN } from "./shared";

export type CoachingMetrics = {
  termLabel: string;
  tiles: { label: string; value: string; hint?: string }[];
  perWeek: Datum[];
  byType: Datum[];
  byTopic: Datum[];
  mentorLoad: Datum[];
  sessionsPerStudent: Datum[];
  byCollege: Datum[];
};

export const getCoachingMetrics = cache(async (): Promise<CoachingMetrics> => {
  const [interactions, mentorNames] = await Promise.all([
    getInteractions(),
    getNonStudentNameMap(),
  ]);

  const termStart = currentTermStart();
  const withTime = interactions.map((r) => ({ r, t: toTime(r.fields["Date and Time"]) }));
  const termRecords = withTime.filter((e) => e.t !== null && e.t >= termStart);

  const totalSeconds = termRecords.reduce((sum, e) => sum + (e.r.fields.Duration ?? 0), 0);
  const distinctStudents = new Set<string>();
  for (const e of termRecords) {
    for (const id of e.r.fields.Entrepreneur ?? []) distinctStudents.add(id);
  }
  const openDeliverables = interactions.filter(
    (r) => r.fields["Deliverable?"] === true && !!r.fields["Deliverable Due Date"],
  ).length;

  // sessions per student, all-time
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

  const mentorLoad = topN(
    mapToData(
      tally(termRecords, (e) =>
        (e.r.fields["ACEI Member"] ?? []).map((id) => mentorNames.get(id) ?? "Unknown"),
      ),
    ),
    12,
  );

  return {
    termLabel: currentTermLabel(),
    tiles: [
      { label: `Interactions · ${currentTermLabel()}`, value: termRecords.length.toLocaleString() },
      { label: "Distinct students", value: distinctStudents.size.toLocaleString() },
      {
        label: "Mentoring hours",
        value: Math.round(totalSeconds / 3600).toLocaleString(),
        hint: "term to date",
      },
      {
        label: "Avg session",
        value: termRecords.length
          ? `${Math.round(totalSeconds / termRecords.length / 60)} min`
          : "—",
      },
      { label: "Open deliverables", value: openDeliverables.toLocaleString() },
    ],
    perWeek: timeBuckets(
      withTime.map((e) => e.t).filter((t): t is number => t !== null),
      "week",
      16,
    ),
    byType: sortDesc(mapToData(tally(termRecords, (e) => e.r.fields["Type of Interaction"]))),
    byTopic: sortDesc(mapToData(tally(termRecords, (e) => e.r.fields.Topic))),
    mentorLoad,
    sessionsPerStudent: Object.entries(buckets).map(([label, value]) => ({ label, value })),
    byCollege: topN(
      mapToData(tally(termRecords, (e) => e.r.fields["Entrepreneur College"])),
      10,
    ),
  };
});
