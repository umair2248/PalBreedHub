import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArrowIcon from "@/components/ArrowIcon";
import { ElementBadges } from "@/components/ElementBadge";
import PalAvatar from "@/components/PalAvatar";
import PalCard from "@/components/PalCard";
import PageContent from "@/components/PageContent";
import { PalName } from "@/components/PairRow";
import ParentPairs, { type PairRef } from "@/components/ParentPairs";
import RarityBadge from "@/components/RarityBadge";
import { canBreed, compareByEase, getOffspring, getPal, getParents, orientPair, pals, type Pal } from "@/lib/breeding";
import { faqJsonLd, loadPalContent } from "@/lib/content";
import { fmt, getDictionary, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { paldeckCode } from "@/lib/labels";
import { buildPalProfile } from "@/lib/pal-profile";
import { easiestPair } from "@/lib/popular";
import { breadcrumbJsonLd, pageAlternates, palDescription, palTitle } from "@/lib/seo";

const PARTNERS_SHOWN = 3;
const RELATED_COUNT = 6;

export function palMetadata(slug: string, locale: Locale): Metadata {
  const pal = getPal(slug);
  if (!pal) return {};
  const t = getDictionary(locale);
  return {
    title: { absolute: palTitle(pal, t) },
    description: palDescription(pal, getParents(pal).length, t),
    alternates: pageAlternates(`/pals/${pal.slug}/`, locale),
  };
}

/** Other forms of the same Pal first, then the Pals with the closest breeding power. */
function getRelatedPals(pal: Pal): Pal[] {
  const variants = pals.filter((p) => p.id !== pal.id && p.paldeckNumber === pal.paldeckNumber);
  const nearest = pals
    .filter((p) => p.id !== pal.id && p.paldeckNumber !== pal.paldeckNumber)
    .sort((a, b) => Math.abs(a.breedingPower - pal.breedingPower) - Math.abs(b.breedingPower - pal.breedingPower))
    .slice(0, RELATED_COUNT);
  return [...variants, ...nearest];
}

function howToBreedIntro(pal: Pal, pairCount: number, t: Dictionary): string {
  if (!canBreed(pal)) return fmt(t.pal.introNone, { name: pal.name });
  if (pairCount === 1) return fmt(t.pal.introSelf, { name: pal.name });
  return fmt(t.pal.introMany, { name: pal.name, count: pairCount });
}

export default function PalView({ slug, locale }: { slug: string; locale: Locale }) {
  const pal = getPal(slug);
  if (!pal) notFound();

  const t = getDictionary(locale);
  const href = (path: string) => localePath(locale, path);
  const pairs: PairRef[] = getParents(pal)
    .map((p) => orientPair(p, null))
    .sort(compareByEase)
    .map((p) => [p.parentA.id, p.parentAGender, p.parentB.id, p.parentBGender]);
  const pairCount = pairs.length;
  const offspring = getOffspring(pal);
  const related = getRelatedPals(pal);
  const easiest = easiestPair(pal);
  const profile = buildPalProfile({ pal, pairCount, easiest, offspringCount: offspring.length }, t, locale);
  const custom = loadPalContent(pal.slug, locale);
  const faqTitle: [string, string] = [t.home.faqTitleA, t.home.faqTitleB];
  const work = Object.entries(pal.workSuitability);
  const crumbs = [
    { name: t.pal.home, path: href("/") },
    { name: t.nav.pals, path: href("/pals/") },
    { name: pal.name, path: href(`/pals/${pal.slug}/`) },
  ];

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd(crumbs) }} />
      {custom && custom.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(custom.faq) }} />
      )}

      <div className="flex flex-col gap-4">
        <nav aria-label={t.pal.breadcrumb} className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            {crumbs.map((crumb, i) => (
              <li key={crumb.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i < crumbs.length - 1 ? (
                  <Link href={crumb.path} className="hover:text-accent">
                    {crumb.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-foreground">
                    {crumb.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="panel relative flex flex-col gap-5 overflow-hidden p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="relative">
            <PalAvatar pal={pal} size="xl" />
          </div>
          <div className="relative flex flex-col gap-2">
            <span className="font-mono text-sm text-muted">{paldeckCode(pal)}</span>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{pal.name}</h1>
            <span className="flex flex-wrap items-center gap-1.5">
              <ElementBadges elements={pal.elements} />
              <RarityBadge rarity={pal.rarity} />
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <section id="about" className="flex scroll-mt-32 flex-col gap-3">
            <h2 className="text-2xl font-black tracking-tight">{fmt(t.pal.aboutTitle, { name: pal.name })}</h2>
            {custom?.introHtml ? (
              <div className="rich-text text-muted" dangerouslySetInnerHTML={{ __html: custom.introHtml }} />
            ) : (
              profile.paragraphs.map((text) => (
                <p key={text} className="text-muted">
                  {text}
                </p>
              ))
            )}
          </section>

          <section id="quick-facts" className="flex scroll-mt-32 flex-col gap-3">
            <h2 className="text-2xl font-black tracking-tight">{t.pal.factsTitle}</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {profile.facts.map((fact) => (
                    <tr key={fact.label}>
                      <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-medium text-muted">
                        {fact.label}
                      </th>
                      <td className="px-4 py-2.5 font-semibold">{fact.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {work.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">{t.pal.work}</h2>
            <ul className="flex flex-wrap gap-2">
              {work.map(([key, level]) => (
                <li key={key} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">
                  {t.work[key as keyof Dictionary["work"]] ?? key}{" "}
                  <span className="font-semibold text-accent">{fmt(t.pal.level, { level })}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <section id="how-to-breed" className="flex scroll-mt-32 flex-col gap-3">
        <h2 className="text-2xl font-black tracking-tight">{fmt(t.pal.howTitle, { name: pal.name })}</h2>
        <p className="text-muted">{howToBreedIntro(pal, pairCount, t)}</p>
        {canBreed(pal) && pairCount > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-accent/60 bg-accent-soft p-4 sm:p-5" data-testid="easiest-pair">
            <h3 className="text-lg font-bold">{fmt(t.pal.easiestTitle, { name: pal.name })}</h3>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
              <PalName pal={easiest?.parentA ?? pal} gender={easiest?.parentAGender ?? null} />
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-sm font-bold text-muted max-sm:ml-3"
                aria-hidden="true"
              >
                +
              </span>
              <PalName pal={easiest?.parentB ?? pal} gender={easiest?.parentBGender ?? null} />
            </div>
            <p className="text-sm text-muted">
              {easiest ? fmt(t.pal.easiestText, { count: pairCount }) : fmt(t.pal.easiestSelf, { name: pal.name })}
            </p>
          </div>
        )}
        {pairCount > 0 && <ParentPairs pairs={pairs} />}
      </section>

      {custom && custom.sections.length > 0 && <PageContent content={{ sections: custom.sections, faq: [] }} faqTitle={faqTitle} />}

      {offspring.length > 0 && (
        <section id="what-it-breeds" className="defer-render flex scroll-mt-32 flex-col gap-3">
          <h2 className="text-2xl font-black tracking-tight">{fmt(t.pal.breedsTitle, { name: pal.name })}</h2>
          <p className="text-muted">{fmt(t.pal.breedsText, { name: pal.name, count: offspring.length })}</p>
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface" data-testid="offspring">
            {offspring.map(({ child, partners }) => (
              <li
                key={child.id}
                className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <PalName pal={child} gender={null} />
                <span className="text-sm text-muted sm:text-right">
                  {t.pal.with}{" "}
                  {partners.slice(0, PARTNERS_SHOWN).map(({ partner, partnerGender }, i) => (
                    <span key={`${partner.id}-${partnerGender}`}>
                      {i > 0 && ", "}
                      <Link href={href(`/pals/${partner.slug}/`)} className="text-foreground hover:text-accent">
                        {partner.name}
                      </Link>
                      {partnerGender && (partnerGender === "male" ? " ♂" : " ♀")}
                    </span>
                  ))}
                  {partners.length > PARTNERS_SHOWN && ` ${fmt(t.pal.more, { count: partners.length - PARTNERS_SHOWN })}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {custom && custom.faq.length > 0 && <PageContent content={{ sections: [], faq: custom.faq }} faqTitle={faqTitle} />}

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-black tracking-tight">{t.pal.related}</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {related.map((p) => (
            <li key={p.id}>
              <PalCard pal={p} />
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label={t.pal.learnMore} className="flex flex-col gap-3">
        <h2 className="text-2xl font-black tracking-tight">{t.pal.learnMore}</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { path: "/#calculator", label: t.nav.calculator },
            { path: "/breeding-guide/", label: t.nav.guide },
            { path: "/breeding-combos/", label: t.nav.combos },
          ].map((item) => (
            <li key={item.path}>
              <Link
                href={href(item.path)}
                className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 font-semibold transition hover:border-accent hover:text-accent"
              >
                {item.label}
                <ArrowIcon />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Link
        href={href("/#reverse")}
        className="btn-primary group flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg hover:opacity-90"
      >
        <ArrowIcon direction="left" />
        {t.pal.back}
      </Link>
    </article>
  );
}
