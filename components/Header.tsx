"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // mobile drawer
  const [acctOpen, setAcctOpen] = useState(false); // desktop avatar menu

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setMenuOpen(false);
    router.push(q.trim() ? `/courses?q=${encodeURIComponent(q.trim())}` : "/courses");
  }

  const initial = (user?.firstName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();
  const isInstructor = ["INSTRUCTOR", "SUPER_ADMIN"].includes((user?.role || "").toUpperCase());

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy font-bold text-white">e</span>
          <span className="text-lg font-bold tracking-tight">
            edu<span className="text-brand-500">Bridge</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <Link href="/courses" className="hidden text-sm font-medium text-muted hover:text-ink md:block">Explore</Link>
        <Link href="/live" className="hidden items-center gap-1.5 text-sm font-medium text-muted hover:text-ink md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Live
        </Link>
        <Link href="/teach" className="hidden text-sm font-medium text-muted hover:text-ink md:block">Teach</Link>

        {/* Desktop search */}
        <form onSubmit={onSearch} className="ml-2 hidden flex-1 md:block">
          <div className="relative max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What do you want to learn?"
              aria-label="Search courses"
              className="w-full rounded-full border border-line bg-soft px-4 py-2 pl-10 text-sm outline-none focus:border-brand-500 focus:bg-white"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
        </form>

        {/* Desktop auth */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-ink">My Learning</Link>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setAcctOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={acctOpen}
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-navy"
                >
                  {initial}
                </button>
                {acctOpen && (
                  <>
                    <button className="fixed inset-0 z-10 cursor-default" aria-hidden onClick={() => setAcctOpen(false)} tabIndex={-1} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-line bg-white p-1 shadow-card">
                      <div className="truncate px-3 py-2 text-xs text-muted">{user.email}</div>
                      {isInstructor ? (
                        <Link href="/teach/dashboard" onClick={() => setAcctOpen(false)} className="block rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-navy hover:bg-brand-100">Instructor dashboard</Link>
                      ) : null}
                      <Link href="/dashboard" onClick={() => setAcctOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-soft">My Learning</Link>
                      <Link href="/wishlist" onClick={() => setAcctOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-soft">Wishlist</Link>
                      <Link href="/certificates" onClick={() => setAcctOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-soft">Certificates</Link>
                      {!isInstructor && (
                        <Link href="/teach" onClick={() => setAcctOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-soft">Teach on EduBridge</Link>
                      )}
                      <button onClick={() => { setAcctOpen(false); logout(); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Log out</button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-navy hover:bg-soft">Log in</Link>
              <Link href="/register" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Join for free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="ml-auto grid h-10 w-10 place-items-center rounded-lg text-ink hover:bg-soft md:hidden"
        >
          {menuOpen ? (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="container-x space-y-4 py-4">
            <form onSubmit={onSearch}>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What do you want to learn?"
                  aria-label="Search courses"
                  className="w-full rounded-full border border-line bg-soft px-4 py-2.5 pl-10 text-sm outline-none focus:border-brand-500 focus:bg-white"
                />
                <svg className="absolute left-3 top-3 h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
            </form>

            <nav className="grid gap-1">
              <MobileLink href="/courses" onClick={() => setMenuOpen(false)}>Explore courses</MobileLink>
              <MobileLink href="/live" onClick={() => setMenuOpen(false)}>🔴 Live classes</MobileLink>
              {isInstructor
                ? <MobileLink href="/teach/dashboard" onClick={() => setMenuOpen(false)}>Instructor dashboard</MobileLink>
                : <MobileLink href="/teach" onClick={() => setMenuOpen(false)}>Teach on EduBridge</MobileLink>}
              {user && <MobileLink href="/dashboard" onClick={() => setMenuOpen(false)}>My Learning</MobileLink>}
              {user && <MobileLink href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</MobileLink>}
              {user && <MobileLink href="/certificates" onClick={() => setMenuOpen(false)}>Certificates</MobileLink>}
              {user && <MobileLink href="/notifications" onClick={() => setMenuOpen(false)}>Notifications</MobileLink>}
            </nav>

            <div className="border-t border-line pt-4">
              {loading ? null : user ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-navy">{initial}</span>
                    <span className="truncate text-sm text-muted">{user.email}</span>
                  </div>
                  <button onClick={() => { setMenuOpen(false); logout(); }} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Log out</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg border border-line px-4 py-2.5 text-center text-sm font-semibold text-navy hover:bg-soft">Log in</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-navy px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700">Join for free</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-lg px-3 py-2.5 text-base font-medium text-ink hover:bg-soft">
      {children}
    </Link>
  );
}
