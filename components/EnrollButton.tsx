"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { coursePrice } from "@/lib/format";

export default function EnrollButton({
  courseId,
  slug,
  price,
  discountPrice,
}: {
  courseId: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const p = coursePrice(price, discountPrice);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [enrolled, setEnrolled] = useState<boolean | null>(null);

  // Is the signed-in user already enrolled? (progress endpoint 403s if not)
  useEffect(() => {
    if (!token) {
      setEnrolled(false);
      return;
    }
    let cancelled = false;
    api
      .get(`/enrollments/courses/${courseId}/progress`, { token })
      .then(() => !cancelled && setEnrolled(true))
      .catch((e) => {
        if (!cancelled) setEnrolled(e instanceof ApiError && (e.status === 403 || e.status === 404) ? false : false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, courseId]);

  function requireAuth(): boolean {
    if (!user || !token) {
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return false;
    }
    return true;
  }

  async function enrollFree() {
    if (!requireAuth()) return;
    setBusy(true);
    setMsg(null);
    try {
      await api.post(`/payments/enroll-free/${courseId}`, {}, { token: token! });
      setMsg("Enrolled! Redirecting…");
      router.push("/dashboard");
    } catch (e: any) {
      setMsg(e.message || "Could not enrol.");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!requireAuth()) return;
    const digits = phone.replace(/\D/g, "");
    if (!(digits.length === 9 || (digits.startsWith("237") && digits.length === 12))) {
      setMsg("Enter a valid MoMo/Orange number (9 digits).");
      return;
    }
    setBusy(true);
    setMsg("Starting payment…");
    try {
      const res = await api.post(`/payments/create-intent`, { courseId, phoneNumber: phone }, { token: token! });
      const paymentId = res?.paymentId;
      if (!paymentId) throw new Error("Could not start payment.");
      setMsg("Approve the prompt on your phone…");
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const s = await api.get(`/payments/${paymentId}/status`, { token: token! });
        const status = String(s?.status || "").toUpperCase();
        if (status === "COMPLETED") {
          setMsg("Payment successful! Redirecting…");
          router.push("/dashboard");
          return;
        }
        if (status === "FAILED") {
          setMsg("Payment failed or was declined.");
          return;
        }
      }
      setMsg("Still processing — check My Learning shortly.");
    } catch (e: any) {
      setMsg(e.message || "Payment error.");
    } finally {
      setBusy(false);
    }
  }

  if (enrolled) {
    return (
      <Link
        href={`/learn/${slug}`}
        className="block w-full rounded-xl bg-green-600 py-3.5 text-center font-bold text-white transition hover:bg-green-700"
      >
        Go to course →
      </Link>
    );
  }

  return (
    <div>
      {p.isFree ? (
        <button
          onClick={enrollFree}
          disabled={busy}
          className="w-full rounded-xl bg-navy py-3.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Enrolling…" : "Enrol for free"}
        </button>
      ) : payOpen ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ink">MoMo / Orange Money number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="6XXXXXXXX"
            className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500"
          />
          <button
            onClick={pay}
            disabled={busy}
            className="w-full rounded-xl bg-navy py-3.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Processing…" : `Pay ${p.label}`}
          </button>
          <button onClick={() => setPayOpen(false)} className="w-full text-sm text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => (requireAuth() ? setPayOpen(true) : null)}
          className="w-full rounded-xl bg-navy py-3.5 font-bold text-white transition hover:bg-brand-700"
        >
          Buy now — {p.label}
        </button>
      )}
      {msg && <p className="mt-3 text-center text-sm text-muted">{msg}</p>}
    </div>
  );
}
