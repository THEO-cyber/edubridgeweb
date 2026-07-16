"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api, pickList } from "@/lib/api";
import CertificateCard, { type CertificateData } from "@/components/CertificateCard";
import CertificateListCard from "@/components/CertificateListCard";
import CertificatePreview from "@/components/CertificatePreview";
import { downloadCertificatePdf, shareCertificate, safeFileName } from "@/lib/certPdf";

function toData(c: any): CertificateData {
  return {
    recipientName: c.recipientName ?? "You",
    courseTitle: c.courseTitle ?? c.course?.title ?? "Course",
    instructorName: c.instructorName ?? "Course Instructor",
    issuedBy: c.issuedBy ?? "EduBridge Academy",
    certificateNumber: c.certificateNumber ?? c.certNumber ?? c.number ?? c.id,
    issuedAt: c.issuedAt ?? c.createdAt,
  };
}

export default function CertificatesPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CertificateData[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [preview, setPreview] = useState<CertificateData | null>(null);
  const [capturing, setCapturing] = useState<CertificateData | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?next=/certificates");
      return;
    }
    api
      .get("/certificates", { token })
      .then((d) => setItems(pickList(d, ["certificates", "items"]).map(toData)))
      .catch((e) => setErr(e?.message || "Could not load your certificates."));
  }, [loading, token, router]);

  async function handleDownload(data: CertificateData) {
    setDownloadingId(data.certificateNumber);
    setCapturing(data);
    // wait for the off-screen certificate to mount + layout
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    try {
      if (captureRef.current) {
        await downloadCertificatePdf(captureRef.current, `EduBridge-${safeFileName(data.courseTitle)}.pdf`);
      }
    } catch {
      setErr("Could not generate the PDF. Please try again.");
    } finally {
      setCapturing(null);
      setDownloadingId(null);
    }
  }

  async function handleShare(data: CertificateData) {
    setSharingId(data.certificateNumber);
    try {
      await shareCertificate(data.courseTitle, data.certificateNumber);
    } finally {
      setSharingId(null);
    }
  }

  if (loading || (!token && !err)) {
    return <div className="container-x py-20 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">My certificates</h1>
          <p className="mt-1 text-muted">Tap a certificate to view it, or download a PDF for offline use.</p>
        </div>
        <Link href="/verify" className="text-sm font-semibold text-brand-500 hover:underline">Verify a certificate →</Link>
      </div>

      {err && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-red-600">{err}</p>}

      {items === null && !err ? (
        <p className="mt-8 text-muted">Loading…</p>
      ) : items && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-soft p-12 text-center">
          <div className="text-4xl">🎓</div>
          <p className="mt-3 text-lg font-semibold">No certificates yet</p>
          <p className="mt-1 text-muted">Finish a course to earn your first certificate.</p>
          <Link href="/dashboard" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Go to My Learning
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((c) => (
            <CertificateListCard
              key={c.certificateNumber}
              data={c}
              onOpen={() => setPreview(c)}
              onDownload={() => handleDownload(c)}
              onShare={() => handleShare(c)}
              downloading={downloadingId === c.certificateNumber}
              sharing={sharingId === c.certificateNumber}
            />
          ))}
        </div>
      )}

      {/* Fullscreen viewer */}
      {preview && (
        <CertificatePreview
          data={preview}
          onClose={() => setPreview(null)}
          onDownload={() => handleDownload(preview)}
          onShare={() => handleShare(preview)}
          downloading={downloadingId === preview.certificateNumber}
          sharing={sharingId === preview.certificateNumber}
        />
      )}

      {/* Off-screen high-res capture surface for PDF export */}
      <div aria-hidden style={{ position: "fixed", left: -100000, top: 0, width: 1100, pointerEvents: "none" }}>
        {capturing && <CertificateCard ref={captureRef} data={capturing} />}
      </div>
    </div>
  );
}
