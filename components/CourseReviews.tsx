"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { timeAgo } from "@/lib/format";

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  const interactive = !!onChange;
  return (
    <div className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <svg className={`h-5 w-5 ${n <= value ? "text-amber-500" : "text-line"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 15l-5.9 3.1 1.1-6.6L.5 6.9l6.6-1L10 0l2.9 5.9 6.6 1-4.7 4.6 1.1 6.6z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function CourseReviews({ courseId }: { courseId: string }) {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [mine, setMine] = useState<any>(null);

  // form
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api.get(`/reviews/course/${courseId}?limit=20`);
      const list = pickList(d, ["reviews", "items"]);
      setReviews(list);
      setTotal(Number(d?.total ?? list.length));
      setAvg(Number(d?.avgRating ?? d?.averageRating ?? 0));
    } catch {
      /* ignore */
    }
    if (token) {
      try {
        const m = await api.get(`/reviews/my/${courseId}`, { token });
        if (m && (m.id || m.rating)) {
          setMine(m);
          setRating(m.rating ?? 5);
          setTitle(m.title ?? "");
          setContent(m.content ?? "");
        }
      } catch {
        /* no existing review */
      }
    }
  }, [courseId, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mine?.id) {
        await api.patch(`/reviews/${mine.id}`, { rating, title, content }, { token: token! });
        setMsg("Your review was updated.");
      } else {
        await api.post(`/reviews`, { courseId, rating, title, content }, { token: token! });
        setMsg("Thanks for your review!");
      }
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="reviews">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">Student reviews</h2>
        {total > 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-muted">
            <Stars value={Math.round(avg)} /> {avg.toFixed(1)} · {total} review{total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Write / edit (logged-in only) */}
      {user && token && (
        <form onSubmit={submit} className="mt-4 rounded-2xl border border-line bg-soft p-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink">{mine ? "Update your review" : "Rate this course"}</span>
            <Stars value={rating} onChange={setRating} />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="mt-3 w-full rounded-xl border border-line px-4 py-2.5 outline-none focus:border-brand-500"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share what you thought of this course…"
            rows={3}
            className="mt-3 w-full resize-y rounded-xl border border-line px-4 py-2.5 outline-none focus:border-brand-500"
          />
          <div className="mt-3 flex items-center gap-3">
            <button disabled={busy} className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
              {busy ? "Submitting…" : mine ? "Update review" : "Post review"}
            </button>
            {msg && <span className="text-sm text-muted">{msg}</span>}
          </div>
        </form>
      )}

      {/* List */}
      <div className="mt-6 space-y-5">
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet — be the first to review this course.</p>
        ) : (
          reviews.map((r) => {
            const name = `${r.user?.firstName ?? ""} ${r.user?.lastName ?? ""}`.trim() || r.user?.username || "Student";
            return (
              <div key={r.id} className="border-b border-line pb-5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-navy">
                    {name[0]?.toUpperCase()}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink">{name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Stars value={r.rating} /> {timeAgo(r.createdAt)}
                    </div>
                  </div>
                </div>
                {r.title && <p className="mt-2 font-semibold text-ink">{r.title}</p>}
                {r.content && <p className="mt-1 text-sm leading-relaxed text-muted">{r.content}</p>}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
