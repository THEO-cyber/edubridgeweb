export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(55% 80% at 12% 0%, #2563EB 0%, transparent 60%), radial-gradient(45% 60% at 100% 100%, #3949AB 0%, transparent 55%)",
        }}
      />
      <div className="container-x relative py-14 lg:py-16">
        {eyebrow && (
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>}
      </div>
    </section>
  );
}
