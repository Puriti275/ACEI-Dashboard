import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

export type StudentFields = {
  Name: string;
  "First Name": string;
  "Last Name": string;
  "UTK Email": string;
  "Personal Email": string;
  College: string[];
  Major: string;
  "Graduation Year": number;
  "Graduation Semester": string;
  Race: string[];
  Gender: string[];
  "Other Demographics": string[];
  "Stage of Development": string[];
  "How did you hear about the Anderson Center?": string[];
  "Date of First Engagement": string;
  "Current Student/Alum": string;
  "Undergrad/Grad": string;
  "Student Ambassador": string;
  "Credly Badges": string[];
  "Interactions- Student & Mentors": string[];
  "Student Event Participation": string[];
  "Event Registrations": string[];
  "Ambassador Tracking": string[];
  "Company Profiles": string[];
};

const FIELDS: (keyof StudentFields)[] = [
  "Name",
  "First Name",
  "Last Name",
  "UTK Email",
  "College",
  "Major",
  "Graduation Year",
  "Graduation Semester",
  "Race",
  "Gender",
  "Other Demographics",
  "Stage of Development",
  "How did you hear about the Anderson Center?",
  "Date of First Engagement",
  "Current Student/Alum",
  "Undergrad/Grad",
  "Student Ambassador",
  "Credly Badges",
  "Interactions- Student & Mentors",
  "Student Event Participation",
  "Event Registrations",
  "Ambassador Tracking",
  "Company Profiles",
];

export type StudentRecord = AirtableRecord<StudentFields>;

export const getStudents = cache(
  (): Promise<StudentRecord[]> =>
    airtableSelect<StudentFields>(TABLES.students, { fields: FIELDS }, [TAGS.students]),
);
