import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Ambassadors" };

export default function AmbassadorsPage() {
  return (
    <ComingSoon
      title="Ambassadors"
      description="From Ambassador Tracking, plus the recruiting pipeline in Ambassador Applications."
      points={[
        "Activities logged per month and students reached",
        "Hours contributed (sum of durations)",
        "By activity type and by location",
        "Leaderboard by ambassador",
        "Applicant pipeline",
      ]}
    />
  );
}
