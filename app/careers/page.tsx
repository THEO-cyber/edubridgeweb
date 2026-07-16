import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the team building EduBridge — an African online learning platform. We hire across engineering, content, design and growth. Apply by email.",
};

const AREAS = [
  { icon: "💻", title: "Engineering", body: "Backend (NestJS), web (Next.js) and mobile (Flutter) engineers who care about performance on real-world networks." },
  { icon: "🎓", title: "Instructor Success", body: "Help vetted experts launch great courses — from onboarding to production quality." },
  { icon: "🎨", title: "Product & Design", body: "Craft simple, accessible learning experiences for a mobile-first audience." },
  { icon: "📣", title: "Growth & Community", body: "Reach learners across Africa and grow a community of students and creators." },
];

function applyHref(area: string) {
  const subject = `Careers — ${area} application`;
  const body = `Hi EduBridge team,\n\nI'd like to apply for a role in ${area}.\n\nName:\nLocation:\nLinkedIn / portfolio:\n\n(Please attach your CV.)`;
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Help us bring skills to millions"
        subtitle="We're a small, mission-driven team building the learning platform Africa deserves. If that excites you, we'd love to hear from you."
      />

      {/* Why join */}
      <section className="container-x py-16">
        <h2 className="text-2xl font-bold">Why EduBridge</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Perk icon="🌍" title="Real impact" body="Your work directly expands access to education across the continent." />
          <Perk icon="🚀" title="Ownership" body="Small team, big scope — you'll own meaningful problems end to end." />
          <Perk icon="🏡" title="Remote-friendly" body="Work from anywhere. We care about outcomes, not clock-watching." />
          <Perk icon="📈" title="Grow fast" body="Wear many hats, learn quickly, and grow with the platform." />
        </div>

        {/* Areas we hire for */}
        <h2 className="mt-20 text-2xl font-bold">Areas we hire for</h2>
        <p className="mt-2 text-muted">
          We&apos;re always looking for exceptional people. Pick the area that fits you best and email us your CV.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {AREAS.map((a) => (
            <div key={a.title} className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-2xl">{a.icon}</span>
                <h3 className="text-lg font-bold">{a.title}</h3>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted">{a.body}</p>
              <a href={applyHref(a.title)} className="mt-5 inline-block rounded-xl bg-navy px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700">
                Apply for {a.title}
              </a>
            </div>
          ))}
        </div>

        {/* General application */}
        <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-brand-600 px-8 py-12 text-center text-white">
          <h2 className="text-balance text-2xl font-extrabold">Don&apos;t see the right fit?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            We still want to meet great people. Send us your CV and tell us how you&apos;d help EduBridge grow.
          </p>
          <a href={applyHref("General")} className="mt-6 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-navy transition hover:bg-brand-50">
            Email {SITE.email}
          </a>
        </div>
      </section>
    </>
  );
}

function Perk({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">{icon}</div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
