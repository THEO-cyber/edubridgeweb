import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-soft">
      <div className="container-x grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-white font-bold">e</span>
            <span className="text-lg font-bold">edu<span className="text-brand-500">Bridge</span></span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Learn in-demand skills from expert instructors — anywhere, on any device.
          </p>
          <a href={`mailto:${SITE.email}`} className="mt-3 inline-block text-sm font-medium text-brand-500 hover:underline">
            {SITE.email}
          </a>
        </div>
        <FooterCol title="Learn" links={[["Explore courses", "/courses"], ["My Learning", "/dashboard"], ["Teach on EduBridge", "/teach"]]} />
        <FooterCol title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Careers", "/careers"]]} />
        <FooterCol title="Legal" links={[["Terms", "/terms"], ["Privacy", "/privacy"], ["Refunds", "/refunds"]]} />
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-sm text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} EduBridge. All rights reserved.</span>
          <span>Payments in XAF via MoMo &amp; Orange Money.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wide text-ink">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-muted hover:text-brand-500">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
