import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

/** Historical record of who did what at each event, incl. competition outcomes. */
export type EventParticipationFields = {
  "Event Overview": string;
  Semester: string;
  "Event Name": string[]; // -> Events & Competitions
  "Student Name": string[]; // -> Student Profiles
  "Non-Student Name": string[]; // -> Non-Student Profiles
  "Level of Participation": string[];
  Place: string;
  "$ Awarded": string;
  Affiliation: string;
  Created: string;
};

const FIELDS: (keyof EventParticipationFields)[] = [
  "Semester",
  "Event Name",
  "Student Name",
  "Non-Student Name",
  "Level of Participation",
  "Place",
  "$ Awarded",
  "Affiliation",
  "Created",
];

export type EventParticipationRecord = AirtableRecord<EventParticipationFields>;

export const getEventParticipation = cache(
  (): Promise<EventParticipationRecord[]> =>
    airtableSelect<EventParticipationFields>(
      TABLES.eventParticipation,
      { fields: FIELDS },
      [TAGS.eventParticipation],
    ),
);
