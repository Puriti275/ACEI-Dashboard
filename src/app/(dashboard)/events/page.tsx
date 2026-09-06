import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <ComingSoon
      title="Events & Competitions"
      description="Competition outcomes and trends from Event Participation; attendance and attendee mix from Event Registrations."
      points={[
        "Competition funnel: Applied → Pitched → Finalist → Winner",
        "$ awarded and placements",
        "Attendance by event (Registration Status = Attended)",
        "Attendee mix: affiliation, college, pitching?",
        "Internal vs. external, semester over semester, speaker-series trend",
      ]}
    />
  );
}
