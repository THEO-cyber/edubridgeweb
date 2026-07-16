import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the EduBridge team. Email ${SITE.email} for support, payments, partnerships and instructor enquiries.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're here to help"
        subtitle="Questions about a course, a payment, or teaching on EduBridge? Reach out and we'll get back to you."
      />

      <section className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Contact channels */}
          <div className="space-y-4 lg:col-span-1">
            <InfoCard icon="✉️" title="Email us">
              <a href={`mailto:${SITE.email}`} className="font-semibold text-brand-500 hover:underline">
                {SITE.email}
              </a>
              <p className="mt-1 text-sm text-muted">Best for support, billing and general questions.</p>
            </InfoCard>
            <InfoCard icon="⏱️" title="Response time">
              <p className="text-sm text-muted">We aim to reply within <strong className="text-ink">1–2 business days</strong>.</p>
            </InfoCard>
            <InfoCard icon="🎓" title="Want to teach?">
              <p className="text-sm text-muted">
                Apply through our{" "}
                <Link href="/teach" className="font-semibold text-brand-500 hover:underline">instructor page</Link>.
              </p>
            </InfoCard>
            <InfoCard icon="💳" title="Payments & refunds">
              <p className="text-sm text-muted">
                See our{" "}
                <Link href="/refunds" className="font-semibold text-brand-500 hover:underline">refund policy</Link>{" "}
                or email us with your order details.
              </p>
            </InfoCard>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-xl">{icon}</span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
