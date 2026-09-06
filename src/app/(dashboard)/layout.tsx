import { requireSession } from "@/lib/dal";
import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      <div className="hidden md:block">
        <div className="sticky top-0 h-screen">
          <Sidebar email={session.email} role={session.role} />
        </div>
      </div>
      <MobileNav />
      <main className="min-w-0 px-5 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
