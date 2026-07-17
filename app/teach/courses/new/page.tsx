"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import InstructorShell from "@/components/InstructorShell";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"];

export default function NewCoursePage() {
  return (
    <InstructorShell title="New Course">
      <NewCourseForm />
    </InstructorShell>
  );
}

function NewCourseForm() {
  const { token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [f, setF] = useState({
    title: "", shortDescription: "", description: "", categoryId: "",
    price: "", discountPrice: "", level: "BEGINNER", thumbnail: "",
    requirements: "", objectives: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get("/search/categories").then((d) => setCategories(pickList(d, ["categories", "items"]))).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const toList = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.categoryId) return setErr("Please choose a category.");
    setBusy(true);
    try {
      const body: any = {
        title: f.title.trim(),
        shortDescription: f.shortDescription.trim() || undefined,
        description: f.description.trim(),
        categoryId: f.categoryId,
        price: Number(f.price) || 0,
        currency: "XAF",
        level: f.level,
        requirements: toList(f.requirements),
        objectives: toList(f.objectives),
      };
      if (f.discountPrice) body.discountPrice = Number(f.discountPrice);
      if (f.thumbnail.trim()) body.thumbnail = f.thumbnail.trim();

      const created = await api.post("/courses", body, { token: token! });
      // Straight into the editor to add the curriculum.
      router.push(created?.id ? `/teach/courses/${created.id}` : "/teach/courses");
    } catch (e: any) {
      setErr(e?.message || "Could not create the course.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <Field label="Course title" required>
        <input value={f.title} onChange={(e) => set("title", e.target.value)} required minLength={3}
          placeholder="e.g. Flutter & Dart: Build Native Apps" className={inputCls} />
      </Field>

      <Field label="Short description" hint="One line shown on the course card">
        <input value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)}
          placeholder="Build and ship real mobile apps" className={inputCls} />
      </Field>

      <Field label="Full description" required>
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)} required minLength={10}
          rows={4} placeholder="What will students learn and why does it matter?" className={inputCls} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" required>
          <select value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
            <option value="">Choose a category…</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Level" required>
          <select value={f.level} onChange={(e) => set("level", e.target.value)} className={inputCls}>
            {LEVELS.map((l) => <option key={l} value={l}>{l.replace("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase())}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (XAF)" required hint="Enter 0 for a free course">
          <input value={f.price} onChange={(e) => set("price", e.target.value)} required inputMode="numeric"
            placeholder="15000" className={inputCls} />
        </Field>
        <Field label="Discount price (XAF)" hint="Optional">
          <input value={f.discountPrice} onChange={(e) => set("discountPrice", e.target.value)} inputMode="numeric"
            placeholder="9000" className={inputCls} />
        </Field>
      </div>

      <Field label="Thumbnail URL" hint="Optional — a 16:9 image link">
        <input value={f.thumbnail} onChange={(e) => set("thumbnail", e.target.value)}
          placeholder="https://…" className={inputCls} />
      </Field>

      <Field label="What students will learn" hint="One objective per line">
        <textarea value={f.objectives} onChange={(e) => set("objectives", e.target.value)} rows={3}
          placeholder={"Build a REST API\nDeploy to production\nWrite tests"} className={inputCls} />
      </Field>

      <Field label="Requirements" hint="One per line">
        <textarea value={f.requirements} onChange={(e) => set("requirements", e.target.value)} rows={2}
          placeholder={"Basic programming knowledge\nA laptop"} className={inputCls} />
      </Field>

      {err && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{err}</p>}

      <div className="flex gap-3">
        <button disabled={busy} className="rounded-xl bg-navy px-6 py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Creating…" : "Create & add lessons"}
        </button>
        <button type="button" onClick={() => router.push("/teach/courses")} className="rounded-xl border border-line px-6 py-3 font-semibold hover:bg-soft">Cancel</button>
      </div>
      <p className="text-xs text-muted">You&apos;ll add sections and lessons next, then publish when ready.</p>
    </form>
  );
}

const inputCls = "w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500";

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink">
        {label}{required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
