import { forwardRef } from "react";

// Faithful web replica of the mobile on-screen certificate (_buildCertificateWidget)
// and its cream PDF: cream #F8FAFC, gold #F59E0B double border, corner ornaments,
// centre seal, italic serif name. Everything is sized in `cqw` so the whole
// certificate scales proportionally with its container width.
export type CertificateData = {
  recipientName: string;
  courseTitle: string;
  instructorName?: string;
  issuedBy?: string;
  certificateNumber: string;
  issuedAt?: string | Date | null;
};

const GOLD = "#F59E0B";
const GOLD_LT = "#FBBF24";
const NAVY = "#0F172A";
const SLATE = "#1E293B";
const GREY = "#607D8B";
const CREAM = "#F8FAFC";

const Corner = ({ rotate }: { rotate: number }) => (
  <svg viewBox="0 0 22 22" style={{ width: "2.6cqw", height: "2.6cqw", transform: `rotate(${rotate}deg)` }}>
    <g fill="none" stroke={GOLD} strokeWidth={1.5}>
      <path d="M0 0 H14.3 M0 0 V14.3 M3 3 H8.4 M3 3 V8.4" />
    </g>
    <circle cx="0" cy="0" r="2" fill={GOLD} />
  </svg>
);

function Seal() {
  return (
    <div
      style={{
        width: "9cqw",
        height: "9cqw",
        borderRadius: "9999px",
        background: `radial-gradient(circle at 50% 45%, ${GOLD_LT} 0%, ${GOLD} 60%, #8B6914 100%)`,
        boxShadow: `0 0 2.5cqw rgba(245,158,11,0.45)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: NAVY,
        lineHeight: 1.05,
      }}
    >
      <svg viewBox="0 0 24 24" style={{ width: "3cqw", height: "3cqw" }} fill={NAVY}>
        <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.2 7.7l5.4-.8L12 2z" />
      </svg>
      <div style={{ fontWeight: 700, fontSize: "1.15cqw", letterSpacing: "0.1cqw", marginTop: "0.3cqw" }}>EDUBRIDGE</div>
      <div style={{ fontSize: "0.95cqw", letterSpacing: "0.08cqw" }}>CERTIFIED</div>
    </div>
  );
}

// Accepts either <CertificateCard data={...} /> or the fields spread directly.
type CertificateCardProps = { data: CertificateData } | CertificateData;

const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(function CertificateCard(props, ref) {
  const data: CertificateData = "data" in props ? props.data : props;
  const name = data.recipientName?.trim() || "Graduate";
  const course = data.courseTitle?.trim() || "EduBridge Course";
  const instructor = data.instructorName?.trim() || "Course Instructor";
  const issuedBy = data.issuedBy?.trim() || "EduBridge Academy";
  const dateStr = data.issuedAt
    ? new Date(data.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div style={{ containerType: "inline-size", width: "100%" }}>
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.414",
          background: CREAM,
          borderRadius: "0.4cqw",
          overflow: "hidden",
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: NAVY,
        }}
      >
        {/* watermark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(90deg, rgba(15,23,42,0.03) 0 0.6cqw, transparent 0.6cqw 2.8cqw)`,
          }}
        />
        {/* faint diagonal wordmark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-28deg)",
            opacity: 0.04,
            fontWeight: 700,
            fontSize: "14cqw",
            color: NAVY,
            whiteSpace: "nowrap",
          }}
        >
          EDUBRIDGE
        </div>

        {/* gold borders */}
        <div style={{ position: "absolute", inset: "2.4cqw", border: `0.28cqw solid ${GOLD}` }} />
        <div style={{ position: "absolute", inset: "3.6cqw", border: `0.1cqw solid rgba(245,158,11,0.4)` }} />

        {/* corners */}
        <div style={{ position: "absolute", top: "1.4cqw", left: "1.4cqw" }}><Corner rotate={0} /></div>
        <div style={{ position: "absolute", top: "1.4cqw", right: "1.4cqw" }}><Corner rotate={90} /></div>
        <div style={{ position: "absolute", bottom: "1.4cqw", right: "1.4cqw" }}><Corner rotate={180} /></div>
        <div style={{ position: "absolute", bottom: "1.4cqw", left: "1.4cqw" }}><Corner rotate={270} /></div>

        {/* content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "5cqw 8cqw 4cqw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8cqw" }}>
            <div style={{ width: "2.8cqw", height: "2.8cqw", borderRadius: "9999px", background: NAVY, color: GOLD, display: "grid", placeItems: "center", fontWeight: 700, fontSize: "1.5cqw" }}>E</div>
            <div style={{ fontWeight: 700, fontSize: "2cqw", letterSpacing: "0.5cqw", color: NAVY }}>EDUBRIDGE</div>
          </div>

          {/* gold divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1cqw", width: "44%", margin: "1.6cqw 0" }}>
            <div style={{ flex: 1, height: "0.12cqw", background: "rgba(245,158,11,0.5)" }} />
            <svg viewBox="0 0 24 24" style={{ width: "1.6cqw", height: "1.6cqw" }} fill={GOLD}><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.2 7.7l5.4-.8L12 2z" /></svg>
            <div style={{ flex: 1, height: "0.12cqw", background: "rgba(245,158,11,0.5)" }} />
          </div>

          <div style={{ fontWeight: 700, fontSize: "3.4cqw", letterSpacing: "0.1cqw", color: NAVY }}>Certificate of Completion</div>
          <div style={{ fontSize: "1.3cqw", letterSpacing: "0.35cqw", color: GREY, marginTop: "1cqw" }}>THIS IS TO CERTIFY THAT</div>

          <div style={{ fontWeight: 700, fontStyle: "italic", fontSize: "4.4cqw", color: NAVY, marginTop: "1.4cqw", lineHeight: 1.1 }}>{name}</div>
          <div style={{ width: "22cqw", height: "0.09cqw", background: "rgba(245,158,11,0.6)", margin: "1cqw 0" }} />

          <div style={{ fontSize: "1.3cqw", letterSpacing: "0.28cqw", color: GREY }}>HAS SUCCESSFULLY COMPLETED THE COURSE</div>
          <div style={{ fontWeight: 700, fontSize: "2.4cqw", color: SLATE, marginTop: "1cqw", lineHeight: 1.25 }}>&ldquo;{course}&rdquo;</div>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: "2.5cqw", fontSize: "1.1cqw", letterSpacing: "0.06cqw", color: GREY, marginBottom: "1.5cqw" }}>
            <span>No: #{data.certificateNumber}</span>
            {dateStr && <span>Issued: {dateStr}</span>}
          </div>

          {/* signatures + seal */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "3cqw", width: "100%" }}>
            <SignatureBlock name={issuedBy} label="AUTHORIZED SIGNATORY" />
            <Seal />
            <SignatureBlock name={instructor} label="COURSE INSTRUCTOR" />
          </div>
        </div>
      </div>
    </div>
  );
});

function SignatureBlock({ name, label }: { name: string; label: string }) {
  return (
    <div style={{ flex: 1, maxWidth: "26cqw", textAlign: "center" }}>
      <div style={{ width: "60%", height: "0.1cqw", background: NAVY, margin: "0 auto 0.8cqw" }} />
      <div style={{ fontWeight: 700, fontSize: "1.4cqw", color: NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      <div style={{ fontSize: "1cqw", letterSpacing: "0.1cqw", color: GREY }}>{label}</div>
    </div>
  );
}

export default CertificateCard;
