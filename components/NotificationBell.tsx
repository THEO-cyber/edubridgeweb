"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { timeAgo } from "@/lib/format";

export default function NotificationBell() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const d = await api.get("/notifications?limit=10", { token });
      setItems(pickList(d, ["notifications", "items"]));
      setUnread(Number(d?.unreadCount ?? 0));
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    load();
    const t = setInterval(load, 60000); // refresh unread count each minute
    return () => clearInterval(t);
  }, [token, load]);

  async function markRead(n: any) {
    if (n.isRead) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await api.patch(`/notifications/${n.id}/read`, {}, { token: token! });
    } catch {
      /* best-effort */
    }
  }

  async function markAll() {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    try {
      await api.post("/notifications/mark-all-read", {}, { token: token! });
    } catch {
      /* best-effort */
    }
  }

  if (!user || !token) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-soft"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-10 cursor-default" aria-hidden onClick={() => setOpen(false)} tabIndex={-1} />
          <div className="absolute right-0 top-full z-20 mt-1 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-bold">Notifications</span>
              {unread > 0 && (
                <button onClick={markAll} className="text-xs font-semibold text-brand-500 hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">You&apos;re all caught up 🎉</p>
              ) : (
                items.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={`flex w-full gap-3 border-b border-line px-4 py-3 text-left transition hover:bg-soft ${n.isRead ? "" : "bg-brand-50/50"}`}
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-brand-500"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{n.title || "Notification"}</span>
                      {n.message && <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{n.message}</span>}
                      <span className="mt-1 block text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
            <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-line py-3 text-center text-sm font-semibold text-brand-500 hover:bg-soft">
              See all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
