import PageHero from "@/components/PageHero";
import { SITE } from "@/lib/site";

export default function LegalShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle={intro} />
      <div className="container-x py-14">
        <p className="text-sm text-muted">Last updated: {SITE.legalUpdated}</p>
        <article className="prose mt-8 max-w-3xl">{children}</article>
        <p className="mt-12 max-w-3xl border-t border-line pt-6 text-sm text-muted">
          Questions about this policy? Email us at{" "}
          <a href={`mailto:${SITE.email}`} className="font-semibold text-brand-500 hover:underline">
            {SITE.email}
          </a>
          .
        </p>
      </div>
    </>
  );
}
