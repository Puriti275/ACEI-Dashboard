import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

/** Coaching / mentoring log — one row per student↔mentor touchpoint. */
export type InteractionFields = {
  Interaction: string;
  "Date and Time": string;
  Duration: number; // seconds
  "Type of Interaction": string[];
  Topic: string;
  Entrepreneur: string[]; // -> Student Profiles
  "ACEI Member": string[]; // -> Non-Student Profiles
  Company: string[]; // -> Company Profiles
  Notes: string;
  "Deliverable?": boolean;
  "Deliverable Details": string;
  "Deliverable Due Date": string;
  "Entrepreneur College": string[];
  "Entrepreneur Major": string[];
};

const FIELDS: (keyof InteractionFields)[] = [
  "Interaction",
  "Date and Time",
  "Duration",
  "Type of Interaction",
  "Topic",
  "Entrepreneur",
  "ACEI Member",
  "Company",
  "Deliverable?",
  "Deliverable Details",
  "Deliverable Due Date",
  "Entrepreneur College",
  "Entrepreneur Major",
];

export type InteractionRecord = AirtableRecord<InteractionFields>;

export const getInteractions = cache(
  (): Promise<InteractionRecord[]> =>
    airtableSelect<InteractionFields>(
      TABLES.interactions,
      { fields: FIELDS, sort: [{ field: "Date and Time", direction: "desc" }] },
      [TAGS.interactions],
    ),
);
