"use client";

import { useCallback, useEffect, useState } from "react";
import { api, pickList } from "@/lib/api";
import { timeAgo } from "@/lib/format";

function authorName(a: any): string {
  if (!a) return "Student";
  return `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || a.username || "Student";
}

export default function CourseDiscussions({ courseId, token, lessonId }: { courseId: string; token: string; lessonId?: string }) {
  const [threads, setThreads] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "new" | "thread">("list");
  const [active, setActive] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // new thread form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // reply
  const [reply, setReply] = useState("");

  const loadThreads = useCallback(async () => {
    try {
      const d = await api.get(`/discussions/threads/${courseId}?limit=30`, { token });
      setThreads(pickList(d, ["threads", "items"]));
    } catch {
      setThreads([]);
    }
  }, [courseId, token]);

  useEffect(() => {
    if (view === "list") loadThreads();
  }, [view, loadThreads]);

  async function openThread(id: string) {
    setErr(null);
    try {
      const d = await api.get(`/discussions/thread/${id}`, { token });
      setActive(d);
      setView("thread");
    } catch (e: any) {
      setErr(e?.message || "Could not open this thread.");
    }
  }

  async function createThread(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 5 || body.trim().length < 10) {
      setErr("Give your question a title (5+ chars) and some detail (10+ chars).");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const created = await api.post(`/discussions/threads`, { courseId, title: title.trim(), body: body.trim(), ...(lessonId ? { lessonId } : {}) }, { token });
      setTitle("");
      setBody("");
      if (created?.id) await openThread(created.id);
      else setView("list");
    } catch (e: any) {
      setErr(e?.message || "Could not post your question.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (reply.trim().length < 5 || !active) return;
    setBusy(true);
    try {
      await api.post(`/discussions/thread/${active.id}/reply`, { body: reply.trim() }, { token });
      setReply("");
      await openThread(active.id);
    } catch (e: any) {
      setErr(e?.message || "Could not post your reply.");
    } finally {
      setBusy(false);
    }
  }

  // ── New-question form ──
  if (view === "new") {
    return (
      <div>
        <button onClick={() => setView("list")} className="mb-3 text-sm font-semibold text-brand-500 hover:underline">← All questions</button>
        <form onSubmit={createThread} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your question in one line" className="w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add details so others can help…" rows={4} className="w-full resize-y rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button disabled={busy} className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Posting…" : "Post question"}
          </button>
        </form>
      </div>
    );
  }

  // ── Thread detail ──
  if (view === "thread" && active) {
    const replies: any[] = active.replies ?? [];
    return (
      <div>
        <button onClick={() => setView("list")} className="mb-3 text-sm font-semibold text-brand-500 hover:underline">← All questions</button>
        <h3 className="text-lg font-bold">{active.title}</h3>
        <div className="mt-1 text-xs text-muted">{authorName(active.author)} · {timeAgo(active.createdAt)}</div>
        {active.body && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">{active.body}</p>}

        <div className="mt-6 border-t border-line pt-4">
          <div className="text-sm font-semibold text-ink">{replies.length} {replies.length === 1 ? "reply" : "replies"}</div>
          <div className="mt-3 space-y-4">
            {replies.map((r) => (
              <div key={r.id} className={`rounded-xl border p-3 ${r.isAnswer ? "border-green-200 bg-green-50" : "border-line bg-white"}`}>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-[10px] font-semibold text-navy">{authorName(r.author)[0]?.toUpperCase()}</span>
                  <span className="font-semibold text-ink">{authorName(r.author)}</span>
                  {r.author?.role === "INSTRUCTOR" && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">Instructor</span>}
                  {r.isAnswer && <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">✓ Answer</span>}
                  <span>· {timeAgo(r.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ink">{r.body}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendReply} className="mt-4 flex gap-2">
            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <button disabled={busy || reply.trim().length < 5} className="shrink-0 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">Reply</button>
          </form>
          {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        </div>
      </div>
    );
  }

  // ── List ──
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Questions &amp; answers</h3>
        <button onClick={() => { setErr(null); setView("new"); }} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">Ask a question</button>
      </div>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      <div className="mt-4 space-y-2">
        {threads.length === 0 ? (
          <p className="text-sm text-muted">No questions yet. Be the first to ask — the instructor and other students can help.</p>
        ) : (
          threads.map((t) => (
            <button key={t.id} onClick={() => openThread(t.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 text-left transition hover:border-brand-500 hover:shadow-card">
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{t.title}</div>
                <div className="mt-0.5 text-xs text-muted">{authorName(t.author)} · {timeAgo(t.createdAt)}</div>
              </div>
              <span className="shrink-0 rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-muted">{t.replyCount ?? 0} 💬</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
