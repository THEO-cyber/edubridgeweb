import Link from "next/link";
import { getCourses, getCategories } from "@/lib/api";
import CourseCard from "@/components/CourseCard";

export const revalidate = 120;

export default async function HomePage() {
  const [courses, categories] = await Promise.all([getCourses({ limit: "8" }), getCategories()]);
  // The API already returns only the categories the super-admin has marked
  // active, so that curation is what we show — filtering by course count here
  // would silently hide a category the moment an admin created it.
  const topCats = categories.slice(0, 8);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(60% 80% at 15% 0%, #2563EB 0%, transparent 60%), radial-gradient(50% 60% at 100% 100%, #3949AB 0%, transparent 55%)" }} />
        <div className="container-x relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
              Learn without limits
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Build skills that move your career forward
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              Expert-led courses in development, data, design and more. Learn at your own pace, earn certificates, and pay easily with MoMo or Orange Money.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="rounded-xl bg-white px-6 py-3 font-semibold text-navy transition hover:bg-brand-50">
                Explore courses
              </Link>
              <Link href="/register" className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Join for free
              </Link>
            </div>
            <div className="mt-10 flex gap-8 text-sm">
              <Stat n={courses.length ? "6+" : "—"} l="Courses" />
              <Stat n={`${topCats.length || "10"}+`} l="Categories" />
              <Stat n="XAF" l="Local payments" />
            </div>
          </div>
          <div className="hidden items-center justify-center lg:flex">
            <HeroPreview courses={courses.slice(0, 3)} />
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      {topCats.length > 0 && (
        <section className="container-x py-16">
          <h2 className="text-2xl font-bold">Browse by category</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {topCats.map((c: any) => (
              <Link key={c.id} href={`/courses?category=${c.slug ?? c.id}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-card transition hover:border-brand-500 hover:shadow-hover">
                <span className="text-2xl">{c.icon ?? "📘"}</span>
                <span className="font-semibold text-ink">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Popular courses ──────────────────────────────────── */}
      <section className="bg-soft py-16">
        <div className="container-x">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Popular right now</h2>
              <p className="mt-1 text-muted">Hand-picked courses students are loving.</p>
            </div>
            <Link href="/courses" className="hidden text-sm font-semibold text-brand-500 hover:underline sm:block">
              View all →
            </Link>
          </div>
          {courses.length === 0 ? (
            <p className="mt-8 text-muted">Courses are loading — check back shortly.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((c: any) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────────── */}
      <section className="container-x py-16">
        <h2 className="text-center text-2xl font-bold">Why learn on EduBridge</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Value icon="🎓" title="Expert instructors" body="Learn from practitioners who work in the field, not just teach it." />
          <Value icon="📱" title="Learn anywhere" body="Web, Android, iOS — pick up right where you left off, on any device." />
          <Value icon="🏆" title="Earn certificates" body="Finish a course and get a shareable certificate to show your skills." />
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────── */}
      <section className="container-x pb-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-brand-600 px-8 py-14 text-center text-white">
          <h2 className="text-balance text-3xl font-extrabold">Ready to start learning?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Create a free account and enrol in your first course in minutes.
          </p>
          <Link href="/register" className="mt-6 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-navy transition hover:bg-brand-50">
            Get started — it&apos;s free
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold">{n}</div>
      <div className="text-white/70">{l}</div>
    </div>
  );
}

function Value({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">{icon}</div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 text-muted">{body}</p>
    </div>
  );
}

function HeroPreview({ courses }: { courses: any[] }) {
  return (
    <div className="w-full max-w-sm space-y-3">
      {courses.map((c, i) => (
        <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 text-ink shadow-hover"
          style={{ transform: `translateX(${i * 16}px)` }}>
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-50">
            {c.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="line-clamp-2 text-sm font-bold">{c.title}</div>
            <div className="text-xs text-muted">EduBridge</div>
          </div>
        </div>
      ))}
    </div>
  );
}
