"use client";

import { useEffect, useMemo, useState } from "react";
import AccountShell from "@/components/AccountShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type Profile = Record<string, any>;

export default function AccountProfilePage() {
  const { user, token, updateUser } = useAuth();
  const isInstructor = ["INSTRUCTOR", "SUPER_ADMIN"].includes((user?.role || "").toUpperCase());

  const [loaded, setLoaded] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  // common fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  // student fields
  const [learningGoals, setLearningGoals] = useState("");
  const [interests, setInterests] = useState("");

  // instructor fields
  const [title, setTitle] = useState("");
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [website, setWebsite] = useState("");

  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.id) return;
    let alive = true;
    api
      .get(`/users/${user.id}`, { token })
      .then((p: Profile) => {
        if (!alive || !p) return;
        setFirstName(p.firstName ?? "");
        setLastName(p.lastName ?? "");
        setBio(p.bio ?? "");
        setAvatar(p.avatar ?? "");
        setEmail(p.email ?? user.email ?? "");
        setMemberSince(p.createdAt ?? null);
        const sp = p.studentProfile ?? {};
        setLearningGoals(sp.learningGoals ?? "");
        setInterests(Array.isArray(sp.interests) ? sp.interests.join(", ") : "");
        const ip = p.instructorProfile ?? {};
        setTitle(ip.title ?? "");
        setExpertise(Array.isArray(ip.expertise) ? ip.expertise.join(", ") : "");
        setExperience(ip.experience ?? "");
        setEducation(ip.education ?? "");
        setWebsite(ip.website ?? "");
        setLoaded(true);
      })
      .catch((e) => {
        // Fall back to whatever the auth context already knows.
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setEmail(user.email ?? "");
        setAvatar(user.avatar ?? "");
        setLoadErr(e?.message ?? "Couldn't load your full profile — showing what we have.");
        setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [token, user]);

  const initial = useMemo(
    () => (firstName?.[0] ?? email?.[0] ?? "U").toUpperCase(),
    [firstName, email]
  );

  const toList = (s: string) =>
    s.split(",").map((x) => x.trim()).filter(Boolean);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMsg(null);
    try {
      await api.put("/users/profile", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || undefined,
        avatar: avatar.trim() || undefined,
      }, { token });

      if (isInstructor) {
        await api.put("/users/profile/instructor", {
          title: title.trim() || undefined,
          expertise: toList(expertise),
          experience: experience.trim() || undefined,
          education: education.trim() || undefined,
          website: website.trim() || undefined,
        }, { token });
      } else {
        await api.put("/users/profile/student", {
          learningGoals: learningGoals.trim() || undefined,
          interests: toList(interests),
        }, { token });
      }

      // Reflect the new name/avatar in the header immediately.
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatar: avatar.trim() || null,
      });
      setMsg({ tone: "ok", text: "Profile saved." });
    } catch (err: any) {
      setMsg({ tone: "err", text: err?.message ?? "Couldn't save your profile. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AccountShell title="Profile">
      {!loaded ? (
        <p className="text-muted">Loading your profile…</p>
      ) : (
        <div className="space-y-6">
          {/* Identity header */}
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-card">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-50 text-xl font-bold text-navy">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">
                {[firstName, lastName].filter(Boolean).join(" ") || "Your name"}
              </p>
              <p className="truncate text-sm text-muted">{email}</p>
              <span className="mt-1 inline-block rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold capitalize text-muted">
                {(user?.role || "student").toLowerCase().replace("_", " ")}
              </span>
            </div>
          </div>

          {loadErr && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadErr}</p>}

          <form onSubmit={onSave} className="space-y-6">
            {/* Basics */}
            <Section title="Basic information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" value={firstName} onChange={setFirstName} />
                <Field label="Last name" value={lastName} onChange={setLastName} />
              </div>
              <ReadOnly label="Email" value={email} hint="Contact support to change your email." />
              <Area label="Bio" value={bio} onChange={setBio} placeholder="Tell learners a little about yourself…" />
              <Field label="Avatar URL" value={avatar} onChange={setAvatar} placeholder="https://…" />
            </Section>

            {/* Role-specific */}
            {isInstructor ? (
              <Section title="Instructor details">
                <Field label="Professional title" value={title} onChange={setTitle} placeholder="e.g. Senior Software Engineer" />
                <Field label="Areas of expertise (comma-separated)" value={expertise} onChange={setExpertise} placeholder="React, Node.js, System Design" />
                <Area label="Experience" value={experience} onChange={setExperience} placeholder="Where have you worked or taught?" />
                <Area label="Education" value={education} onChange={setEducation} placeholder="Your academic background" />
                <Field label="Website" value={website} onChange={setWebsite} placeholder="https://…" />
              </Section>
            ) : (
              <Section title="Learning preferences">
                <Area label="Learning goals" value={learningGoals} onChange={setLearningGoals} placeholder="What do you want to achieve?" />
                <Field label="Interests (comma-separated)" value={interests} onChange={setInterests} placeholder="Design, Marketing, Data Science" />
              </Section>
            )}

            {msg && (
              <p className={`rounded-lg px-4 py-3 text-sm ${msg.tone === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {msg.text}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-navy px-6 py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {memberSince && (
                <span className="text-xs text-muted">
                  Member since {new Date(memberSince).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </AccountShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
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

function ReadOnly({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        value={value}
        readOnly
        className="w-full cursor-not-allowed rounded-xl border border-line bg-soft px-4 py-3 text-muted outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
