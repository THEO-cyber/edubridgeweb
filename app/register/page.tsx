"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Field from "@/components/Field";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const username =
        (email.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "") +
        Math.floor(Math.random() * 1000);
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
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol" />
          {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
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
