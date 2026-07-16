"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, pickList, ApiError } from "@/lib/api";
import { formatSessionTime, sessionRelative, isJoinable, instructorName } from "@/lib/format";

type Session = any;

export default function LivePage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const [up, mine] = await Promise.all([
        api.get("/live-sessions/upcoming?limit=50", { token: token! }),
        // No `role` param: the backend's validation pipe rejects unknown query keys,
        // and for a student the unfiltered list is exactly their accepted sessions.
        api.get("/live-sessions/my-sessions?limit=50", { token: token! }).catch(() => null),
      ]);
      setSessions(pickList(up, ["sessions", "items"]));
      setAcceptedIds(new Set(pickList(mine, ["sessions", "items"]).map((s: any) => s.id)));
      setState("ready");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load live classes.");
      setState("error");
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?next=/live");
      return;
    }
    load();
  }, [authLoading, token, router, load]);

  return (
    <div className="container-x py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Live classes</h1>
          <p className="mt-1 text-muted">Join real-time sessions with instructors. Apply, get accepted, and hop in.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Live &amp; upcoming
        </span>
      </header>

      {state === "loading" && <p className="text-muted">Loading live classes…</p>}
      {state === "error" && (
        <div className="rounded-2xl border border-line bg-soft p-8 text-center">
          <p className="font-semibold">{err}</p>
          <button onClick={load} className="mt-3 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
        </div>
      )}

      {state === "ready" && sessions.length === 0 && (
        <div className="rounded-2xl border border-line bg-soft p-12 text-center">
          <div className="text-4xl">📡</div>
          <p className="mt-3 text-lg font-semibold">No live classes scheduled right now</p>
          <p className="mt-1 text-muted">Check back soon — instructors host live sessions regularly.</p>
          <Link href="/courses" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Explore courses
          </Link>
        </div>
      )}

      {state === "ready" && sessions.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} accepted={acceptedIds.has(s.id)} token={token!} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session: s, accepted, token }: { session: any; accepted: boolean; token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const live = String(s.status).toUpperCase() === "IN_PROGRESS";
  const joinable = isJoinable(s.scheduledAt, s.status);
  const spots = typeof s.maxStudents === "number" ? `${s._count?.applications ?? 0}/${s.maxStudents}` : null;

  async function apply() {
    setBusy(true);
    setMsg(null);
    try {
      await api.post(`/live-sessions/${s.id}/apply`, {}, { token });
      setApplied(true);
      setMsg("Applied — you'll be notified once accepted.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setApplied(true);
        setMsg("You've already applied to this class.");
      } else {
        setMsg(e instanceof Error ? e.message : "Could not apply.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${live ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"}`}>
          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
          {sessionRelative(s.scheduledAt, s.status)}
        </span>
        {spots && <span className="text-xs text-muted">{spots} spots</span>}
      </div>

      <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug">{s.title}</h3>
      <p className="mt-1 text-sm text-muted">with {instructorName(s)}</p>
      {s.course?.title && <p className="mt-0.5 text-xs text-muted">Course: {s.course.title}</p>}

      <div className="mt-3 space-y-1 text-sm text-muted">
        <p>🗓️ {formatSessionTime(s.scheduledAt)}</p>
        {s.duration ? <p>⏱️ {s.duration} min</p> : null}
      </div>

      {s.description && <p className="mt-3 line-clamp-2 text-sm text-muted">{s.description}</p>}

      <div className="mt-auto pt-5">
        {joinable && accepted ? (
          <button onClick={() => router.push(`/live/${s.id}/room`)} className="w-full rounded-xl bg-red-600 py-2.5 font-bold text-white transition hover:bg-red-700">
            {live ? "Join live now" : "Enter class"}
          </button>
        ) : accepted ? (
          <div className="rounded-xl bg-green-50 py-2.5 text-center font-semibold text-green-700">You&apos;re in ✓ · starts soon</div>
        ) : applied ? (
          <div className="rounded-xl bg-brand-50 py-2.5 text-center font-semibold text-brand-600">Applied · pending</div>
        ) : joinable ? (
          <button onClick={() => router.push(`/live/${s.id}/room`)} className="w-full rounded-xl bg-navy py-2.5 font-bold text-white transition hover:bg-brand-700">
            Try to join
          </button>
        ) : (
          <button onClick={apply} disabled={busy} className="w-full rounded-xl bg-navy py-2.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Applying…" : "Apply to join"}
          </button>
        )}
        {msg && <p className="mt-2 text-center text-xs text-muted">{msg}</p>}
      </div>
    </div>
  );
}
