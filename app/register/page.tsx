"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Field from "@/components/Field";

// Mirrors the API's password policy so a learner sees what is required while
// typing, rather than discovering it from a rejection.
const rules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "A capital letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol (!@#…)", test: (p: string) => /[\W_]/.test(p) },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const passwordOk = rules.every((r) => r.test(password));
  const confirmTouched = confirm.length > 0;
  const matches = password === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // Catch it here rather than sending a request that cannot succeed.
    if (!matches) {
      setErr("Both passwords must be the same.");
      return;
    }

    setBusy(true);
    try {
      // The API requires 3+ characters, and a short local-part like "a@x.com"
      // could otherwise produce a 2-character username and fail validation.
      const base = (email.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "") || "user";
      const username = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
      await register({ firstName, lastName, email, password, username });
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e.message || "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-x flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-card">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="mt-1 text-muted">Join free and start learning today.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" type="text" value={firstName} onChange={setFirstName} placeholder="Ada" />
            <Field label="Last name" type="text" value={lastName} onChange={setLastName} placeholder="Lovelace" />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a password" />

          {/* Show the rules as they are met, instead of only failing afterwards. */}
          <ul className="-mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
            {rules.map((r) => {
              const ok = r.test(password);
              return (
                <li
                  key={r.label}
                  className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-muted"}`}
                >
                  <span className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[9px] ${ok ? "bg-green-600 text-white" : "bg-line text-transparent"}`}>✓</span>
                  {r.label}
                </li>
              );
            })}
          </ul>

          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Type it again"
          />
          {confirmTouched && (
            <p
              className={`-mt-1 flex items-center gap-1.5 text-xs ${
                matches ? "text-green-600" : "text-red-600"
              }`}
            >
              <span
                className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[9px] text-white ${
                  matches ? "bg-green-600" : "bg-red-500"
                }`}
              >
                {matches ? "✓" : "!"}
              </span>
              {matches ? "Passwords match" : "Passwords don't match yet"}
            </p>
          )}

          {err && (
            <p className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>
          )}
          <button
            disabled={busy || !passwordOk || !matches}
            className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
          <p className="text-center text-xs text-muted">
            Want to teach?{" "}
            <Link href="/teach" className="font-semibold text-brand-500 hover:underline">Apply as an instructor</Link>.
          </p>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-500 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
