/** Airtable table names, exactly as they appear in the ACEI base. */
export const TABLES = {
  students: "Student Profiles",
  interactions: "Interactions- Student & Mentors",
  events: "Events & Competitions",
  eventParticipation: "Event Participation",
  eventRegistrations: "Event Registrations",
  companies: "Company Profiles",
  ambassadorTracking: "Ambassador Tracking",
  ambassadorApplications: "Ambassador Applications",
  nonStudents: "Non-Student Profiles",
  credlyBadges: "Credly Badges",
} as const;

/** Cache tags — one per table. The daily cron and manual refresh bust these. */
export const TAGS = {
  students: "airtable:students",
  interactions: "airtable:interactions",
  events: "airtable:events",
  eventParticipation: "airtable:event-participation",
  eventRegistrations: "airtable:event-registrations",
  companies: "airtable:companies",
  ambassadorTracking: "airtable:ambassador-tracking",
  ambassadorApplications: "airtable:ambassador-applications",
  nonStudents: "airtable:non-students",
  credlyBadges: "airtable:credly-badges",
} as const;

export const ALL_TAGS: string[] = Object.values(TAGS);
