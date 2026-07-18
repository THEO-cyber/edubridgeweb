"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

// Mirrors the API's password policy so an applicant sees what is required while
// typing, rather than discovering it from a rejection.
const rules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "A capital letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol (!@#…)", test: (p: string) => /[\W_]/.test(p) },
];

export default function InstructorApplyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [motivation, setMotivation] = useState("");
  const [subjects, setSubjects] = useState("");
  const [experience, setExperience] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Already signed in? They have an account — send them to the authenticated
  // apply flow (or their dashboard) instead of creating a second one.
  useEffect(() => {
    if (loading || !user) return;
    const role = (user.role || "").toUpperCase();
    router.replace(role === "INSTRUCTOR" || role === "SUPER_ADMIN" ? "/teach/dashboard" : "/teach");
  }, [loading, user, router]);

  const passwordOk = rules.every((r) => r.test(password));
  const matches = password === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const subjectExpertise = subjects.split(",").map((s) => s.trim()).filter(Boolean);
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErr("Please fill in your name and email.");
      return;
    }
    if (!passwordOk) {
      setErr("Please choose a stronger password.");
      return;
    }
    if (!matches) {
      setErr("Both passwords must be the same.");
      return;
    }
    if (!motivation.trim() || subjectExpertise.length === 0) {
      setErr("Please share your motivation and at least one subject you can teach.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/applications/instructor/apply", {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        motivation: motivation.trim(),
        subjectExpertise,
        teachingExperience: experience.trim() || undefined,
        sampleContentUrl: sampleUrl.trim() || undefined,
        linkedinUrl: linkedin.trim() || undefined,
      });
      setDone(true);
    } catch (e: any) {
      setErr(e.message || "Could not submit your application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="container-x py-12 lg:py-16">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Teach on EduBridge</span>
            <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight sm:text-4xl">Apply to teach</h1>
            <p className="mt-3 max-w-xl text-white/80">
              Tell us about yourself and what you&apos;d teach. Every instructor is vetted, so we review each
              application by hand — <strong>your account is created only once you&apos;re approved</strong>. You&apos;ll then
              sign in with the email and password you set here and start earning in XAF via MoMo &amp; Orange Money.
            </p>
          </div>
        </div>
      </section>

      <div className="container-x flex justify-center py-12">
        <div className="w-full max-w-xl">
          {done ? (
            <div className="rounded-2xl border border-line bg-white p-8 shadow-card text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-50 text-3xl">✓</div>
              <h2 className="mt-4 text-2xl font-extrabold">Application submitted</h2>
              <p className="mt-2 text-muted">
                Thanks for applying! Our team reviews every application to keep quality high. We&apos;ll email
                <strong> {email}</strong> once a decision is made. If approved, just log in with the password you set.
              </p>
              <Link href="/" className="mt-6 inline-block rounded-xl bg-navy px-6 py-3 font-semibold text-white hover:bg-brand-700">
                Back to home
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-8 shadow-card">
              <h2 className="text-2xl font-extrabold">Instructor application</h2>
              <p className="mt-1 text-muted">This is the only step — no separate sign-up needed.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Your account</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Ada" />
                      <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Lovelace" />
                    </div>
                    <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                    <div>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-ink">Password</span>
                        <div className="relative">
                          <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            className="w-full rounded-xl border border-line px-4 py-3 pr-16 outline-none focus:border-brand-500"
                          />
                          <button type="button" onClick={() => setShowPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted hover:text-ink">
                            {showPw ? "Hide" : "Show"}
                          </button>
                        </div>
                      </label>
                      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                        {rules.map((r) => {
                          const ok = r.test(password);
                          return (
                            <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-muted"}`}>
                              <span className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[9px] ${ok ? "bg-green-600 text-white" : "bg-line text-transparent"}`}>✓</span>
                              {r.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div>
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-ink">Confirm password</span>
                        <input
                          type={showPw ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Type it again"
                          className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500"
                        />
                      </label>
                      {confirm.length > 0 && !matches && (
                        <span className="mt-1 block text-xs text-red-600">Passwords don&apos;t match yet.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">About your teaching</p>
                  <div className="space-y-4">
                    <Area label="Why do you want to teach on EduBridge?" value={motivation} onChange={setMotivation} placeholder="Share your motivation…" />
                    <Field label="Subjects you can teach (comma-separated)" value={subjects} onChange={setSubjects} placeholder="e.g. React, Node.js, System Design" />
                    <Area label="Teaching or work experience (optional)" value={experience} onChange={setExperience} placeholder="Where have you worked or taught?" />
                    <Field label="Sample lesson / portfolio URL (optional)" value={sampleUrl} onChange={setSampleUrl} placeholder="https://…" />
                    <Field label="LinkedIn URL (optional)" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/…" />
                  </div>
                </div>

                {err && <p className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

                <button
                  disabled={busy || !passwordOk || !matches}
                  className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Submit application"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                Already have an account?{" "}
                <Link href="/login?next=/teach" className="font-semibold text-brand-500 hover:underline">Log in to apply</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500"
      />
    </label>
  );
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500"
      />
    </label>
  );
}
