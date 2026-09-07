import "server-only";
import { cache } from "react";
import { getAmbassadorActivities } from "@/lib/airtable/ambassadors";
import { getStudentNameMap } from "@/lib/airtable/students";
import { currentTermLabel, currentTermStart, toTime } from "@/lib/dates";
import {
  type Datum,
  mapToData,
  sortDesc,
  tally,
  timeBuckets,
  timeSumBuckets,
  topN,
} from "./shared";

export type AmbassadorMetrics = {
  tiles: { label: string; value: string; hint?: string }[];
  activitiesPerMonth: Datum[];
  studentsReachedPerMonth: Datum[];
  byActivity: Datum[];
  byLocation: Datum[];
  leaderboard: Datum[];
};

export const getAmbassadorMetrics = cache(
  async (canSeePII: boolean): Promise<AmbassadorMetrics> => {
    const [activities, studentNames] = await Promise.all([
      getAmbassadorActivities(),
      getStudentNameMap(),
    ]);

    const termStart = currentTermStart();
    const withTime = activities.map((r) => ({ r, t: toTime(r.fields.Date) }));
    const termRecords = withTime.filter((e) => e.t !== null && e.t >= termStart);

    const reachedTerm = termRecords.reduce(
      (sum, e) => sum + (e.r.fields["# of Students Interacted With"] ?? 0),
      0,
    );
    const hoursTerm =
      termRecords.reduce((sum, e) => sum + (e.r.fields.Duration ?? 0), 0) / 3600;
    const activeAmbassadors = new Set<string>();
    for (const e of termRecords) {
      for (const id of e.r.fields["Ambassador Name"] ?? []) activeAmbassadors.add(id);
    }

    // leaderboard by activity count, all term
    const perAmbassador = new Map<string, number>();
    for (const e of termRecords) {
      for (const id of e.r.fields["Ambassador Name"] ?? []) {
        perAmbassador.set(id, (perAmbassador.get(id) ?? 0) + 1);
      }
    }
    const ranked = [...perAmbassador.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    const leaderboard: Datum[] = ranked.map(([id, value], index) => ({
      label: canSeePII ? (studentNames.get(id) ?? "Unknown") : `Ambassador ${index + 1}`,
      value,
    }));

    return {
      tiles: [
        { label: `Activities · ${currentTermLabel()}`, value: termRecords.length.toLocaleString() },
        { label: "Students reached", value: reachedTerm.toLocaleString(), hint: "term to date" },
        { label: "Hours contributed", value: Math.round(hoursTerm).toLocaleString() },
        { label: "Active ambassadors", value: activeAmbassadors.size.toLocaleString() },
        {
          label: "Avg students / activity",
          value: termRecords.length ? Math.round(reachedTerm / termRecords.length).toString() : "—",
        },
      ],
      activitiesPerMonth: timeBuckets(
        withTime.map((e) => e.t).filter((t): t is number => t !== null),
        "month",
        12,
      ),
      studentsReachedPerMonth: timeSumBuckets(
        withTime
          .filter((e) => e.t !== null)
          .map((e) => ({
            time: e.t as number,
            amount: e.r.fields["# of Students Interacted With"] ?? 0,
          })),
        "month",
        12,
      ),
      byActivity: sortDesc(mapToData(tally(termRecords, (e) => e.r.fields.Activity))),
      byLocation: topN(mapToData(tally(termRecords, (e) => e.r.fields.Location)), 10),
      leaderboard,
    };
  },
);
