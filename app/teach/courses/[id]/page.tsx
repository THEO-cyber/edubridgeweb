"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatXAF, formatDuration } from "@/lib/format";
import InstructorShell from "@/components/InstructorShell";
import StatusPill from "@/components/StatusPill";

export default function CourseEditorPage() {
  return (
    <InstructorShell title="Edit Course">
      <Editor />
    </InstructorShell>
  );
}

function Editor() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<any | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [tab, setTab] = useState<"curriculum" | "details">("curriculum");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [c, s] = await Promise.all([
      api.get(`/courses/${id}`, { token: token! }).catch(() => null),
      api.get(`/lessons/sections/${id}`, { token: token! }).catch(() => null),
    ]);
    setCourse(c);
    setSections(Array.isArray(s) ? s : s?.sections ?? []);
    setLoading(false);
  }, [id, token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  async function publish() {
    setMsg(null);
    try {
      await api.post(`/courses/${id}/publish`, {}, { token: token! });
      setMsg("Submitted for publishing.");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Add at least one lesson before publishing.");
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!course) return <p className="text-muted">Course not found. <Link href="/teach/courses" className="text-brand-500">Back to courses</Link></p>;

  const lessonCount = sections.reduce((n, s) => n + (s.lessons?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold">{course.title}</h2>
            <StatusPill status={course.status} />
          </div>
          <p className="text-xs text-muted">{sections.length} sections · {lessonCount} lessons · {formatXAF(course.price)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/courses/${course.slug}`} target="_blank" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:bg-soft">Preview</Link>
          {!["PUBLISHED","UNDER_REVIEW","PENDING_REVIEW"].includes(String(course.status).toUpperCase()) && (
            <button onClick={publish} className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">Publish</button>
          )}
        </div>
      </div>

      {msg && <p className="rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-700">{msg}</p>}

      {/* tabs */}
      <div className="flex gap-2">
        {(["curriculum", "details"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? "bg-navy text-white" : "text-muted hover:bg-soft"}`}>
            {t === "curriculum" ? "Curriculum" : "Details"}
          </button>
        ))}
      </div>

      {tab === "curriculum"
        ? <Curriculum courseId={id} sections={sections} token={token!} reload={load} />
        : <Details course={course} token={token!} onSaved={load} onDeleted={() => router.push("/teach/courses")} />}
    </div>
  );
}

/* ─────────────────── Curriculum ─────────────────── */
function Curriculum({ courseId, sections, token, reload }: { courseId: string; sections: any[]; token: string; reload: () => void }) {
  const [newSection, setNewSection] = useState("");
  const [busy, setBusy] = useState(false);

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newSection.trim()) return;
    setBusy(true);
    try {
      await api.post(`/lessons/sections/${courseId}`, { title: newSection.trim(), sortOrder: sections.length }, { token });
      setNewSection("");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <p className="rounded-xl border border-line bg-soft px-4 py-3 text-sm text-muted">
          No sections yet. Add your first section below, then add lessons to it.
        </p>
      )}

      {sections.map((s) => (
        <SectionCard key={s.id} section={s} token={token} reload={reload} />
      ))}

      <form onSubmit={addSection} className="flex gap-2">
        <input value={newSection} onChange={(e) => setNewSection(e.target.value)} placeholder="New section title (e.g. Getting Started)"
          className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
        <button disabled={busy || !newSection.trim()} className="rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
          + Add section
        </button>
      </form>
    </div>
  );
}

function SectionCard({ section, token, reload }: { section: any; token: string; reload: () => void }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const lessons: any[] = section.lessons ?? [];

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api.post(`/lessons`, { sectionId: section.id, title: title.trim(), sortOrder: lessons.length, isPreview: preview }, { token });
      setTitle(""); setPreview(false); setAdding(false);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function delSection() {
    if (!confirm(`Delete section “${section.title}” and its lessons?`)) return;
    await api.del(`/lessons/sections/${section.id}`, { token });
    await reload();
  }
  async function delLesson(l: any) {
    if (!confirm(`Delete lesson “${l.title}”?`)) return;
    await api.del(`/lessons/${l.id}`, { token });
    await reload();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex items-center justify-between bg-soft px-4 py-3">
        <span className="font-bold">{section.title}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{lessons.length} lessons</span>
          <button onClick={delSection} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {lessons.map((l) => (
          <li key={l.id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            <span className="flex-1 truncate">{l.title}</span>
            {l.isPreview && <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">Preview</span>}
            {l.videoDuration ? <span className="text-xs text-muted">{formatDuration(l.videoDuration)}</span> : null}
            <button onClick={() => delLesson(l)} className="text-muted hover:text-red-600" aria-label="Delete lesson">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </li>
        ))}
      </ul>
      <div className="px-4 py-3">
        {adding ? (
          <form onSubmit={addLesson} className="space-y-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="Lesson title"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-500" />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} /> Free preview
              </label>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => setAdding(false)} className="text-sm text-muted">Cancel</button>
                <button disabled={busy || !title.trim()} className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Add lesson</button>
              </div>
            </div>
            <p className="text-xs text-muted">You can attach the video after creating the lesson (upload runs once R2 storage is enabled).</p>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="text-sm font-semibold text-brand-500 hover:underline">+ Add lesson</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── Details ─────────────────── */
function Details({ course, token, onSaved, onDeleted }: { course: any; token: string; onSaved: () => void; onDeleted: () => void }) {
  const [f, setF] = useState({
    title: course.title ?? "",
    shortDescription: course.shortDescription ?? "",
    description: course.description ?? "",
    price: String(course.price ?? ""),
    discountPrice: course.discountPrice != null ? String(course.discountPrice) : "",
    thumbnail: course.thumbnail ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const body: any = {
        title: f.title.trim(), shortDescription: f.shortDescription.trim(),
        description: f.description.trim(), price: Number(f.price) || 0,
        thumbnail: f.thumbnail.trim() || undefined,
      };
      if (f.discountPrice) body.discountPrice = Number(f.discountPrice);
      await api.patch(`/courses/${course.id}`, body, { token });
      setMsg("Saved.");
      onSaved();
    } catch (e: any) {
      setMsg(e?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  async function del() {
    if (!confirm(`Delete “${course.title}”? This cannot be undone.`)) return;
    await api.del(`/courses/${course.id}`, { token });
    onDeleted();
  }

  const cls = "w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500";
  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <label className="block"><span className="mb-1.5 block text-sm font-medium">Title</span>
        <input value={f.title} onChange={(e) => set("title", e.target.value)} className={cls} /></label>
      <label className="block"><span className="mb-1.5 block text-sm font-medium">Short description</span>
        <input value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={cls} /></label>
      <label className="block"><span className="mb-1.5 block text-sm font-medium">Description</span>
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={4} className={cls} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="mb-1.5 block text-sm font-medium">Price (XAF)</span>
          <input value={f.price} onChange={(e) => set("price", e.target.value)} inputMode="numeric" className={cls} /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium">Discount price (XAF)</span>
          <input value={f.discountPrice} onChange={(e) => set("discountPrice", e.target.value)} inputMode="numeric" className={cls} /></label>
      </div>
      <label className="block"><span className="mb-1.5 block text-sm font-medium">Thumbnail URL</span>
        <input value={f.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} className={cls} /></label>
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <div className="flex items-center justify-between">
        <button disabled={busy} className="rounded-xl bg-navy px-6 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
        <button type="button" onClick={del} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">Delete course</button>
      </div>
    </form>
  );
}
