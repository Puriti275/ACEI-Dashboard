import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

export type AmbassadorActivityFields = {
  "Activity Tracking": string;
  "Ambassador Name": string[]; // -> Student Profiles
  Activity: string[];
  Date: string;
  Duration: number; // seconds
  Location: string;
  "# of Students Interacted With": number;
  Notes: string;
};

const FIELDS: (keyof AmbassadorActivityFields)[] = [
  "Activity Tracking",
  "Ambassador Name",
  "Activity",
  "Date",
  "Duration",
  "Location",
  "# of Students Interacted With",
  "Notes",
];

export type AmbassadorActivityRecord = AirtableRecord<AmbassadorActivityFields>;

export const getAmbassadorActivities = cache(
  (): Promise<AmbassadorActivityRecord[]> =>
    airtableSelect<AmbassadorActivityFields>(
      TABLES.ambassadorTracking,
      { fields: FIELDS, sort: [{ field: "Date", direction: "desc" }] },
      [TAGS.ambassadorTracking],
    ),
);
