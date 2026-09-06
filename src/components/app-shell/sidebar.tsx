"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type SidebarProps = {
  email: string;
  role: "admin" | "super_admin";
};

export function Sidebar({ email, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:w-60">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <span className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
          A
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">ACEI Admin</p>
          <p className="text-xs text-muted-foreground">Anderson Center</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border pt-3">
        <p className="truncate px-2 text-xs font-medium" title={email}>
          {email}
        </p>
        <p className="px-2 text-xs text-muted-foreground">
          {role === "super_admin" ? "Super admin" : "Admin"}
        </p>
        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
