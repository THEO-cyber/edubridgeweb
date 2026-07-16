// Platform currency is XAF (zero-decimal).
export function formatXAF(amount?: number | null): string {
  const n = Math.round(Number(amount ?? 0));
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

export function coursePrice(price?: number | null, discount?: number | null): {
  label: string;
  isFree: boolean;
  original?: string;
} {
  const p = Number(price ?? 0);
  if (p <= 0) return { label: "Free", isFree: true };
  if (discount && Number(discount) > 0 && Number(discount) < p) {
    return { label: formatXAF(discount), isFree: false, original: formatXAF(p) };
  }
  return { label: formatXAF(p), isFree: false };
}

export function instructorName(c: any): string {
  const i = c?.instructor;
  if (!i) return "EduBridge Instructor";
  const n = `${i.firstName ?? ""} ${i.lastName ?? ""}`.trim();
  return n || "EduBridge Instructor";
}

export function categoryName(c: any): string {
  if (!c?.category) return "Course";
  return typeof c.category === "string" ? c.category : c.category.name ?? "Course";
}

// Lesson length: seconds → "8:00" or "1:05:30".
export function formatDuration(seconds?: number | null): string {
  const s = Math.max(0, Math.round(Number(seconds ?? 0)));
  if (!s) return "";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return h ? `${h}:${mm}:${String(sec).padStart(2, "0")}` : `${mm}:${String(sec).padStart(2, "0")}`;
}

// Total course length in human words: seconds → "3h 12m" / "45m".
export function formatTotal(seconds?: number | null): string {
  const s = Math.max(0, Math.round(Number(seconds ?? 0)));
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

// Live-session date/time, e.g. "Tue, 16 Jul 2026 · 14:30".
export function formatSessionTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

// Relative label: "Live now", "Starts in 20 min", "Tomorrow", "Ended".
export function sessionRelative(iso?: string | null, status?: string): string {
  const st = String(status || "").toUpperCase();
  if (st === "IN_PROGRESS") return "Live now";
  if (st === "COMPLETED") return "Ended";
  if (st === "CANCELLED") return "Cancelled";
  if (!iso) return "";
  const diff = new Date(iso).getTime() - Date.now();
  if (isNaN(diff)) return "";
  if (diff <= 0) return "Starting…";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `Starts in ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Starts in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Tomorrow" : `In ${days} days`;
}

// "3m ago", "2h ago", "5d ago", or a date for older items.
export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return "";
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

// Can a student attempt to join yet? (backend allows from 15 min before start.)
export function isJoinable(iso?: string | null, status?: string): boolean {
  const st = String(status || "").toUpperCase();
  if (st === "IN_PROGRESS") return true;
  if (st === "COMPLETED" || st === "CANCELLED") return false;
  if (!iso) return false;
  return new Date(iso).getTime() - Date.now() <= 15 * 60 * 1000;
}
