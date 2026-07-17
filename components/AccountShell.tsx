"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/account", label: "Profile", icon: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21a8 8 0 0 1 16 0" },
  { href: "/account/settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" },
];

/**
 * Wraps the student/instructor account area: gates access to signed-in users and
 * renders the shared Profile/Settings navigation, mirroring the mobile app.
 */
export default function AccountShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  const isInstructor = ["INSTRUCTOR", "SUPER_ADMIN"].includes((user?.role || "").toUpperCase());

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?next=" + encodeURIComponent(pathname));
      return;
    }
    setChecked(true);
  }, [loading, token, router, pathname]);

  if (!checked) {
    return <div className="container-x grid min-h-[60vh] place-items-center text-muted">Loading your account…</div>;
  }

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Account</p>
          <h1 className="text-2xl font-extrabold">{title}</h1>
        </div>
        <Link
          href={isInstructor ? "/teach/dashboard" : "/dashboard"}
          className="text-sm font-semibold text-muted hover:text-ink"
        >
          {isInstructor ? "← Instructor dashboard" : "← My Learning"}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* side nav */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((n) => {
            const active = pathname === n.href;
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
