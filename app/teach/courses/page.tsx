"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { formatXAF } from "@/lib/format";
import InstructorShell from "@/components/InstructorShell";
import StatusPill from "@/components/StatusPill";

export default function InstructorCoursesPage() {
  return (
    <InstructorShell title="My Courses">
      <CoursesBody />
    </InstructorShell>
  );
}

function CoursesBody() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const d = await api.get("/courses/instructor/my-courses", { token: token! }).catch(() => null);
    setCourses(pickList(d, ["courses", "items"]));
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  async function publish(c: any) {
    setBusy(c.id);
    setMsg(null);
    try {
      await api.post(`/courses/${c.id}/publish`, {}, { token: token! });
      setMsg(`“${c.title}” submitted for publishing.`);
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Could not publish. Make sure the course has lessons.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(c: any) {
    if (!confirm(`Delete “${c.title}”? This cannot be undone.`)) return;
    setBusy(c.id);
    try {
      await api.del(`/courses/${c.id}`, { token: token! });
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Could not delete this course.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{courses?.length ?? 0} course{courses?.length === 1 ? "" : "s"}</p>
        <Link href="/teach/courses/new" className="rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
          + New course
        </Link>
      </div>

      {msg && <p className="rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-700">{msg}</p>}

      {courses === null ? (
        <p className="text-muted">Loading…</p>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-soft p-12 text-center">
          <div className="text-4xl">📚</div>
          <p className="mt-3 text-lg font-semibold">No courses yet</p>
          <p className="mt-1 text-muted">Create your first course and start teaching.</p>
          <Link href="/teach/courses/new" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Create a course</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-card">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {c.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-bold">{c.title}</span>
                  <StatusPill status={c.status} />
                </div>
                <div className="mt-1 text-xs text-muted">
                  {c.totalEnrollments ?? c._count?.enrollments ?? 0} students · {formatXAF(c.price)}
                  {c.averageRating ? ` · ⭐ ${Number(c.averageRating).toFixed(1)}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/teach/courses/${c.id}`} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:bg-soft">Edit</Link>
                {!["PUBLISHED","UNDER_REVIEW","PENDING_REVIEW"].includes(String(c.status).toUpperCase()) && (
                  <button onClick={() => publish(c)} disabled={busy === c.id} className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                    {busy === c.id ? "…" : "Publish"}
                  </button>
                )}
                <button onClick={() => remove(c)} disabled={busy === c.id} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
