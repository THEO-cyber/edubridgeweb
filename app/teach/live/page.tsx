"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { formatSessionTime, sessionRelative, isJoinable } from "@/lib/format";
import InstructorShell from "@/components/InstructorShell";

export default function InstructorLivePage() {
  return (
    <InstructorShell title="Live Classes">
      <LiveBody />
    </InstructorShell>
  );
}

function LiveBody() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<any[] | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    // role=instructor now accepted by the API (my-sessions DTO fix)
    const d = await api.get("/live-sessions/my-sessions?role=instructor&limit=50", { token: token! })
      .catch(() => api.get("/live-sessions/my-sessions?limit=50", { token: token! }).catch(() => null));
    setSessions(pickList(d, ["sessions", "items"]));
  }, [token]);

  useEffect(() => { if (token) load(); }, [token, load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{sessions?.length ?? 0} session{sessions?.length === 1 ? "" : "s"}</p>
        <button onClick={() => setShowForm((v) => !v)} className="rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
          {showForm ? "Close" : "+ Schedule a class"}
        </button>
      </div>

      {showForm && <ScheduleForm token={token!} onCreated={() => { setShowForm(false); load(); }} />}

      {sessions === null ? (
        <p className="text-muted">Loading…</p>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-line bg-soft p-12 text-center">
          <div className="text-4xl">📡</div>
          <p className="mt-3 text-lg font-semibold">No live classes scheduled</p>
          <p className="mt-1 text-muted">Schedule a session and students can apply to join.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => <SessionRow key={s.id} session={s} token={token!} reload={load} />)}
        </div>
      )}
    </div>
  );
}

function ScheduleForm({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [f, setF] = useState({ title: "", description: "", date: "", time: "", duration: "60", maxStudents: "30" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.date || !f.time) return setErr("Choose a date and time.");
    const scheduledAt = new Date(`${f.date}T${f.time}`);
    if (scheduledAt.getTime() <= Date.now()) return setErr("Pick a time in the future.");
    setBusy(true);
    try {
      await api.post("/live-sessions", {
        title: f.title.trim(),
        description: f.description.trim() || undefined,
        scheduledAt: scheduledAt.toISOString(),
        duration: Number(f.duration) || 60,
        maxStudents: Number(f.maxStudents) || 30,
        isPublic: true,
      }, { token });
      onCreated();
    } catch (e: any) {
      setErr(e?.message || "Could not schedule the class.");
    } finally { setBusy(false); }
  }

  const cls = "w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500";
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-line bg-white p-5 shadow-card">
      <input value={f.title} onChange={(e) => set("title", e.target.value)} required minLength={3} placeholder="Class title" className={cls} />
      <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="What will you cover? (optional)" className={cls} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-xs font-medium text-muted">Date</span>
          <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={cls} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-muted">Time</span>
          <input type="time" value={f.time} onChange={(e) => set("time", e.target.value)} className={cls} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-muted">Duration (minutes)</span>
          <input value={f.duration} onChange={(e) => set("duration", e.target.value)} inputMode="numeric" className={cls} /></label>
        <label className="block"><span className="mb-1 block text-xs font-medium text-muted">Max students</span>
          <input value={f.maxStudents} onChange={(e) => set("maxStudents", e.target.value)} inputMode="numeric" className={cls} /></label>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        {busy ? "Scheduling…" : "Schedule class"}
      </button>
    </form>
  );
}

function SessionRow({ session: s, token, reload }: { session: any; token: string; reload: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<any[] | null>(null);
  const live = String(s.status).toUpperCase() === "IN_PROGRESS";
  const joinable = isJoinable(s.scheduledAt, s.status);

  async function loadApps() {
    if (apps) return;
    const d = await api.get(`/live-sessions/${s.id}/applications`, { token }).catch(() => null);
    setApps(pickList(d, ["applications", "items"]));
  }
  function toggle() { setOpen((v) => !v); if (!open) loadApps(); }

  async function decide(appId: string, accept: boolean) {
    await api.patch(`/live-sessions/applications/${appId}/${accept ? "accept" : "reject"}`, {}, { token });
    setApps((prev) => prev?.filter((a) => a.id !== appId) ?? prev);
  }
  async function del() {
    if (!confirm(`Delete “${s.title}”?`)) return;
    await api.del(`/live-sessions/${s.id}`, { token });
    await reload();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${live ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"}`}>
              {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
              {sessionRelative(s.scheduledAt, s.status)}
            </span>
            <span className="truncate font-bold">{s.title}</span>
          </div>
          <div className="mt-1 text-xs text-muted">🗓️ {formatSessionTime(s.scheduledAt)} · {s.duration} min · {s._count?.applications ?? 0} applicants</div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggle} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:bg-soft">
            {open ? "Hide" : "Applicants"}
          </button>
          {joinable && (
            <button onClick={() => router.push(`/live/${s.id}/room`)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700">
              {live ? "Join" : "Start"}
            </button>
          )}
          <button onClick={del} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-line pt-3">
          {apps === null ? (
            <p className="text-sm text-muted">Loading applicants…</p>
          ) : apps.length === 0 ? (
            <p className="text-sm text-muted">No pending applications.</p>
          ) : (
            <ul className="space-y-2">
              {apps.map((a) => {
                const name = `${a.student?.firstName ?? ""} ${a.student?.lastName ?? ""}`.trim() || a.student?.email || "Student";
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-soft px-3 py-2">
                    <span className="min-w-0 truncate text-sm font-medium">{name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => decide(a.id, true)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">Accept</button>
                      <button onClick={() => decide(a.id, false)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
