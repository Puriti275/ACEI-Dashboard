import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Students" };

export default function StudentsPage() {
  return (
    <ComingSoon
      title="Students"
      description="Who the Anderson Center serves — the entrepreneurial journey, demographics, and how students find ACEI."
      points={[
        "Stage-of-development funnel (Exploration → Scaling/Exit)",
        "Breakdown by college, graduation year, and undergrad/grad",
        "Gender, race, and other-demographics mix with small-group suppression for admins",
        "Referral source: how did you hear about the Anderson Center?",
        "Engaged vs. not, first-touch vs. repeat, Credly badges earned this term",
      ]}
    />
  );
}
