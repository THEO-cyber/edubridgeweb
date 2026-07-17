import Link from "next/link";
import { getCourses, getCategories } from "@/lib/api";
import CourseCard from "@/components/CourseCard";
import type { Metadata } from "next";

export const revalidate = 120;
export const metadata: Metadata = {
  title: "Explore courses",
  description: "Browse EduBridge's catalogue of expert-led courses across development, data, design and more.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const categoryParam = searchParams.category || "";

  // Resolve the category slug from the URL to the id the backend filters on.
  const categories = await getCategories();
  const activeCat = categories.find(
    (c: any) => c.slug === categoryParam || c.id === categoryParam
  );

  const params: Record<string, string> = { limit: "48" };
  if (q) params.search = q;
  if (activeCat) params.categoryId = activeCat.id;
  else if (categoryParam) params.categoryId = categoryParam; // fallback: value may already be an id

  const courses = await getCourses(params);

  return (
    <div className="container-x py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold">
          {q ? `Results for “${q}”` : activeCat ? activeCat.name : "Explore courses"}
        </h1>
        <p className="mt-1 text-muted">
          {courses.length} course{courses.length === 1 ? "" : "s"}
          {activeCat ? ` in ${activeCat.name}` : ""}
          {q && activeCat ? "" : ""}
        </p>
      </header>

      {/* category chips */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Chip href={q ? `/courses?q=${encodeURIComponent(q)}` : "/courses"} active={!activeCat}>All</Chip>
          {/* Whatever the super-admin has active, learners can browse. */}
          {categories.map((c: any) => {
            const href = `/courses?${q ? `q=${encodeURIComponent(q)}&` : ""}category=${c.slug ?? c.id}`;
            return (
              <Chip key={c.id} href={href} active={activeCat?.id === c.id}>
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </Chip>
            );
          })}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-soft p-12 text-center">
          <p className="text-lg font-semibold">No courses found</p>
          <p className="mt-1 text-muted">Try a different search or browse all courses.</p>
          <Link href="/courses" className="mt-4 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Browse all
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c: any) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-navy bg-navy text-white"
          : "border-line bg-white text-muted hover:border-brand-500 hover:text-navy"
      }`}
    >
      {children}
    </Link>
  );
}
