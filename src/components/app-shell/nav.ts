import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Users,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/briefing", label: "Briefing", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/coaching", label: "Coaching", icon: MessagesSquare },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/ambassadors", label: "Ambassadors", icon: Megaphone },
  { href: "/companies", label: "Companies", icon: Building2 },
];
