"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import PageHero from "@/components/PageHero";
import CertificateCard from "@/components/CertificateCard";

export default function VerifyPage() {
  const [number, setNumber] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [cert, setCert] = useState<any>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = number.trim();
    if (!n) return;
    setState("loading");
    try {
      const d = await api.get(`/certificates/verify/${encodeURIComponent(n)}`);
      if (d && (d.id || d.certificateNumber || d.courseTitle)) {
        setCert(d);
        setState("valid");
      } else {
        setState("invalid");
      }
    } catch {
      setState("invalid");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Verify"
        title="Verify a certificate"
        subtitle="Enter a certificate number to confirm it was genuinely issued by EduBridge."
      />
      <div className="container-x max-w-xl py-14">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. EB-2026-XXXXXX"
            aria-label="Certificate number"
            className="flex-1 rounded-xl border border-line px-4 py-3 outline-none focus:border-brand-500"
          />
          <button className="rounded-xl bg-navy px-6 py-3 font-semibold text-white hover:bg-brand-700">
            {state === "loading" ? "Checking…" : "Verify"}
          </button>
        </form>

        {state === "valid" && cert && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2 font-bold text-green-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
              Valid certificate
            </div>
            <CertificateCard
              recipientName={cert.recipientName ?? (`${cert.user?.firstName ?? ""} ${cert.user?.lastName ?? ""}`.trim() || "Student")}
              courseTitle={cert.courseTitle ?? cert.course?.title ?? "Course"}
              instructorName={cert.instructorName ?? "EduBridge"}
              certificateNumber={cert.certificateNumber ?? cert.certNumber ?? cert.number ?? ""}
              issuedAt={cert.issuedAt}
            />
          </div>
        )}

        {state === "invalid" && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="text-3xl">⚠️</div>
            <p className="mt-2 font-bold text-red-700">No certificate found</p>
            <p className="mt-1 text-sm text-red-600">We couldn&apos;t find a certificate with that number. Check it and try again.</p>
          </div>
        )}
      </div>
    </>
  );
}
