import "server-only";
import { cache } from "react";
import { getAmbassadorActivities } from "@/lib/airtable/ambassadors";
import { getStudentNameMap } from "@/lib/airtable/students";
import { toTime } from "@/lib/dates";
import {
  type Datum,
  mapToData,
  sortDesc,
  tally,
  timeBuckets,
  timeSumBuckets,
  topN,
} from "./shared";
import { type RangeKey, inRange, resolveRange } from "./window";

export type AmbassadorMetrics = {
  rangeLabel: string;
  perPeriodLabel: string;
  tiles: { label: string; value: string; hint?: string }[];
  activitiesPerPeriod: Datum[];
  studentsReachedPerPeriod: Datum[];
  byActivity: Datum[];
  byLocation: Datum[];
  leaderboard: Datum[];
};

export const getAmbassadorMetrics = cache(
  async (rangeKey: RangeKey, canSeePII: boolean): Promise<AmbassadorMetrics> => {
    const range = resolveRange(rangeKey);
    const [activities, studentNames] = await Promise.all([
      getAmbassadorActivities(),
      getStudentNameMap(),
    ]);

    const withTime = activities.map((r) => ({ r, t: toTime(r.fields.Date) }));
    const scoped = withTime.filter((e) => inRange(e.t, range));

    const reached = scoped.reduce(
      (sum, e) => sum + (e.r.fields["# of Students Interacted With"] ?? 0),
      0,
    );
    const hours = scoped.reduce((sum, e) => sum + (e.r.fields.Duration ?? 0), 0) / 3600;
    const activeAmbassadors = new Set<string>();
    for (const e of scoped) {
      for (const id of e.r.fields["Ambassador Name"] ?? []) activeAmbassadors.add(id);
    }

    const perAmbassador = new Map<string, number>();
    for (const e of scoped) {
      for (const id of e.r.fields["Ambassador Name"] ?? []) {
        perAmbassador.set(id, (perAmbassador.get(id) ?? 0) + 1);
      }
    }
    const leaderboard: Datum[] = [...perAmbassador.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id, value], index) => ({
        label: canSeePII ? (studentNames.get(id) ?? "Unknown") : `Ambassador ${index + 1}`,
        value,
      }));

    return {
      rangeLabel: range.label,
      perPeriodLabel: range.bucket === "week" ? "Weekly" : "Monthly",
      tiles: [
        { label: `Activities · ${range.label}`, value: scoped.length.toLocaleString() },
        { label: "Students reached", value: reached.toLocaleString(), hint: range.label },
        { label: "Hours contributed", value: Math.round(hours).toLocaleString() },
        { label: "Active ambassadors", value: activeAmbassadors.size.toLocaleString() },
        {
          label: "Avg students / activity",
          value: scoped.length ? Math.round(reached / scoped.length).toString() : "—",
        },
      ],
      activitiesPerPeriod: timeBuckets(
        withTime.map((e) => e.t).filter((t): t is number => t !== null),
        range.bucket,
        range.bucketCount,
      ),
      studentsReachedPerPeriod: timeSumBuckets(
        withTime
          .filter((e) => e.t !== null)
          .map((e) => ({
            time: e.t as number,
            amount: e.r.fields["# of Students Interacted With"] ?? 0,
          })),
        range.bucket,
        range.bucketCount,
      ),
      byActivity: sortDesc(mapToData(tally(scoped, (e) => e.r.fields.Activity))),
      byLocation: topN(mapToData(tally(scoped, (e) => e.r.fields.Location)), 10),
      leaderboard,
    };
  },
);
