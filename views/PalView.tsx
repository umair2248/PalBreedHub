import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArrowIcon from "@/components/ArrowIcon";
import { ElementBadges } from "@/components/ElementBadge";
import PalAvatar from "@/components/PalAvatar";
import PalCard from "@/components/PalCard";
import { PalName } from "@/components/PairRow";
import ParentPairs, { type PairRef } from "@/components/ParentPairs";
import RarityBadge from "@/components/RarityBadge";
import { canBreed, compareByEase, getOffspring, getPal, getParents, orientPair, pals, type Pal } from "@/lib/breeding";
import { fmt, getDictionary, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { paldeckCode } from "@/lib/labels";
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
  const work = Object.entries(pal.workSuitability);
  const crumbs = [
    { name: t.pal.home, path: href("/") },
    { name: t.nav.pals, path: href("/pals/") },
    { name: pal.name, path: href(`/pals/${pal.slug}/`) },
  ];

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd(crumbs) }} />

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

        <dl className="grid grid-cols-3 gap-3">
          {[
            [t.pal.breedingPower, pal.breedingPower],
            [t.pal.rarity, pal.rarity],
            [t.pal.parentPairs, pairCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-gradient text-2xl font-black">{value}</dd>
            </div>
          ))}
        </dl>

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
        {pairCount > 0 && <ParentPairs pairs={pairs} />}
      </section>

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
