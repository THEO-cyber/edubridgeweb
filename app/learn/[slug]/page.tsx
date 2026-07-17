"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, getCourseBySlug, ApiError } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import LessonNotes from "@/components/LessonNotes";
import CourseDiscussions from "@/components/CourseDiscussions";
import LessonVideo from "@/components/LessonVideo";
import OfflineButton from "@/components/OfflineButton";

type Lesson = {
  id: string;
  title: string;
  description?: string;
  videoDuration?: number;
  isPreview?: boolean;
  sectionTitle: string;
  isCompleted: boolean;
};

export default function ClassroomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"notes" | "qa">("notes");

  // Load course structure + enrollment progress
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace(`/login?next=/learn/${slug}`);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const course = await getCourseBySlug(slug);
        if (!course) {
          if (!cancelled) {
            setErrMsg("Course not found.");
            setState("error");
          }
          return;
        }
        setCourseTitle(course.title);
        setCourseId(course.id);

        // Enrollment gate: progress endpoint 403s if the user isn't enrolled.
        const completed = new Set<string>();
        try {
          const prog = await api.get(`/enrollments/courses/${course.id}/progress`, { token });
          for (const s of prog?.progressBySection ?? []) {
            for (const l of s.lessons ?? []) if (l.isCompleted) completed.add(l.id);
          }
        } catch (e) {
          if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
            router.replace(`/courses/${slug}`);
            return;
          }
          throw e;
        }

        const flat: Lesson[] = [];
        for (const s of course.sections ?? []) {
          for (const l of s.lessons ?? []) {
            flat.push({
              id: l.id,
              title: l.title,
              description: l.description,
              videoDuration: l.videoDuration,
              isPreview: l.isPreview,
              sectionTitle: s.title,
              isCompleted: completed.has(l.id),
            });
          }
        }
        if (cancelled) return;
        if (flat.length === 0) {
          setErrMsg("This course has no lessons yet.");
          setState("error");
          return;
        }
        setLessons(flat);
        const firstUndone = flat.find((l) => !l.isCompleted) ?? flat[0];
        setCurrentId(firstUndone.id);
        setState("ready");
      } catch (e) {
        if (cancelled) return;
        setErrMsg(e instanceof Error ? e.message : "Could not load this course.");
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, token, slug, router]);

  const current = useMemo(() => lessons.find((l) => l.id === currentId) ?? null, [lessons, currentId]);
  const currentIndex = useMemo(() => lessons.findIndex((l) => l.id === currentId), [lessons, currentId]);
  const doneCount = lessons.filter((l) => l.isCompleted).length;
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  const markComplete = useCallback(
    async (lessonId: string, done: boolean) => {
      if (!token) return;
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, isCompleted: done } : l)));
      try {
        const l = lessons.find((x) => x.id === lessonId);
        await api.post(
          `/enrollments/lessons/${lessonId}/progress`,
          { watchTime: l?.videoDuration ?? 0, isCompleted: done },
          { token }
        );
      } catch {
        // revert on failure
        setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, isCompleted: !done } : l)));
      }
    },
    [token, lessons]
  );

  function goto(delta: number) {
    const next = lessons[currentIndex + delta];
    if (next) {
      setCurrentId(next.id);
      setSidebarOpen(false);
    }
  }

  if (state === "loading") {
    return <div className="grid min-h-[60vh] place-items-center text-muted">Loading your classroom…</div>;
  }
  if (state === "error") {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="text-lg font-semibold">{errMsg}</p>
          <Link href="/dashboard" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Back to My Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2 text-sm">
          <Link href="/dashboard" className="text-muted hover:text-ink">← My Learning</Link>
          <span className="text-line">/</span>
          <span className="truncate font-medium text-ink">{courseTitle}</span>
        </div>
        <LessonVideo key={currentId} lessonId={currentId!} token={token!} title={current?.title ?? ""} />

        {/* Lesson meta + controls */}
        <div className="container-x w-full py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{current?.sectionTitle}</p>
              <h1 className="mt-1 truncate text-xl font-bold">{current?.title}</h1>
            </div>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-medium lg:hidden"
            >
              {sidebarOpen ? "Hide" : "Contents"}
            </button>
          </div>

          {current?.description && (
            <p className="mt-4 whitespace-pre-line leading-relaxed text-muted">{current.description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => current && markComplete(current.id, !current.isCompleted)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                current?.isCompleted
                  ? "border border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-navy text-white hover:bg-brand-700"
              }`}
            >
              {current?.isCompleted ? "✓ Completed" : "Mark as complete"}
            </button>
            {current && courseId && (
              <OfflineButton
                key={`off-${current.id}`}
                lessonId={current.id}
                lessonTitle={current.title}
                courseId={courseId}
                courseTitle={courseTitle}
                courseSlug={slug}
                token={token!}
              />
            )}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => goto(-1)}
                disabled={currentIndex <= 0}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                onClick={() => goto(1)}
                disabled={currentIndex >= lessons.length - 1}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Notes & Q&A */}
          {courseId && (
            <div className="mt-10 border-t border-line pt-6">
              <div className="mb-5 flex gap-2">
                {(["notes", "qa"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      tab === t ? "bg-navy text-white" : "text-muted hover:bg-soft"
                    }`}
                  >
                    {t === "notes" ? "My notes" : "Q&A"}
                  </button>
                ))}
              </div>
              {tab === "notes"
                ? currentId && <LessonNotes lessonId={currentId} token={token!} />
                : <CourseDiscussions courseId={courseId} token={token!} lessonId={currentId ?? undefined} />}
            </div>
          )}
        </div>
      </div>

      {/* Curriculum sidebar */}
      <aside
        className={`w-full shrink-0 border-line bg-white lg:w-[360px] lg:border-l ${
          sidebarOpen ? "block" : "hidden lg:block"
        }`}
      >
        <div className="border-b border-line p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Course content</h2>
            <span className="text-sm text-muted">{pct}% complete</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {doneCount} of {lessons.length} lessons · <Link href="/dashboard" className="text-brand-500 hover:underline">My Learning</Link>
          </p>
        </div>

        <Curriculum lessons={lessons} currentId={currentId} onSelect={(id) => { setCurrentId(id); setSidebarOpen(false); }} />
      </aside>
    </div>
  );
}

/* ── Curriculum list grouped by section ── */
function Curriculum({
  lessons,
  currentId,
  onSelect,
}: {
  lessons: Lesson[];
  currentId: string | null;
  onSelect: (id: string) => void;
}) {
  // group consecutive lessons by sectionTitle
  const groups: { title: string; items: Lesson[] }[] = [];
  for (const l of lessons) {
    const last = groups[groups.length - 1];
    if (last && last.title === l.sectionTitle) last.items.push(l);
    else groups.push({ title: l.sectionTitle, items: [l] });
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {groups.map((g, gi) => (
        <details key={gi} open className="border-b border-line">
          <summary className="cursor-pointer bg-soft px-4 py-3 text-sm font-semibold marker:content-none">
            {g.title}
          </summary>
          <ul>
            {g.items.map((l) => {
              const active = l.id === currentId;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => onSelect(l.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition ${
                      active ? "bg-brand-50" : "hover:bg-soft"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                        l.isCompleted ? "border-green-600 bg-green-600 text-white" : "border-line text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block ${active ? "font-semibold text-navy" : "text-ink"}`}>{l.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        {formatDuration(l.videoDuration) || "—"}
                        {l.isPreview && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-600">Preview</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}
