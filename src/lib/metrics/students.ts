import "server-only";
import { cache } from "react";
import { getStudents, type StudentRecord } from "@/lib/airtable/students";
import {
  type Datum,
  mapToData,
  orderedTally,
  sortDesc,
  suppressSmall,
  tally,
  topN,
} from "./shared";

const STAGE_ORDER = [
  "Exploration (Interested in entrepreneurship)",
  "Ideation (I have some ideas)",
  "Market Validation (I'm doing some research to see if my idea[s] can work)",
  "Business Planning (I'm developing a plan for my business)",
  "Prototyping (I'm building a product or service to test)",
  "Launched (I've formed my business)",
  "Growth (I'm generating revenue and trying to grow)",
  "Scaling/Exit (I'm scaling my business and/or looking to exit)",
];

const STAGE_SHORT: Record<string, string> = {
  [STAGE_ORDER[0]]: "Exploration",
  [STAGE_ORDER[1]]: "Ideation",
  [STAGE_ORDER[2]]: "Market Validation",
  [STAGE_ORDER[3]]: "Business Planning",
  [STAGE_ORDER[4]]: "Prototyping",
  [STAGE_ORDER[5]]: "Launched",
  [STAGE_ORDER[6]]: "Growth",
  [STAGE_ORDER[7]]: "Scaling / Exit",
};

function isEngaged(record: StudentRecord): boolean {
  const f = record.fields;
  return (
    (f["Interactions- Student & Mentors"] ?? []).length > 0 ||
    (f["Student Event Participation"] ?? []).length > 0 ||
    (f["Event Registrations"] ?? []).length > 0 ||
    (f["Ambassador Tracking"] ?? []).length > 0
  );
}

export type StudentMetrics = {
  tiles: { label: string; value: string; hint?: string }[];
  stage: Datum[];
  byCollege: Datum[];
  gender: Datum[];
  race: Datum[];
  otherDemographics: Datum[];
  referral: Datum[];
  graduationYear: Datum[];
  badges: Datum[];
  suppressed: boolean;
};

export const getStudentMetrics = cache(
  async (canSeePII: boolean): Promise<StudentMetrics> => {
    const students = await getStudents();
    const total = students.length;
    const engaged = students.filter(isEngaged).length;
    const currentStudents = students.filter(
      (r) => r.fields["Current Student/Alum"] === "Current Student",
    ).length;
    const ambassadors = students.filter((r) => r.fields["Student Ambassador"] === "Yes").length;

    const stage = orderedTally(students, STAGE_ORDER, (r) => r.fields["Stage of Development"]).map(
      (d) => ({ label: STAGE_SHORT[d.label] ?? d.label, value: d.value }),
    );

    return {
      tiles: [
        { label: "Students", value: total.toLocaleString(), hint: "profiles in the base" },
        {
          label: "Engaged",
          value: total ? `${Math.round((engaged / total) * 100)}%` : "0%",
          hint: `${engaged.toLocaleString()} with a logged activity`,
        },
        {
          label: "Current students",
          value: currentStudents.toLocaleString(),
          hint: `${(total - currentStudents).toLocaleString()} alumni / former`,
        },
        { label: "Student ambassadors", value: ambassadors.toLocaleString() },
      ],
      stage,
      byCollege: topN(mapToData(tally(students, (r) => r.fields.College)), 12),
      gender: suppressSmall(
        sortDesc(mapToData(tally(students, (r) => r.fields.Gender))),
        !canSeePII,
      ),
      race: suppressSmall(
        sortDesc(mapToData(tally(students, (r) => r.fields.Race))),
        !canSeePII,
      ),
      otherDemographics: suppressSmall(
        sortDesc(mapToData(tally(students, (r) => r.fields["Other Demographics"]))),
        !canSeePII,
      ),
      referral: topN(
        mapToData(tally(students, (r) => r.fields["How did you hear about the Anderson Center?"])),
        10,
      ),
      graduationYear: sortDesc(
        mapToData(
          tally(students, (r) =>
            r.fields["Graduation Year"] ? String(r.fields["Graduation Year"]) : undefined,
          ),
        ),
      )
        .filter((d) => /^\d{4}$/.test(d.label))
        .sort((a, b) => a.label.localeCompare(b.label)),
      badges: topN(mapToData(tally(students, (r) => r.fields["Credly Badges"])), 12),
      suppressed: !canSeePII,
    };
  },
);
