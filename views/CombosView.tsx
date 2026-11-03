import type { Metadata } from "next";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import { ElementBadges } from "@/components/ElementBadge";
import PageContent from "@/components/PageContent";
import PalAvatar from "@/components/PalAvatar";
import { getBestCombos, type ComboEntry } from "@/lib/best-combos";
import type { Gender, Pal } from "@/lib/breeding";
import { faqJsonLd, loadPageContent } from "@/lib/content";
import { fmt, getDictionary, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, pageAlternates } from "@/lib/seo";
import { SectionHeading } from "./HomeView";

const PATH = "/breeding-combos/";
const GENDER_SIGN: Record<Gender, string> = { male: "♂", female: "♀" };

export function combosMetadata(locale: Locale): Metadata {
  const { heading, description } = getDictionary(locale).pages.combos;
  return { title: { absolute: heading }, description, alternates: pageAlternates(PATH, locale) };
}

function ComboPal({ pal, gender, href, t }: { pal: Pal; gender: Gender | null; href: string; t: Dictionary }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2 hover:text-accent">
      <PalAvatar pal={pal} size="sm" />
      <span className="truncate text-sm font-semibold">
        {pal.name}
        {gender && (
          <span
            className="ml-1 font-bold"
            style={{ color: gender === "male" ? "var(--male)" : "var(--female)" }}
            aria-label={t.gender[gender]}
          >
            {GENDER_SIGN[gender]}
          </span>
        )}
      </span>
    </Link>
  );
}

function ComboCard({ entry, locale, t }: { entry: ComboEntry; locale: Locale; t: Dictionary }) {
  const palHref = (pal: Pal) => localePath(locale, `/pals/${pal.slug}/`);
  const { child, work } = entry;
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <PalAvatar pal={child} size="md" />
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-bold leading-snug">
            <Link href={palHref(child)} className="hover:text-accent">
              {child.name}
            </Link>
          </h3>
          {work ? (
            <span className="text-xs font-semibold text-gold">
              {fmt(t.bestCombos.bestFor, {
                work: t.work[work.key as keyof Dictionary["work"]] ?? work.key,
                level: work.level,
              })}
            </span>
          ) : (
            <ElementBadges elements={child.elements} />
          )}
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-line rounded-xl bg-surface-2">
        {entry.pairs.map((pair) => (
          <li
            key={`${pair.parentA.id}-${pair.parentAGender}-${pair.parentB.id}-${pair.parentBGender}`}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2"
          >
            <ComboPal pal={pair.parentA} gender={pair.parentAGender} href={palHref(pair.parentA)} t={t} />
            <span className="text-muted" aria-hidden="true">
              +
            </span>
            <ComboPal pal={pair.parentB} gender={pair.parentBGender} href={palHref(pair.parentB)} t={t} />
            <span className="text-muted" aria-hidden="true">
              =
            </span>
            <span className="sr-only">{t.combos.gives}</span>
            <span className="text-sm font-bold">{child.name}</span>
          </li>
        ))}
      </ul>

      <Link href={palHref(child)} className="group mt-auto flex w-fit items-center gap-1.5 text-sm font-semibold text-accent">
        {fmt(t.bestCombos.allPairs, { name: child.name })}
        <ArrowIcon />
      </Link>
    </li>
  );
}

/**
 * The best breeding combos page: intro from content/breeding-combos.md, then the combo lists
 * (worked out on the server from the breeding rules), then the FAQ from the same file.
 */
export default function CombosView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const href = (path: string) => localePath(locale, path);
  const content = loadPageContent("breeding-combos", locale);
  const combos = getBestCombos();
  const faqTitle: [string, string] = [t.home.faqTitleA, t.home.faqTitleB];
  const crumbs = [
    { name: t.pal.home, path: href("/") },
    { name: t.pages.combos.title, path: href(PATH) },
  ];
  const b = t.bestCombos;
  const lists = [
    { id: "combat", title: b.combatTitle, text: b.combatText, entries: combos.combat },
    { id: "mounts", title: b.mountsTitle, text: b.mountsText, entries: combos.mounts },
    { id: "workers", title: b.workersTitle, text: b.workersText, entries: combos.workers },
    { id: "unique", title: b.uniqueTitle, text: b.uniqueText, entries: combos.unique },
  ];
  const toc = [
    ...content.sections.map((s) => ({ href: `#${s.id}`, label: s.heading })),
    ...lists.map((l) => ({ href: `#${l.id}`, label: l.title })),
    ...(content.faq.length > 0 ? [{ href: "#faq", label: t.home.navFaq }] : []),
  ];

  return (
    <article className="flex w-full flex-col gap-16 px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd(crumbs) }} />
      {content.faq.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(content.faq) }} />}

      <header className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <nav aria-label={t.pal.breadcrumb} className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={href("/")} className="hover:text-accent">
                {t.pal.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {t.pages.combos.title}
            </li>
          </ol>
        </nav>
        <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          {t.home.badge}
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t.pages.combos.heading}</h1>
        <p className="text-lg text-muted">{t.pages.combos.description}</p>

        <nav aria-label={t.home.onThisPage} className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">{t.home.onThisPage}</h2>
          <ol className="grid list-decimal gap-x-8 gap-y-1.5 pl-5 text-sm sm:grid-cols-2">
            {toc.map((item) => (
              <li key={item.href} className="marker:text-muted">
                <a href={item.href} className="hover:text-accent">
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <PageContent content={{ sections: content.sections, faq: [] }} faqTitle={faqTitle} />

      {lists.map((list, i) => (
        <section
          key={list.id}
          id={list.id}
          className={`mx-auto flex w-full max-w-6xl scroll-mt-20 flex-col gap-5 ${i > 0 ? "defer-render" : ""}`}
        >
          <SectionHeading eyebrow={t.pages.combos.title} title={list.title} text={list.text} />
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.entries.map((entry) => (
              <ComboCard key={entry.child.id} entry={entry} locale={locale} t={t} />
            ))}
          </ul>
        </section>
      ))}

      <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-xl font-black tracking-tight">{b.ctaTitle}</h2>
        <p className="text-muted">{b.ctaText}</p>
        <div className="flex flex-wrap gap-4">
          <Link href={href("/")} className="group flex items-center gap-1.5 text-sm font-semibold text-accent">
            {t.nav.calculator}
            <ArrowIcon />
          </Link>
          <Link href={href("/breeding-guide/")} className="group flex items-center gap-1.5 text-sm font-semibold text-accent">
            {t.nav.guide}
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {content.faq.length > 0 && (
        <div className="defer-render">
          <PageContent content={{ sections: [], faq: content.faq }} faqTitle={faqTitle} />
        </div>
      )}
    </article>
  );
}
