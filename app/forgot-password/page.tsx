"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import Field from "@/components/Field";

type Step = "email" | "otp" | "password" | "done";

const steps: { key: Step; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "otp", label: "Verify code" },
  { key: "password", label: "New password" },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setStep("otp");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const data = await api.post("/auth/verify-reset-otp", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      const token = data?.resetToken || "";
      if (!token) throw new Error("Verification failed: no token received.");
      setResetToken(token);
      setStep("password");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword: password,
      });
      setStep("done");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  }

  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="container-x flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-card">
        {step !== "done" && (
          <div className="mb-6 flex items-center gap-2">
            {steps.map((s, i) => {
              const done = i < activeIndex;
              const active = i === activeIndex;
              return (
                <div key={s.key} className="flex flex-1 items-center gap-2">
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-green-600 text-white"
                        : active
                        ? "bg-navy text-white"
                        : "bg-soft text-muted"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded ${done ? "bg-green-600" : "bg-line"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === "email" && (
          <>
            <h1 className="text-2xl font-extrabold">Forgot your password?</h1>
            <p className="mt-1 text-muted">
              Enter your account email and we&apos;ll send a 6-digit code to reset your password.
            </p>
            <form onSubmit={requestCode} className="mt-6 space-y-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
                {busy ? "Sending…" : "Send code"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-extrabold">Enter the code</h1>
            <p className="mt-1 text-muted">A 6-digit code was sent to {email}.</p>
            <form onSubmit={verifyCode} className="mt-6 space-y-4">
              <Field
                label="6-digit code"
                type="text"
                value={code}
                onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
              />
              {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
              <button disabled={busy || code.length !== 6} className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
                {busy ? "Verifying…" : "Continue"}
              </button>
              <p className="text-center text-sm text-muted">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={(e) => requestCode(e as unknown as React.FormEvent)}
                  className="font-semibold text-brand-500 hover:underline"
                >
                  Resend code
                </button>
              </p>
            </form>
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="text-2xl font-extrabold">Create new password</h1>
            <p className="mt-1 text-muted">Your code was accepted. Choose a strong password.</p>
            <form onSubmit={resetPassword} className="mt-6 space-y-4">
              <Field label="New password" type="password" value={password} onChange={setPassword} placeholder="Min 8 characters" />
              <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Re-enter your new password" />
              {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
                {busy ? "Resetting…" : "Reset password"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
              <span className="text-3xl text-green-600">✓</span>
            </div>
            <h1 className="mt-5 text-2xl font-extrabold">Password reset</h1>
            <p className="mt-1 text-muted">Your password has been updated. You can now log in.</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700"
            >
              Go to login
            </button>
          </div>
        )}

        {step !== "done" && (
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="font-semibold text-brand-500 hover:underline">Back to login</Link>
          </p>
        )}
      </div>
    </div>
  );
}
