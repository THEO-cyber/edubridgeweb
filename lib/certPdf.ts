// Client-side certificate export. Captures the rendered (cream) certificate and
// writes it into an A4-landscape PDF — so the download is pixel-identical to what
// is shown on screen (and thus matches the mobile app). Works fully offline.

export async function downloadCertificatePdf(el: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(el, {
    scale: 3,
    backgroundColor: "#F8FAFC",
    useCORS: true,
    logging: false,
  });

  const img = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  // Cert aspect (1.414) == A4 landscape (841.89/595.28), so it fills the page.
  pdf.addImage(img, "JPEG", 0, 0, w, h);
  pdf.save(filename);
}

export function safeFileName(s: string): string {
  return (s || "certificate").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "certificate";
}

export async function shareCertificate(courseTitle: string, certificateNumber: string) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/verify?number=${encodeURIComponent(certificateNumber)}` : "";
  const text = `I earned a certificate for "${courseTitle}" on EduBridge! 🎓\nCertificate #${certificateNumber}`;
  const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
  if (nav?.share) {
    try {
      await nav.share({ title: "EduBridge Certificate", text, url });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  if (nav?.clipboard?.writeText) {
    await nav.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  }
  return "unsupported";
}
