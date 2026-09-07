import "server-only";
import { cache } from "react";
import { categorizeEvent, getEvents } from "@/lib/airtable/events";
import { getEventParticipation } from "@/lib/airtable/event-participation";
import { getEventRegistrations } from "@/lib/airtable/event-registrations";
import { currentTermLabel, currentTermStart, daysFromNow, toTime } from "@/lib/dates";
import {
  type Datum,
  mapToData,
  orderedTally,
  parseAmount,
  sortDesc,
  tally,
  timeBuckets,
  topN,
} from "./shared";

const PARTICIPATION_ORDER = [
  "Registered",
  "Applied",
  "Attended",
  "Pitched",
  "Presenter",
  "Speaker",
  "Judge",
  "Finalist",
  "Winner",
];

const STATUS_ORDER = ["Registered", "Waitlisted", "Attended", "Cancelled"];

const SEMESTER_ORDER = [
  "Spring 2024",
  "Summer 2024",
  "Fall 2024",
  "Spring 2025",
  "Summer 2025",
  "Fall 2025",
  "Spring 2026",
  "Summer 2026",
  "Fall 2026",
];

export type EventMetrics = {
  tiles: { label: string; value: string; hint?: string }[];
  participationLevels: Datum[];
  byCategory: Datum[];
  registrationsPerMonth: Datum[];
  registrationStatus: Datum[];
  attendeeAffiliation: Datum[];
  internalExternalBySemester: Record<string, string | number>[];
};

export const getEventMetrics = cache(async (): Promise<EventMetrics> => {
  const [events, participation, registrations] = await Promise.all([
    getEvents(),
    getEventParticipation(),
    getEventRegistrations(),
  ]);

  const now = Date.now();
  const termStart = currentTermStart();
  const eventsThisTerm = events.filter((r) => {
    const t = toTime(r.fields.Date);
    return t !== null && t >= termStart;
  }).length;
  const upcoming30 = events.filter((r) => {
    const t = toTime(r.fields.Date);
    return t !== null && t >= now && t <= daysFromNow(30);
  }).length;

  const attended = registrations.filter(
    (r) => r.fields["Registration Status"] === "Attended",
  ).length;
  const notCancelled = registrations.filter(
    (r) => r.fields["Registration Status"] !== "Cancelled",
  ).length;
  const awarded = participation.reduce((sum, r) => sum + parseAmount(r.fields["$ Awarded"]), 0);
  const winners = participation.filter((r) =>
    (r.fields["Level of Participation"] ?? []).includes("Winner"),
  ).length;

  const semesterRows = SEMESTER_ORDER.map((semester) => {
    const inSemester = events.filter((r) => r.fields.Semester === semester);
    return {
      label: semester.replace(" 20", " '"),
      Internal: inSemester.filter((r) => r.fields["Internal/External"] === "Internal Event").length,
      External: inSemester.filter((r) => r.fields["Internal/External"] === "External Event").length,
    };
  }).filter((row) => row.Internal + row.External > 0);

  return {
    tiles: [
      { label: `Events · ${currentTermLabel()}`, value: eventsThisTerm.toLocaleString() },
      { label: "Upcoming · 30d", value: upcoming30.toLocaleString() },
      {
        label: "Registrations",
        value: registrations.length.toLocaleString(),
        hint: "all time",
      },
      {
        label: "Attendance rate",
        value: notCancelled ? `${Math.round((attended / notCancelled) * 100)}%` : "—",
        hint: `${attended.toLocaleString()} marked attended`,
      },
      { label: "Competition winners", value: winners.toLocaleString() },
      {
        label: "$ awarded",
        value:
          awarded >= 1000 ? `$${Math.round(awarded / 1000)}K` : `$${Math.round(awarded)}`,
        hint: "recorded in Event Participation",
      },
    ],
    participationLevels: orderedTally(participation, PARTICIPATION_ORDER, (r) =>
      r.fields["Level of Participation"],
    ).filter((d) => d.value > 0),
    byCategory: sortDesc(
      mapToData(tally(events, (r) => categorizeEvent(r.fields["Event Name"]))),
    ),
    registrationsPerMonth: timeBuckets(
      registrations
        .map((r) => toTime(r.fields["Registration Date"]))
        .filter((t): t is number => t !== null),
      "month",
      12,
    ),
    registrationStatus: orderedTally(registrations, STATUS_ORDER, (r) =>
      r.fields["Registration Status"],
    ).filter((d) => d.value > 0),
    attendeeAffiliation: topN(
      mapToData(tally(registrations, (r) => r.fields.Affiliation)),
      8,
    ),
    internalExternalBySemester: semesterRows,
  };
});
