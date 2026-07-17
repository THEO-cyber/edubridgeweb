"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type AppStatus = "pending" | "approved" | "rejected" | null;

export default function TeachPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<AppStatus>(undefined as unknown as AppStatus);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Approved instructors don't apply — they teach. Send them to their dashboard.
  useEffect(() => {
    if (loading) return;
    const role = (user?.role || "").toUpperCase();
    if (role === "INSTRUCTOR" || role === "SUPER_ADMIN") router.replace("/teach/dashboard");
  }, [loading, user, router]);

  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [subjects, setSubjects] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !token) return;
    api
      .get("/applications/instructor/mine", { token })
      .then((d) => {
        setStatus((d?.status as AppStatus) ?? null);
        setRejectionReason(d?.rejectionReason ?? null);
      })
      .catch(() => setStatus(null));
  }, [loading, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const subjectExpertise = subjects.split(",").map((s) => s.trim()).filter(Boolean);
    if (!motivation.trim() || subjectExpertise.length === 0) {
      setErr("Please share your motivation and at least one subject you can teach.");
      return;
    }
    setBusy(true);
    try {
      await api.post(
        "/applications/instructor",
        { motivation, teachingExperience: experience, subjectExpertise, sampleContentUrl: sampleUrl, linkedinUrl: linkedin },
        { token: token! }
      );
      setStatus("pending");
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
        <div className="container-x py-16 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Teach on EduBridge</span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
              Share your expertise. Reach learners across Africa.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Create courses, teach live sessions, and earn in XAF with payouts to MoMo &amp; Orange Money.
              Every instructor is vetted to keep quality high.
            </p>
          </div>
          <div className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
            <Perk icon="🎥" title="Build once" body="Publish on-demand courses students can take anytime." />
            <Perk icon="💸" title="Earn locally" body="Payouts in XAF via mobile money — no bank needed." />
            <Perk icon="🌍" title="Grow your reach" body="Teach thousands on web, Android and iOS." />
          </div>
        </div>
      </section>

      <div className="container-x max-w-2xl py-14">
        {/* Not signed in */}
        {!loading && !user && (
          <Panel>
            <h2 className="text-2xl font-bold">Ready to teach?</h2>
            <p className="mt-2 text-muted">Create a free account or log in, then complete your instructor application here.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/register" className="rounded-xl bg-navy px-6 py-3 font-semibold text-white hover:bg-brand-700">Create account</Link>
              <Link href="/login?next=/teach" className="rounded-xl border border-line px-6 py-3 font-semibold hover:bg-soft">Log in</Link>
            </div>
          </Panel>
        )}

        {/* Already an instructor */}
        {user && user.role === "INSTRUCTOR" && (
          <Panel>
            <StatusBadge tone="green">You&apos;re an instructor 🎉</StatusBadge>
            <p className="mt-3 text-muted">You already have teaching access. Manage your courses from the instructor tools.</p>
          </Panel>
        )}

        {/* Application states */}
        {user && user.role !== "INSTRUCTOR" && status === "pending" && (
          <Panel>
            <StatusBadge tone="amber">Application under review</StatusBadge>
            <p className="mt-3 text-muted">Thanks for applying! Our team reviews every application to keep course quality high. You&apos;ll be notified once a decision is made.</p>
            <Link href="/dashboard" className="mt-6 inline-block rounded-xl border border-line px-5 py-2.5 text-sm font-semibold hover:bg-soft">Back to My Learning</Link>
          </Panel>
        )}

        {user && user.role !== "INSTRUCTOR" && status === "approved" && (
          <Panel>
            <StatusBadge tone="green">Approved!</StatusBadge>
            <p className="mt-3 text-muted">Your instructor application was approved. Log out and back in to refresh your access, then start creating courses.</p>
          </Panel>
        )}

        {/* Form: no application yet, or rejected (resubmit allowed) */}
        {user && user.role !== "INSTRUCTOR" && (status === null || status === "rejected") && (
          <Panel>
            {status === "rejected" && (
              <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                Your previous application wasn&apos;t approved{rejectionReason ? `: ${rejectionReason}` : "."} You&apos;re welcome to update and resubmit.
              </div>
            )}
            <h2 className="text-2xl font-bold">Instructor application</h2>
            <p className="mt-1 text-muted">Tell us about you. This helps us keep EduBridge high-quality.</p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Area label="Why do you want to teach on EduBridge?" value={motivation} onChange={setMotivation} required placeholder="Share your motivation…" />
              <Text label="Subjects you can teach (comma-separated)" value={subjects} onChange={setSubjects} required placeholder="e.g. React, Node.js, System Design" />
              <Area label="Teaching or professional experience (optional)" value={experience} onChange={setExperience} placeholder="Where have you worked or taught?" />
              <Text label="Sample lesson / portfolio URL (optional)" value={sampleUrl} onChange={setSampleUrl} placeholder="https://…" />
              <Text label="LinkedIn URL (optional)" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/…" />
              {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
                {busy ? "Submitting…" : "Submit application"}
              </button>
            </form>
          </Panel>
        )}
      </div>
    </>
  );
}

function Perk({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-white/75">{body}</p>
    </div>
  );
}
function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-white p-8 shadow-card">{children}</div>;
}
function StatusBadge({ tone, children }: { tone: "green" | "amber"; children: React.ReactNode }) {
  const cls = tone === "green" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800";
  return <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold ${cls}`}>{children}</span>;
}
function Text({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500" />
    </label>
  );
}
function Area({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} rows={4}
        className="w-full resize-y rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500" />
    </label>
  );
}
