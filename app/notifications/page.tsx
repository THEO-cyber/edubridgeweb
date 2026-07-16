"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { timeAgo } from "@/lib/format";

export default function NotificationsPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api.get("/notifications?limit=50", { token: token! });
      setItems(pickList(d, ["notifications", "items"]));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load notifications.");
    }
  }, [token]);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?next=/notifications");
      return;
    }
    load();
  }, [loading, token, router, load]);

  async function markRead(n: any) {
    if (n.isRead) return;
    setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) ?? prev);
    try { await api.patch(`/notifications/${n.id}/read`, {}, { token: token! }); } catch {}
  }
  async function markAll() {
    setItems((prev) => prev?.map((x) => ({ ...x, isRead: true })) ?? prev);
    try { await api.post("/notifications/mark-all-read", {}, { token: token! }); } catch {}
  }
  async function remove(n: any) {
    setItems((prev) => prev?.filter((x) => x.id !== n.id) ?? prev);
    try { await api.del(`/notifications/${n.id}`, { token: token! }); } catch { load(); }
  }

  if (loading || (!token && !err)) {
    return <div className="container-x py-20 text-center text-muted">Loading…</div>;
  }

  const hasUnread = items?.some((n) => !n.isRead);

  return (
    <div className="container-x max-w-2xl py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Notifications</h1>
        {hasUnread && (
          <button onClick={markAll} className="text-sm font-semibold text-brand-500 hover:underline">Mark all read</button>
        )}
      </div>

      {err && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-red-600">{err}</p>}

      {items === null && !err ? (
        <p className="mt-8 text-muted">Loading…</p>
      ) : items && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-soft p-12 text-center">
          <div className="text-4xl">🔔</div>
          <p className="mt-3 text-lg font-semibold">No notifications yet</p>
          <p className="mt-1 text-muted">Updates about your courses and live classes will show up here.</p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {items?.map((n) => (
            <li key={n.id} className={`flex gap-3 px-5 py-4 ${n.isRead ? "" : "bg-brand-50/40"}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-brand-500"}`} />
              <button onClick={() => markRead(n)} className="min-w-0 flex-1 text-left">
                <div className="font-semibold text-ink">{n.title || "Notification"}</div>
                {n.message && <div className="mt-0.5 text-sm text-muted">{n.message}</div>}
                <div className="mt-1 text-xs text-muted">{timeAgo(n.createdAt)}</div>
              </button>
              <button onClick={() => remove(n)} aria-label="Delete" className="shrink-0 self-start rounded p-1 text-muted hover:bg-red-50 hover:text-red-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
