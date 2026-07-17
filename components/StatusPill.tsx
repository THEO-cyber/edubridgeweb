/** Course status badge, shared across the instructor area. */
export default function StatusPill({ status }: { status?: string }) {
  const s = (status || "DRAFT").toUpperCase();
  const map: Record<string, string> = {
    PUBLISHED: "bg-green-50 text-green-700",
    DRAFT: "bg-slate-100 text-slate-600",
    PENDING_REVIEW: "bg-amber-50 text-amber-700",
    UNDER_REVIEW: "bg-amber-50 text-amber-700",
    ARCHIVED: "bg-red-50 text-red-600",
  };
  const label =
    s === "PENDING_REVIEW" || s === "UNDER_REVIEW"
      ? "In review"
      : s.charAt(0) + s.slice(1).toLowerCase();
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${map[s] || map.DRAFT}`}>{label}</span>;
}
