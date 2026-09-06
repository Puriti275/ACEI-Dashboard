import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Companies" };

export default function CompaniesPage() {
  return (
    <ComingSoon
      title="Company Profiles"
      description="The venture registry — the idea-to-LLC progression is the Business Entity field itself."
      points={[
        "Formation funnel (Not Yet Formed → LLC → C-Corp)",
        "Capital raised: non-dilutive, investment, total",
        "By industry, scalable vs. lifestyle",
        "ACEI status active/inactive, operating vs. closed",
        "Stale ventures (Days Since Last Interaction > 90) and formations per semester",
      ]}
    />
  );
}
