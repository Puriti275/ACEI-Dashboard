import "server-only";
import { cache } from "react";
import { airtableSelect, type AirtableRecord } from "./client";
import { TABLES, TAGS } from "./constants";

export type CompanyFields = {
  "Company Name": string;
  "Business Entity": string;
  "Date Formed": string;
  Industry: string[];
  "Raised Capital?": string;
  "Non-Dilutive Funding Raised": number;
  "Investment Funding Raised": number;
  "Total Funding Raised": number;
  "Scalable/Lifestyle": string;
  "ACEI Status": string[];
  "Operating/Out of Business": string;
  "Number of ACEI Interactions": number;
  "Days Since Last Interaction": number;
  "Recent Interaction": string;
  "Semester Entered": string;
  "Year in School": string;
  "Entrepreneur Founder": string[];
};

const FIELDS: (keyof CompanyFields)[] = [
  "Company Name",
  "Business Entity",
  "Date Formed",
  "Industry",
  "Raised Capital?",
  "Non-Dilutive Funding Raised",
  "Investment Funding Raised",
  "Total Funding Raised",
  "Scalable/Lifestyle",
  "ACEI Status",
  "Operating/Out of Business",
  "Number of ACEI Interactions",
  "Days Since Last Interaction",
  "Recent Interaction",
  "Semester Entered",
  "Year in School",
  "Entrepreneur Founder",
];

export type CompanyRecord = AirtableRecord<CompanyFields>;

export const getCompanies = cache(
  (): Promise<CompanyRecord[]> =>
    airtableSelect<CompanyFields>(TABLES.companies, { fields: FIELDS }, [TAGS.companies]),
);
