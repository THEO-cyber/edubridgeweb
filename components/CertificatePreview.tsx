"use client";

import { useEffect } from "react";
import CertificateCard, { type CertificateData } from "@/components/CertificateCard";

const GOLD = "#F59E0B";

// Fullscreen certificate viewer — matches the mobile preview screen:
// dark navy backdrop, the cream certificate centred, Download PDF + Share below.
export default function CertificatePreview({
  data,
  onClose,
  onDownload,
  onShare,
  downloading,
  sharing,
}: {
  data: CertificateData;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
  downloading: boolean;
  sharing: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F172A]">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="font-bold">Certificate</span>
        <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* certificate */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        <div className="w-full max-w-4xl">
          <CertificateCard data={data} />
        </div>
      </div>

      {/* bottom actions */}
      <div className="flex gap-3 px-5 pb-8 pt-3" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
        <button onClick={onDownload} disabled={downloading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-bold text-navy transition hover:bg-brand-50 disabled:opacity-60">
          {downloading ? <Spinner dark /> : <DownloadIcon />} Download PDF
        </button>
        <button onClick={onShare} disabled={sharing} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition disabled:opacity-60" style={{ background: GOLD }}>
          {sharing ? <Spinner /> : <ShareIcon />} Share
        </button>
      </div>
    </div>
  );
}

const DownloadIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" /></svg>;
const ShareIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>;
const Spinner = ({ dark }: { dark?: boolean }) => <svg className={`h-5 w-5 animate-spin ${dark ? "text-navy" : "text-white"}`} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
