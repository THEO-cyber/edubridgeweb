"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/teach/dashboard", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/teach/courses", label: "My Courses", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/teach/live", label: "Live Classes", icon: "M15 10l4.5-3v10L15 14M4 6h11v12H4z" },
  { href: "/teach/earnings", label: "Earnings", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
];

/**
 * Wraps every instructor page: gates access to the INSTRUCTOR role and renders
 * the shared teaching navigation, mirroring the mobile instructor experience.
 */
export default function InstructorShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?next=" + encodeURIComponent(pathname));
      return;
    }
    const role = (user?.role || "").toUpperCase();
    if (role !== "INSTRUCTOR" && role !== "SUPER_ADMIN") {
      // Not an instructor — send them to the application page instead.
      router.replace("/teach");
      return;
    }
    setChecked(true);
  }, [loading, token, user, router, pathname]);

  if (!checked) {
    return <div className="container-x grid min-h-[60vh] place-items-center text-muted">Loading your teaching space…</div>;
  }

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Instructor</p>
          <h1 className="text-2xl font-extrabold">{title}</h1>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-muted hover:text-ink">
          ← Switch to learning
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* side nav */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-navy text-white" : "text-muted hover:bg-soft hover:text-ink"
                }`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={n.icon} />
                </svg>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
