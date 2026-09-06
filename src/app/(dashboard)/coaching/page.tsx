import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Coaching" };

export default function CoachingPage() {
  return (
    <ComingSoon
      title="Coaching & Mentoring"
      description="From Interactions - Student & Mentors: how much mentoring is happening, by whom, on what."
      points={[
        "Interactions per week and by type / topic",
        "Mentor load by ACEI Member",
        "Distinct students served this term and sessions-per-student distribution",
        "Total and average session duration",
        "Open deliverables and anything past due",
      ]}
    />
  );
}
