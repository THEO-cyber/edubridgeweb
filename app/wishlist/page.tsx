"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { coursePrice, instructorName } from "@/lib/format";

export default function WishlistPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api.get("/wishlist?limit=50", { token: token! });
      setItems(pickList(d, ["wishlist", "items", "courses"]));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load your wishlist.");
    }
  }, [token]);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?next=/wishlist");
      return;
    }
    load();
  }, [loading, token, router, load]);

  async function remove(courseId: string) {
    setItems((prev) => prev?.filter((c) => c.id !== courseId) ?? prev);
    try {
      await api.del(`/wishlist/${courseId}`, { token: token! });
    } catch {
      load(); // resync on failure
    }
  }

  if (loading || (!token && !err)) {
    return <div className="container-x py-20 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold">My wishlist</h1>
      <p className="mt-1 text-muted">Courses you saved for later.</p>

      {err && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-red-600">{err}</p>}

      {items === null && !err ? (
        <p className="mt-8 text-muted">Loading…</p>
      ) : items && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-soft p-12 text-center">
          <div className="text-4xl">❤️</div>
          <p className="mt-3 text-lg font-semibold">Your wishlist is empty</p>
          <p className="mt-1 text-muted">Tap the heart on any course to save it here.</p>
          <Link href="/courses" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Explore courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((c) => {
            const price = coursePrice(c.price, c.discountPrice);
            return (
              <div key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                <Link href={`/courses/${c.slug}`} className="block">
                  <div className="aspect-[16/9] bg-brand-50">
                    {c.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <Link href={`/courses/${c.slug}`} className="line-clamp-2 font-bold text-ink hover:text-brand-600">{c.title}</Link>
                  <p className="mt-1 text-sm text-muted">{instructorName(c)}</p>
                  <div className="mt-2 font-extrabold">{price.label}</div>
                  <div className="mt-auto flex gap-2 pt-4">
                    <Link href={`/courses/${c.slug}`} className="flex-1 rounded-lg bg-navy py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                      View course
                    </Link>
                    <button onClick={() => remove(c.id)} className="rounded-lg border border-line px-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
