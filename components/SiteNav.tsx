"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { splitLocale } from "../lib/i18n/config";
import ArrowIcon from "./ArrowIcon";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import PalJump from "./PalJump";
import { mainLinks } from "./site-links";

// 24x24 stroke icons per nav link
const ICONS: Record<string, string> = {
  "/": "M5 3h14v18H5zM8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M16 11v4",
  "/pals/": "M12 21c-4 0-7-2.5-7-5.5S8 10 12 10s7 2.5 7 5.5-3 5.5-7 5.5zM6 8.5a1.8 1.8 0 1 0 0-.01M18 8.5a1.8 1.8 0 1 0 0-.01M9.5 5a1.8 1.8 0 1 0 0-.01M14.5 5a1.8 1.8 0 1 0 0-.01",
  "/breeding-guide/": "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7",
  "/passive-skills/": "M12 3l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 15.4 7 18.2l1.2-5.6L4 8.8l5.6-.6z",
  "/tier-list/": "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
};

function NavIcon({ href }: { href: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[href] ?? ICONS["/"]} />
    </svg>
  );
}

function useActive() {
  const { path } = splitLocale(usePathname());
  const normalize = (p: string) => p.replace(/\/+$/, "") || "/";
  return (href: string) => normalize(path) === normalize(href);
}

function FindParentsButton({ className = "" }: { className?: string }) {
  const { t, href } = useI18n();
  return (
    <Link
      href={href("/#reverse")}
      className={`btn-primary group flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-bold shadow-lg shadow-accent/20 transition hover:opacity-90 ${className}`}
    >
      {t.nav.findParents}
      <ArrowIcon />
    </Link>
  );
}

/** Second header row on large screens: the main sections. */
export function DesktopNav() {
  const { t, href } = useI18n();
  const isActive = useActive();
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
        {mainLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <li key={link.href}>
              <Link
                href={href(link.href)}
                aria-current={active ? "page" : undefined}
                className={`group relative flex h-11 items-center gap-2 whitespace-nowrap px-3 text-sm font-semibold transition-colors ${
                  active ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                <span className={active ? "text-accent" : "transition-colors group-hover:text-accent"}>
                  <NavIcon href={link.href} />
                </span>
                {t.nav[link.key]}
                <span
                  className={`btn-primary absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-opacity ${
                    active ? "opacity-100 shadow-[0_0_12px_var(--accent)]" : "opacity-0 group-hover:opacity-50"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Right side of the top header row: search, language, CTA and the mobile menu. */
export function HeaderActions() {
  const { t, href } = useI18n();
  const isActive = useActive();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="hidden w-64 md:block xl:w-80">
        <PalJump id="header-jump" />
      </div>
      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <LanguageSwitcher />
        <FindParentsButton className="hidden sm:flex" />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-foreground hover:bg-surface-hover lg:hidden"
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h10M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="animate-pop absolute inset-x-0 top-full flex flex-col gap-3 border-b border-line bg-surface p-4 shadow-2xl lg:hidden"
        >
          <div className="md:hidden">
            <PalJump id="mobile-jump" />
          </div>
          <nav aria-label="Main" className="grid gap-1 sm:grid-cols-2">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={href(link.href)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive(link.href) ? "bg-accent-soft text-foreground" : "text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <span className="text-accent">
                  <NavIcon href={link.href} />
                </span>
                {t.nav[link.key]}
              </Link>
            ))}
          </nav>
          <FindParentsButton className="sm:hidden" />
        </div>
      )}
    </>
  );
}
