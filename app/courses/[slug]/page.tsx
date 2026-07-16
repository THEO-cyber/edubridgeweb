import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseBySlug } from "@/lib/api";
import { coursePrice, instructorName, categoryName } from "@/lib/format";
import EnrollButton from "@/components/EnrollButton";
import WishlistButton from "@/components/WishlistButton";
import CourseReviews from "@/components/CourseReviews";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.shortDescription || course.description?.slice(0, 160),
    openGraph: {
      title: course.title,
      description: course.shortDescription || course.description?.slice(0, 160),
      images: course.thumbnail ? [course.thumbnail] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const price = coursePrice(course.price, course.discountPrice);
  const sections: any[] = course.sections || [];
  const lessonCount = sections.reduce((n, s) => n + (s.lessons?.length || 0), 0);
  const objectives: string[] = course.objectives || [];

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="container-x grid gap-8 py-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="text-sm font-semibold uppercase tracking-wide text-brand-100">
              {categoryName(course)}
            </div>
            <h1 className="mt-2 text-balance text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
            {course.shortDescription && (
              <p className="mt-4 max-w-2xl text-lg text-white/80">{course.shortDescription}</p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
              <span>By <b className="text-white">{instructorName(course)}</b></span>
              {course.rating ? <span>⭐ {Number(course.rating).toFixed(1)} ({course.totalReviews || 0})</span> : null}
              {course.totalEnrollments ? <span>{course.totalEnrollments} enrolled</span> : null}
              {course.level ? <span className="rounded bg-white/10 px-2 py-0.5">{course.level}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 py-10 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-10 lg:col-span-2">
          {objectives.length > 0 && (
            <section className="rounded-2xl border border-line p-6">
              <h2 className="text-xl font-bold">What you&apos;ll learn</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {objectives.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink">
                    <span className="text-green-600">✓</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.description && (
            <section>
              <h2 className="text-xl font-bold">About this course</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{course.description}</p>
            </section>
          )}

          {sections.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">Course content</h2>
              <p className="mt-1 text-sm text-muted">
                {sections.length} sections · {lessonCount} lessons
              </p>
              <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {sections.map((s: any, i: number) => (
                  <details key={s.id || i} className="group" open={i === 0}>
                    <summary className="flex cursor-pointer items-center justify-between bg-soft px-5 py-4 font-semibold marker:content-none">
                      <span>{s.title}</span>
                      <span className="text-sm text-muted">{s.lessons?.length || 0} lessons</span>
                    </summary>
                    <ul className="divide-y divide-line">
                      {(s.lessons || []).map((l: any) => (
                        <li key={l.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                          <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                          <span className="flex-1">{l.title}</span>
                          {l.isPreview && <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">Preview</span>}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          )}

          <CourseReviews courseId={course.id} />
        </div>

        {/* Sticky enroll card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="aspect-[16/9] bg-brand-50">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${price.isFree ? "text-green-600" : "text-ink"}`}>
                  {price.label}
                </span>
                {price.original && <span className="text-muted line-through">{price.original}</span>}
              </div>
              <div className="mt-5 space-y-3">
                <EnrollButton courseId={course.id} slug={course.slug} price={course.price} discountPrice={course.discountPrice} />
                <WishlistButton courseId={course.id} variant="button" />
              </div>
              <ul className="mt-6 space-y-2 text-sm text-muted">
                <li>✓ Full lifetime access</li>
                <li>✓ Learn on web &amp; mobile</li>
                <li>✓ Certificate of completion</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
