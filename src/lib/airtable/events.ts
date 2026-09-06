import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

export type EventFields = {
  Event: string;
  Semester: string;
  "Event Name": string;
  Date: string;
  Time: string;
  Location: string;
  "Internal/External": string;
  "Speakers & Judges": string[];
  "Event Participation": string[];
  "Event Registrations": string[];
};

const FIELDS: (keyof EventFields)[] = [
  "Event",
  "Semester",
  "Event Name",
  "Date",
  "Time",
  "Location",
  "Internal/External",
  "Speakers & Judges",
  "Event Participation",
  "Event Registrations",
];

export type EventRecord = AirtableRecord<EventFields>;

export const getEvents = cache(
  (): Promise<EventRecord[]> =>
    airtableSelect<EventFields>(
      TABLES.events,
      { fields: FIELDS, sort: [{ field: "Date", direction: "desc" }] },
      [TAGS.events],
    ),
);

/** Coarse category derived from the `Event Name` single-select. */
export type EventCategory =
  | "Competition"
  | "Speaker Series"
  | "Workshop"
  | "Networking"
  | "Outreach"
  | "Other";

export function categorizeEvent(name: string | undefined): EventCategory {
  const value = (name ?? "").toLowerCase();
  if (!value) return "Other";
  if (/(vol court|graves|boyd|reverse pitch|business plan|challenge|pitch comp)/.test(value)) {
    return "Competition";
  }
  if (/(speaker series|meet the founder|founder friday|founders forum|executive speaker|lunch & learn|startup straight talk)/.test(value)) {
    return "Speaker Series";
  }
  if (/(studio|workshop|prototype|how to|bootcamp|info session|sign up session)/.test(value)) {
    return "Workshop";
  }
  if (/(networking|coffee club|reception|kickoff|golf|pitch & putt|mixer)/.test(value)) {
    return "Networking";
  }
  if (/(tabling|open house|career fair|expo|promo|donut)/.test(value)) {
    return "Outreach";
  }
  return "Other";
}
