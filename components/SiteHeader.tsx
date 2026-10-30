import Link from "next/link";
import { getUniqueCombos, pals } from "../lib/breeding";
import { fmt, getDictionary, localePath, type Locale } from "../lib/i18n";
import ArrowIcon from "./ArrowIcon";
import { DesktopNav, HeaderActions } from "./SiteNav";
import { SITE_NAME } from "./site-links";

export function Logo({ locale, className = "h-11 sm:h-12" }: { locale: Locale; className?: string }) {
  return (
    <Link href={localePath(locale, "/")} className="group flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, image is already sized */}
      <img
        src="/logo.webp"
        alt={SITE_NAME}
        width={439}
        height={120}
        className={`w-auto transition duration-300 group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_14px_var(--glow)] ${className}`}
      />
    </Link>
  );
}

function AnnouncementBar({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <div className="btn-primary relative overflow-hidden text-xs font-semibold sm:text-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center max-sm:flex-col">
        <span>
          <span aria-hidden="true">🥚 </span>
          {fmt(t.nav.announcement, { pals: pals.length, combos: getUniqueCombos().length })}
        </span>
        <Link
          href={localePath(locale, "/#unique-combos")}
          className="group flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 font-bold transition hover:bg-white/30"
        >
          {t.nav.seeCombos}
          <ArrowIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <>
      <AnnouncementBar locale={locale} />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="relative mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 md:justify-between">
          <Logo locale={locale} />
          <HeaderActions />
        </div>
        <div className="h-px bg-line lg:hidden" aria-hidden="true" />
        <div className="hidden border-t border-line/60 lg:block">
          <DesktopNav />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden="true" />
      </header>
    </>
  );
}
