import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "EduBridge is an African online learning platform connecting learners with vetted expert instructors. Learn in-demand skills and pay in XAF with MoMo or Orange Money.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Bridging the gap between talent and opportunity"
        subtitle="EduBridge makes high-quality, career-focused education accessible across Africa — on any device, in your local currency."
      />

      <section className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Our mission</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Millions of talented people across Africa are held back not by ability, but by access — to
              affordable courses, to trusted instructors, and to payment methods that actually work where they
              live. EduBridge exists to remove those barriers. We bring practical, in-demand skills to anyone
              with a phone, and we make paying as simple as sending mobile money.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">How we&apos;re different</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Every instructor on EduBridge is <strong className="text-ink">vetted</strong> before they can
              teach, so learners can trust the quality of what they&apos;re paying for. Courses are priced in{" "}
              <strong className="text-ink">XAF</strong> and paid via {SITE.paymentMethods} — no card, no bank
              account required. And you learn once, everywhere: pick up on web, Android or iOS right where you
              left off.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          <Stat n="Vetted" l="Every instructor reviewed before teaching" />
          <Stat n="XAF" l="Local pricing, mobile-money payments" />
          <Stat n="Web · iOS · Android" l="One account, every device" />
        </div>

        {/* Values */}
        <h2 className="mt-20 text-center text-2xl font-bold">What we stand for</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Value icon="🎯" title="Access first" body="If it doesn't work on a mid-range phone with mobile money, it doesn't ship." />
          <Value icon="✅" title="Quality you can trust" body="Vetted instructors and real, practical outcomes — not filler." />
          <Value icon="🤝" title="Fair for creators" body="Instructors earn in XAF with payouts straight to mobile money." />
          <Value icon="🌍" title="Built for Africa" body="Designed around how our learners actually connect, pay and study." />
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-brand-600 px-8 py-14 text-center text-white">
          <h2 className="text-balance text-3xl font-extrabold">Join the EduBridge community</h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Start learning today, or share your expertise with thousands of learners.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="rounded-xl bg-white px-7 py-3 font-semibold text-navy transition hover:bg-brand-50">
              Explore courses
            </Link>
            <Link href="/teach" className="rounded-xl border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10">
              Teach on EduBridge
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-card">
      <div className="text-2xl font-extrabold text-navy">{n}</div>
      <div className="mt-1 text-sm text-muted">{l}</div>
    </div>
  );
}

function Value({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">{icon}</div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
