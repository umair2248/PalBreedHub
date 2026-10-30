"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { mainLinks } from "./site-links";

function isActive(pathname: string, href: string): boolean {
  const normalize = (path: string) => path.replace(/\/+$/, "") || "/";
  return normalize(pathname) === normalize(href);
}

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(pathname, href)
        ? "bg-accent-soft text-accent"
        : "text-muted hover:bg-surface-hover hover:text-foreground"
    }`;

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {mainLinks.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-surface-hover md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-line bg-surface p-3 shadow-lg md:hidden"
        >
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
