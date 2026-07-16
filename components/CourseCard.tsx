import Link from "next/link";
import { coursePrice, instructorName, categoryName } from "@/lib/format";
import WishlistButton from "@/components/WishlistButton";

function Stars({ rating = 0 }: { rating?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-500">
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.9 3.1 1.1-6.6L.5 6.9l6.6-1L10 0l2.9 5.9 6.6 1-4.7 4.6 1.1 6.6z" /></svg>
      <span className="font-semibold text-ink">{Number(rating || 0).toFixed(1)}</span>
    </span>
  );
}

export default function CourseCard({ course }: { course: any }) {
  const price = coursePrice(course.price, course.discountPrice);
  const img = course.thumbnail;
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-hover"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-brand-50">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={course.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-100 to-brand-50 text-navy">
            <svg className="h-10 w-10 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 6v12l8 3 8-3V6M12 9v12" /></svg>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <WishlistButton courseId={course.id} variant="icon" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
          {categoryName(course)}
        </span>
        <h3 className="line-clamp-2 font-bold leading-snug text-ink">{course.title}</h3>
        <p className="text-sm text-muted">{instructorName(course)}</p>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <Stars rating={course.rating} />
          {course.totalReviews ? (
            <span className="text-muted">({course.totalReviews})</span>
          ) : null}
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className={`font-extrabold ${price.isFree ? "text-green-600" : "text-ink"}`}>
            {price.label}
          </span>
          {price.original && (
            <span className="text-sm text-muted line-through">{price.original}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
