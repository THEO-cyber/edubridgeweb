"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import InstructorShell from "@/components/InstructorShell";
import StatusPill from "@/components/StatusPill";

export default function InstructorDashboardPage() {
  return (
    <InstructorShell title="Dashboard">
      <DashboardBody />
    </InstructorShell>
  );
}

function DashboardBody() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.get("/analytics/instructor/dashboard", { token }).catch(() => null),
      api.get("/courses/instructor/my-courses", { token }).catch(() => null),
    ]).then(([s, c]) => {
      setStats(s);
      setCourses(pickList(c, ["courses", "items"]));
      setLoading(false);
    });
  }, [token]);

  if (loading) return <p className="text-muted">Loading your dashboard…</p>;

  const s = stats || {};
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold">Welcome back{user?.firstName ? `, ${user.firstName}` : ""} 👋</h2>
        <p className="text-sm text-muted">Here&apos;s how your courses are doing.</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Courses" value={s.totalCourses ?? courses.length} icon="📚" />
        <Stat label="Students" value={s.totalEnrollments ?? 0} icon="🎓" />
        <Stat label="Revenue" value={formatXAF(s.totalRevenue ?? 0)} icon="💰" />
        <Stat label="Avg rating" value={s.averageRating ? Number(s.averageRating).toFixed(1) : "—"} icon="⭐" />
        <Stat label="Reviews" value={s.totalReviews ?? 0} icon="💬" />
        <Stat label="Completion" value={s.completionRate != null ? `${Math.round(s.completionRate)}%` : "—"} icon="✅" />
      </div>

      {/* quick actions */}
      <div>
        <h3 className="mb-3 font-bold">Quick actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Action href="/teach/courses/new" icon="➕" label="New course" />
          <Action href="/teach/courses" icon="📚" label="Manage courses" />
          <Action href="/teach/live" icon="🔴" label="Schedule live class" />
          <Action href="/teach/earnings" icon="💸" label="Withdraw earnings" />
        </div>
      </div>

      {/* my courses */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">My courses</h3>
          <Link href="/teach/courses" className="text-sm font-semibold text-brand-500 hover:underline">See all →</Link>
        </div>
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-line bg-soft p-8 text-center">
            <p className="font-semibold">You haven&apos;t created a course yet</p>
            <Link href="/teach/courses/new" className="mt-3 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Create your first course</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/teach/courses/${c.id}`}
                className="flex items-center gap-4 rounded-xl border border-line bg-white p-3 shadow-card transition hover:shadow-hover">
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                  {c.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{c.title}</div>
                  <div className="text-xs text-muted">{c.totalEnrollments ?? c._count?.enrollments ?? 0} students · {formatXAF(c.price)}</div>
                </div>
                <StatusPill status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* top courses */}
      {Array.isArray(s.topCourses) && s.topCourses.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold">Top performing</h3>
          <div className="space-y-2">
            {s.topCourses.slice(0, 5).map((c: any, i: number) => (
              <div key={c.id || i} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-sm font-bold text-navy">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.title}</span>
                <span className="text-xs text-muted">{c.enrollments ?? c.totalEnrollments ?? c._count?.enrollments ?? 0} students</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: React.ReactNode; icon: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 text-xl font-extrabold text-navy">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function Action({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold shadow-card transition hover:border-brand-500 hover:shadow-hover">
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}

