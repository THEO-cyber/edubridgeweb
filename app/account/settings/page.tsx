"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AccountShell from "@/components/AccountShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AccountSettingsPage() {
  const { user, token, logout } = useAuth();
  const isInstructor = ["INSTRUCTOR", "SUPER_ADMIN"].includes((user?.role || "").toUpperCase());

  return (
    <AccountShell title="Settings">
      <div className="space-y-6">
        <ChangePassword token={token} />

        <LinkSection
          title="Notifications"
          links={[
            { href: "/notifications", label: "Notifications", icon: "🔔", desc: "See your latest activity and alerts" },
          ]}
        />

        {isInstructor ? (
          <LinkSection
            title="Teaching"
            links={[
              { href: "/teach/dashboard", label: "Instructor dashboard", icon: "📊", desc: "Manage your teaching space" },
              { href: "/teach/earnings", label: "Earnings", icon: "💰", desc: "Payouts and revenue in FCFA" },
              { href: "/teach/live", label: "Live classes", icon: "🔴", desc: "Schedule and run live sessions" },
            ]}
          />
        ) : (
          <LinkSection
            title="Learning"
            links={[
              { href: "/dashboard", label: "My Learning", icon: "📚", desc: "Courses and your progress" },
              { href: "/certificates", label: "Certificates", icon: "🎓", desc: "Certificates you've earned" },
              { href: "/wishlist", label: "Wishlist", icon: "❤️", desc: "Courses you've saved for later" },
            ]}
          />
        )}

        <LinkSection
          title="About EduBridge"
          links={[
            { href: "/about", label: "About EduBridge", icon: "ℹ️", desc: "Our mission and story" },
            { href: "/privacy", label: "Privacy Policy", icon: "🔒", desc: "How we handle your data" },
            { href: "/terms", label: "Terms of Service", icon: "📄", desc: "The rules of using EduBridge" },
            { href: "/contact", label: "Contact us", icon: "✉️", desc: "Get help from our team" },
          ]}
        />

        <DangerZone token={token} onDeleted={logout} />
      </div>
    </AccountShell>
  );
}

// ── Change password ─────────────────────────────────────────────────────────

const PW_RULES: { test: (v: string) => boolean; label: string }[] = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v) => /\d/.test(v), label: "One number" },
  { test: (v) => /[\W_]/.test(v), label: "One symbol" },
];

function ChangePassword({ token }: { token: string | null }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const allRulesPass = PW_RULES.every((r) => r.test(next));
  const matches = next.length > 0 && next === confirm;
  const canSubmit = !!current && allRulesPass && matches && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !canSubmit) return;
    setBusy(true);
    setMsg(null);
    try {
      await api.post("/auth/change-password", { currentPassword: current, newPassword: next }, { token });
      setMsg({ tone: "ok", text: "Password changed." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: any) {
      setMsg({ tone: "err", text: err?.message ?? "Couldn't change your password. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Change password</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordField label="Current password" value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
        <PasswordField label="New password" value={next} onChange={setNext} show={showNext} onToggle={() => setShowNext((v) => !v)} />

        {next.length > 0 && (
          <ul className="grid gap-1 sm:grid-cols-2">
            {PW_RULES.map((r) => {
              const ok = r.test(next);
              return (
                <li key={r.label} className={`flex items-center gap-2 text-xs ${ok ? "text-green-600" : "text-muted"}`}>
                  <span>{ok ? "✓" : "○"}</span>
                  {r.label}
                </li>
              );
            })}
          </ul>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Confirm new password</span>
          <input
            type={showNext ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500"
          />
          {confirm.length > 0 && !matches && (
            <span className="mt-1 block text-xs text-red-600">Passwords don&apos;t match.</span>
          )}
        </label>

        {msg && (
          <p className={`rounded-lg px-4 py-3 text-sm ${msg.tone === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-navy px-6 py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-line px-4 py-3 pr-12 outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted hover:text-ink"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

// ── Link sections ───────────────────────────────────────────────────────────

type Item = { href: string; label: string; icon: string; desc: string };

function LinkSection({ title, links }: { title: string; links: Item[] }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      <div className="divide-y divide-line">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 py-3 transition hover:opacity-80">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-lg">{l.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{l.label}</p>
              <p className="truncate text-sm text-muted">{l.desc}</p>
            </div>
            <span className="shrink-0 text-muted">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Danger zone ─────────────────────────────────────────────────────────────

function DangerZone({ token, onDeleted }: { token: string | null; onDeleted: () => void }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onDelete() {
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      await api.del("/users/account", { token });
      onDeleted();
      router.replace("/");
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't delete your account. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-red-600">Danger zone</h2>
      <p className="mb-4 text-sm text-muted">Deleting your account is permanent and removes your enrolments, progress and certificates.</p>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-red-700">Are you sure? This cannot be undone.</p>
          {err && <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">{err}</p>}
          <div className="flex gap-3">
            <button
              onClick={onDelete}
              disabled={busy}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold hover:bg-soft"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
