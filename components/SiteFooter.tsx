import Link from "next/link";
import palsData from "../data/pals.json";
import { fmt, getDictionary, localePath, type Locale } from "../lib/i18n";
import { popularPals } from "../lib/popular";
import ArrowIcon from "./ArrowIcon";
import { Logo } from "./SiteHeader";
import { SITE_NAME, footerLinks, mainLinks } from "./site-links";

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-2.5">
      <h2 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground">
        <span className="btn-primary h-3 w-1 rounded-full" aria-hidden="true" />
        {title}
      </h2>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="w-fit transition hover:translate-x-0.5 hover:text-accent">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function CtaBand({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <div className="relative z-10 mx-auto -mb-16 max-w-6xl px-4">
      <div className="btn-primary relative flex flex-col items-center gap-5 overflow-visible rounded-3xl p-6 text-center shadow-2xl shadow-accent/20 sm:flex-row sm:p-8 sm:pl-56 sm:text-left">
        <div className="bg-dots absolute inset-0 overflow-hidden rounded-3xl opacity-40" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, image is already sized */}
        <img
          src="/img/hatching-egg.webp"
          srcSet="/img/hatching-egg-384.webp 384w, /img/hatching-egg.webp 640w"
          sizes="(min-width: 640px) 192px, 144px"
          alt=""
          aria-hidden="true"
          width={640}
          height={592}
          loading="lazy"
          className="relative w-36 drop-shadow-2xl sm:absolute sm:-top-14 sm:left-6 sm:w-48"
        />
        <div className="relative flex-1">
          <p className="text-2xl font-black text-white sm:text-3xl">{t.footer.ctaTitle}</p>
          <p className="mt-1 text-white/85">{t.footer.ctaText}</p>
        </div>
        <div className="relative flex flex-wrap justify-center gap-2">
          <Link
            href={localePath(locale, "/#reverse")}
            className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:scale-105"
          >
            {t.nav.findParents}
            <ArrowIcon />
          </Link>
          <Link
            href={localePath(locale, "/#calculator")}
            className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            {t.footer.breed2}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const link = (path: string, label: string) => ({ href: localePath(locale, path), label });

  const toolLinks = [
    link("/#calculator", t.footer.breed2),
    link("/#reverse", t.footer.reverse),
    link("/#popular", t.footer.popularPals),
    link("/#unique-combos", t.footer.uniqueCombos),
    link("/pals/", t.footer.paldeck),
  ];
  const guideLinks = popularPals.slice(0, 6).map((pal) => link(`/pals/${pal.slug}/`, fmt(t.home.howToBreed, { name: pal.name })));

  return (
    <footer className="mt-auto pt-24">
      <CtaBand locale={locale} />
      <div className="relative border-t border-line bg-surface pt-24">
        <div className="hero-glow pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-12 text-sm text-muted sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo locale={locale} className="h-14" />
            <p className="max-w-xs leading-relaxed">{t.footer.tagline}</p>
            <span className="flex w-fit items-center gap-2 rounded-full border border-line bg-background/60 px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden="true" />
              {fmt(t.footer.dataBuild, { build: palsData.meta.steamBuildId })}
            </span>
          </div>
          <Column title={t.footer.tools} links={toolLinks} />
          <Column title={t.footer.popularGuides} links={guideLinks} />
          <Column title={t.footer.explore} links={mainLinks.filter((l) => l.href !== "/").map((l) => link(l.href, t.nav[l.key]))} />
          <Column title={t.footer.site} links={footerLinks.map((l) => link(l.href, t.nav[l.key]))} />
        </div>
        <div className="relative h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. {t.footer.madeFor}
          </p>
          <p>{t.footer.trademark}</p>
        </div>
      </div>
    </footer>
  );
}
