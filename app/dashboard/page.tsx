"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold shadow-card transition hover:border-brand-500 hover:shadow-hover">
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?next=/dashboard");
      return;
    }
    api
      .get("/enrollments", { token })
      .then((d) => setItems(pickList(d, ["enrollments", "items"])))
      .catch((e) => setErr(e.message || "Could not load your courses."));
  }, [loading, token, router]);

  if (loading || (!token && !err)) {
    return <div className="container-x py-20 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold">
        My Learning{user?.firstName ? `, ${user.firstName}` : ""}
      </h1>
      <p className="mt-1 text-muted">Pick up where you left off.</p>

      <Link href="/live" className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-gradient-to-r from-navy to-brand-600 p-5 text-white transition hover:shadow-hover">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 text-xl">🔴</span>
          <div>
            <div className="font-bold">Live classes</div>
            <div className="text-sm text-white/80">Join real-time sessions with instructors</div>
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold">Browse →</span>
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <QuickLink href="/wishlist" icon="❤️" label="Wishlist" />
        <QuickLink href="/certificates" icon="🎓" label="Certificates" />
        <QuickLink href="/notifications" icon="🔔" label="Notifications" />
      </div>

      {err && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-red-600">{err}</p>}

      {items === null && !err ? (
        <p className="mt-8 text-muted">Loading your courses…</p>
      ) : items && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-soft p-12 text-center">
          <p className="text-lg font-semibold">You haven&apos;t enrolled in any courses yet</p>
          <p className="mt-1 text-muted">Browse the catalogue and start learning today.</p>
          <Link href="/courses" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Explore courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((e: any) => {
            const c = e.course || e;
            const pct = Math.round(Number(e.progressPercentage ?? e.progress ?? 0));
            return (
              <Link key={e.id || c.id} href={c.slug ? `/learn/${c.slug}` : "/dashboard"}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:shadow-hover">
                <div className="aspect-[16/9] bg-brand-50">
                  {c.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-bold">{c.title || "Course"}</h3>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">{pct}% complete</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
