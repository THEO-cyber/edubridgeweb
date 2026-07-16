"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";

// Heart / save toggle. `variant="icon"` for cards, `variant="button"` for detail.
export default function WishlistButton({
  courseId,
  variant = "icon",
  initialSaved,
}: {
  courseId: string;
  variant?: "icon" | "button";
  initialSaved?: boolean;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<boolean | null>(initialSaved ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialSaved !== undefined) return;
    if (!token) {
      setSaved(false);
      return;
    }
    let cancelled = false;
    api
      .get(`/wishlist/${courseId}/check`, { token })
      .then((d) => !cancelled && setSaved(!!d?.inWishlist))
      .catch(() => !cancelled && setSaved(false));
    return () => {
      cancelled = true;
    };
  }, [token, courseId, initialSaved]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      if (next) await api.post(`/wishlist/${courseId}`, {}, { token });
      else await api.del(`/wishlist/${courseId}`, { token });
    } catch (err) {
      // Already-saved (409) is fine; otherwise revert.
      if (!(err instanceof ApiError && err.status === 409)) setSaved(!next);
    } finally {
      setBusy(false);
    }
  }

  const filled = !!saved;
  const Heart = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );

  if (variant === "button") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={filled}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition disabled:opacity-60 ${
          filled ? "border-red-200 bg-red-50 text-red-600" : "border-line text-ink hover:bg-soft"
        }`}
      >
        {Heart}
        {filled ? "Saved to wishlist" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={filled ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={filled}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-card backdrop-blur transition hover:scale-105 ${
        filled ? "text-red-500" : "text-ink"
      }`}
    >
      {Heart}
    </button>
  );
}
