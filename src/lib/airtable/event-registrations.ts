import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

/** Per-person sign-ups for recent events. `Registration Status` reaches "Attended". */
export type EventRegistrationFields = {
  "Registration ID": number;
  Event: string[]; // -> Events & Competitions
  Affiliation: string;
  "Academic Year": string;
  College: string[];
  "Are you pitching?": string;
  "Registrant Type": string;
  "Registration Status": string;
  "Registration Date": string;
  "Associated Student Profile": string[];
};

const FIELDS: (keyof EventRegistrationFields)[] = [
  "Event",
  "Affiliation",
  "Academic Year",
  "College",
  "Are you pitching?",
  "Registrant Type",
  "Registration Status",
  "Registration Date",
  "Associated Student Profile",
];

export type EventRegistrationRecord = AirtableRecord<EventRegistrationFields>;

export const getEventRegistrations = cache(
  (): Promise<EventRegistrationRecord[]> =>
    airtableSelect<EventRegistrationFields>(
      TABLES.eventRegistrations,
      { fields: FIELDS },
      [TAGS.eventRegistrations],
    ),
);
