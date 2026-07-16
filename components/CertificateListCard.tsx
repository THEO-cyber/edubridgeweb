"use client";

import type { CertificateData } from "@/components/CertificateCard";

const GOLD = "#F59E0B";

// Compact list card mirroring the mobile _CertificateCard (navy banner + strip).
export default function CertificateListCard({
  data,
  onOpen,
  onDownload,
  onShare,
  downloading,
  sharing,
}: {
  data: CertificateData;
  onOpen: () => void;
  onDownload: () => void;
  onShare: () => void;
  downloading: boolean;
  sharing: boolean;
}) {
  const dateStr = data.issuedAt ? new Date(data.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div className="overflow-hidden rounded-2xl shadow-card">
      {/* banner */}
      <button onClick={onOpen} className="relative block w-full text-left" style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}>
        <div className="relative flex h-[130px] flex-col items-center justify-center px-6">
          {/* gold inset border */}
          <span className="pointer-events-none absolute inset-2 rounded-md border" style={{ borderColor: "rgba(245,158,11,0.5)" }} />
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill={GOLD}><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.2 7.7l5.4-.8L12 2z" /></svg>
          <div className="mt-1.5 text-[10px] font-bold tracking-[0.25em]" style={{ color: GOLD }}>CERTIFICATE OF COMPLETION</div>
          <div className="mt-2 line-clamp-2 text-center text-base font-bold leading-snug text-white">{data.courseTitle}</div>
        </div>
      </button>

      {/* details strip */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-stretch gap-4">
          <InfoCol label="ISSUED TO" value={data.recipientName || "Student"} />
          <div className="w-px self-center bg-line" style={{ height: 36 }} />
          <InfoCol label="DATE ISSUED" value={dateStr} />
        </div>
        <div className="my-2.5 h-px bg-line" />
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-xs font-medium text-muted">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.6 13.4 11 3.8V3H4v7h.8l9.6 9.6a2 2 0 0 0 2.8 0l3.4-3.4a2 2 0 0 0 0-2.8Z" /></svg>
            <span className="max-w-[9rem] truncate font-mono">{data.certificateNumber}</span>
          </span>
          <div className="flex gap-2">
            <button onClick={onDownload} disabled={downloading} className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
              {downloading ? <Spinner /> : <DownloadIcon />} Download
            </button>
            <button onClick={onShare} disabled={sharing} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition disabled:opacity-60" style={{ background: GOLD }}>
              {sharing ? <Spinner /> : <ShareIcon />} Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="text-[9px] font-bold tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-bold text-navy">{value}</div>
    </div>
  );
}
const DownloadIcon = () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" /></svg>;
const ShareIcon = () => <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>;
const Spinner = () => <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
