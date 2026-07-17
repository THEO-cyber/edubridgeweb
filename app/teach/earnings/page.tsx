"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import { formatXAF, timeAgo } from "@/lib/format";
import InstructorShell from "@/components/InstructorShell";

export default function EarningsPage() {
  return (
    <InstructorShell title="Earnings">
      <EarningsBody />
    </InstructorShell>
  );
}

function EarningsBody() {
  const { token } = useAuth();
  const [d, setD] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [dash, hist] = await Promise.all([
      api.get("/payouts/dashboard", { token: token! }).catch(() => null),
      api.get("/payouts/history", { token: token! }).catch(() => null),
    ]);
    setD(dash);
    setHistory(pickList(hist, ["payouts", "items", "history"]));
    if (dash?.payoutPhone) setPhone(dash.payoutPhone);
    setLoading(false);
  }, [token]);

  useEffect(() => { if (token) load(); }, [token, load]);

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api.post("/payouts/connect", { phoneNumber: phone.trim() }, { token: token! });
      setMsg("Payout number saved.");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Could not save that number.");
    } finally { setBusy(false); }
  }

  async function withdraw(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api.post("/payouts/request", { amount: Number(amount), currency: "XAF" }, { token: token! });
      setMsg("Withdrawal requested — it will be sent to your mobile money.");
      setAmount("");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Could not request the withdrawal.");
    } finally { setBusy(false); }
  }

  if (loading) return <p className="text-muted">Loading…</p>;
  const dd = d || {};
  const connected = !!dd.payoutConnected;
  const balance = Number(dd.availableBalance ?? 0);

  return (
    <div className="space-y-6">
      {/* balances */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Available" value={formatXAF(dd.availableBalance ?? 0)} accent />
        <Stat label="Gross revenue" value={formatXAF(dd.grossRevenue ?? 0)} />
        <Stat label="Pending" value={formatXAF(dd.pendingPayouts ?? 0)} />
        <Stat label="Paid out" value={formatXAF(dd.paidOut ?? 0)} />
      </div>

      {msg && <p className="rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-700">{msg}</p>}

      {/* connect payout number */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <h3 className="font-bold">Payout account</h3>
        <p className="mt-1 text-sm text-muted">The MTN Mobile Money or Orange Money number your earnings are sent to.</p>
        <form onSubmit={connect} className="mt-3 flex flex-wrap gap-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="6XXXXXXXX"
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
          <button disabled={busy} className="rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
            {connected ? "Update number" : "Connect"}
          </button>
        </form>
        {connected && <p className="mt-2 text-xs text-green-700">✓ Connected{dd.payoutPhone ? ` · ${dd.payoutPhone}` : ""}</p>}
      </div>

      {/* withdraw */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <h3 className="font-bold">Withdraw earnings</h3>
        <p className="mt-1 text-sm text-muted">Minimum 500 XAF. Sent to your connected mobile money number.</p>
        <form onSubmit={withdraw} className="mt-3 flex flex-wrap gap-2">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="Amount in XAF"
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
          <button
            onClick={() => setAmount(String(balance))}
            type="button"
            className="rounded-xl border border-line px-3 py-2.5 text-sm font-semibold hover:bg-soft"
          >Max</button>
          <button disabled={busy || !connected || balance < 500 || Number(amount) < 500}
            className="rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
            Withdraw
          </button>
        </form>
        {!connected && <p className="mt-2 text-xs text-amber-600">Connect a payout number first.</p>}
        {connected && balance < 500 && <p className="mt-2 text-xs text-muted">You need at least 500 XAF available to withdraw.</p>}
      </div>

      {/* history */}
      <div>
        <h3 className="mb-3 font-bold">Payout history</h3>
        {history.length === 0 ? (
          <p className="rounded-xl border border-line bg-soft px-4 py-3 text-sm text-muted">No payouts yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {history.map((h, i) => (
              <div key={h.id || i} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0">
                <div>
                  <div className="font-semibold">{formatXAF(h.amount)}</div>
                  <div className="text-xs text-muted">{timeAgo(h.createdAt)}{h.phoneNumber ? ` · ${h.phoneNumber}` : ""}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusCls(h.status)}`}>{String(h.status || "pending").toLowerCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-card ${accent ? "border-navy bg-navy text-white" : "border-line bg-white"}`}>
      <div className={`text-lg font-extrabold ${accent ? "" : "text-navy"}`}>{value}</div>
      <div className={`text-xs ${accent ? "text-white/80" : "text-muted"}`}>{label}</div>
    </div>
  );
}
function statusCls(s?: string) {
  const v = (s || "").toUpperCase();
  if (v === "COMPLETED" || v === "PAID") return "bg-green-50 text-green-700";
  if (v === "FAILED" || v === "REJECTED") return "bg-red-50 text-red-600";
  return "bg-amber-50 text-amber-700";
}
