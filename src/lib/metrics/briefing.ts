import "server-only";
import { cache } from "react";
import { getStudents } from "@/lib/airtable/students";
import { getInteractions } from "@/lib/airtable/interactions";
import { getEvents } from "@/lib/airtable/events";
import { getCompanies } from "@/lib/airtable/companies";
import { getAmbassadorActivities } from "@/lib/airtable/ambassadors";
import { currentTermLabel, currentTermStart, daysAgo, daysFromNow, toTime } from "@/lib/dates";

export type UpcomingEvent = {
  id: string;
  name: string;
  date: string | null;
  location: string | null;
  internalExternal: string | null;
  needsSpeakers: boolean;
};

export type ActivityItem = {
  id: string;
  kind: "coaching" | "ambassador";
  title: string;
  detail: string;
  date: string | null;
};

export type Briefing = {
  generatedAt: string;
  termLabel: string;
  kpis: {
    studentsEngaged30: number;
    coachingInteractions30: number;
    coachingInteractionsPrev30: number;
    mentoringHoursTerm: number;
    upcomingEvents14: number;
    ambassadorReach30: number;
    capitalRaised: number;
    deliverablesOpen: number;
    deliverablesOverdue: number;
  };
  totals: { students: number; companies: number };
  upcoming: UpcomingEvent[];
  recent: ActivityItem[];
  alerts: string[];
};

export const getBriefing = cache(async (): Promise<Briefing> => {
  const [students, interactions, events, companies, ambassadors] = await Promise.all([
    getStudents(),
    getInteractions(),
    getEvents(),
    getCompanies(),
    getAmbassadorActivities(),
  ]);

  const now = Date.now();
  const cut30 = daysAgo(30);
  const cut60 = daysAgo(60);
  const termStart = currentTermStart();

  const interactionsWithTime = interactions.map((record) => ({
    record,
    time: toTime(record.fields["Date and Time"]),
  }));

  const inLast30 = interactionsWithTime.filter((entry) => entry.time !== null && entry.time >= cut30);
  const inPrev30 = interactionsWithTime.filter(
    (entry) => entry.time !== null && entry.time >= cut60 && entry.time < cut30,
  );
  const inTerm = interactionsWithTime.filter((entry) => entry.time !== null && entry.time >= termStart);

  const mentoringHoursTerm =
    inTerm.reduce((sum, entry) => sum + (entry.record.fields.Duration ?? 0), 0) / 3600;

  const engaged30 = new Set<string>();
  for (const entry of inLast30) {
    for (const id of entry.record.fields.Entrepreneur ?? []) engaged30.add(id);
  }

  const upcoming: UpcomingEvent[] = events
    .filter((record) => {
      const time = toTime(record.fields.Date);
      return time !== null && time >= now && time <= daysFromNow(14);
    })
    .map((record) => ({
      id: record.id,
      name: record.fields["Event Name"] ?? record.fields.Event ?? "Untitled event",
      date: record.fields.Date ?? null,
      location: record.fields.Location ?? null,
      internalExternal: record.fields["Internal/External"] ?? null,
      needsSpeakers: (record.fields["Speakers & Judges"] ?? []).length === 0,
    }))
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  const deliverablesOpen = interactions.filter(
    (record) => record.fields["Deliverable?"] === true && !!record.fields["Deliverable Due Date"],
  );
  const deliverablesOverdue = deliverablesOpen.filter((record) => {
    const due = toTime(record.fields["Deliverable Due Date"]);
    return due !== null && due < now;
  });

  const capitalRaised = companies.reduce(
    (sum, record) => sum + (record.fields["Total Funding Raised"] ?? 0),
    0,
  );

  const ambassadorsWithTime = ambassadors.map((record) => ({
    record,
    time: toTime(record.fields.Date),
  }));
  const ambassadorReach30 = ambassadorsWithTime
    .filter((entry) => entry.time !== null && entry.time >= cut30)
    .reduce((sum, entry) => sum + (entry.record.fields["# of Students Interacted With"] ?? 0), 0);

  const recentCoaching: ActivityItem[] = inLast30.slice(0, 6).map((entry) => ({
    id: entry.record.id,
    kind: "coaching",
    title: entry.record.fields.Topic ?? "Coaching session",
    detail: (entry.record.fields["Type of Interaction"] ?? []).join(", ") || "Interaction logged",
    date: entry.record.fields["Date and Time"] ?? null,
  }));
  const recentAmbassador: ActivityItem[] = ambassadorsWithTime
    .filter((entry) => entry.time !== null && entry.time >= cut30)
    .slice(0, 4)
    .map((entry) => ({
      id: entry.record.id,
      kind: "ambassador",
      title: (entry.record.fields.Activity ?? []).join(", ") || "Ambassador activity",
      detail: `${entry.record.fields["# of Students Interacted With"] ?? 0} students · ${
        entry.record.fields.Location ?? "location n/a"
      }`,
      date: entry.record.fields.Date ?? null,
    }));

  const recent = [...recentCoaching, ...recentAmbassador]
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 8);

  const eventsNeedingSpeakers = upcoming.filter((event) => event.needsSpeakers).length;
  const staleVentures = companies.filter(
    (record) => (record.fields["Days Since Last Interaction"] ?? 0) > 90,
  ).length;

  const alerts: string[] = [];
  if (eventsNeedingSpeakers > 0) {
    alerts.push(`${eventsNeedingSpeakers} upcoming event(s) have no speakers or judges assigned.`);
  }
  if (deliverablesOverdue.length > 0) {
    alerts.push(`${deliverablesOverdue.length} coaching deliverable(s) are past due.`);
  }
  if (staleVentures > 0) {
    alerts.push(`${staleVentures} venture(s) have had no ACEI contact in 90+ days.`);
  }

  return {
    generatedAt: new Date().toISOString(),
    termLabel: currentTermLabel(),
    kpis: {
      studentsEngaged30: engaged30.size,
      coachingInteractions30: inLast30.length,
      coachingInteractionsPrev30: inPrev30.length,
      mentoringHoursTerm,
      upcomingEvents14: upcoming.length,
      ambassadorReach30,
      capitalRaised,
      deliverablesOpen: deliverablesOpen.length,
      deliverablesOverdue: deliverablesOverdue.length,
    },
    totals: { students: students.length, companies: companies.length },
    upcoming,
    recent,
    alerts,
  };
});
