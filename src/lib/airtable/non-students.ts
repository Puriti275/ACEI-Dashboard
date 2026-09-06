import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

/** Mentors, EIRs, speakers, judges, community members. */
export type NonStudentFields = {
  Name: string;
  "First Name": string;
  "Last Name": string;
  Role: string[];
  "Industry Speciality": string[];
  "Mentorship Specialty": string[];
  Active: string;
  Alumni: string;
  "Interactions- Student & Mentors": string[];
};

const FIELDS: (keyof NonStudentFields)[] = [
  "Name",
  "Role",
  "Industry Speciality",
  "Mentorship Specialty",
  "Active",
  "Alumni",
];

export type NonStudentRecord = AirtableRecord<NonStudentFields>;

export const getNonStudents = cache(
  (): Promise<NonStudentRecord[]> =>
    airtableSelect<NonStudentFields>(TABLES.nonStudents, { fields: FIELDS }, [TAGS.nonStudents]),
);

/** id -> display name, for resolving linked-record ids in aggregates. */
export async function getNonStudentNameMap(): Promise<Map<string, string>> {
  const records = await getNonStudents();
  const map = new Map<string, string>();
  for (const record of records) {
    if (record.fields.Name) map.set(record.id, record.fields.Name);
  }
  return map;
}
