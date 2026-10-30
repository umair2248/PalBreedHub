"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_INFO, localePath, splitLocale } from "../lib/i18n/config";
import Flag from "./Flag";
import { useI18n } from "./I18nProvider";

/** Flag dropdown that links to the current page in every other language. */
export default function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { path } = splitLocale(pathname);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t.nav.language}: ${LOCALE_INFO[locale].name}`}
        className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 text-sm font-bold uppercase transition hover:border-accent"
      >
        <Flag locale={locale} />
        <span>{locale === "zh-tw" ? "繁" : locale === "zh-cn" ? "简" : locale}</span>
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor" aria-hidden="true">
          <path d="M6 9h12l-6 7z" />
        </svg>
      </button>

      {open && (
        <ul className="animate-pop absolute right-0 z-50 mt-2 max-h-[70vh] w-52 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-2xl">
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                href={localePath(l, path)}
                hrefLang={LOCALE_INFO[l].hreflang}
                lang={LOCALE_INFO[l].hreflang}
                onClick={() => setOpen(false)}
                aria-current={l === locale ? "true" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  l === locale ? "bg-accent-soft text-accent" : "hover:bg-surface-hover"
                }`}
              >
                <Flag locale={l} />
                {LOCALE_INFO[l].name}
                {l === locale && (
                  <svg viewBox="0 0 24 24" className="ml-auto h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
