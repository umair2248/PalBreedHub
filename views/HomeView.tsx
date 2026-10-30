import type { Metadata } from "next";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import BreedingCalculator from "@/components/BreedingCalculator";
import PageContent from "@/components/PageContent";
import PalAvatar from "@/components/PalAvatar";
import RarityBadge from "@/components/RarityBadge";
import ReverseCalculator from "@/components/ReverseCalculator";
import UniqueComboList from "@/components/UniqueComboList";
import { SITE_NAME, SITE_URL } from "@/components/site-links";
import { canBreed, getChild, getPal, getParents, getUniqueCombos, pals, type Pal } from "@/lib/breeding";
import { faqJsonLd, loadPageContent } from "@/lib/content";
import { LOCALE_INFO, fmt, getDictionary, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { easiestPair, popularPals } from "@/lib/popular";
import { pageAlternates } from "@/lib/seo";

export function homeMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    title: { absolute: t.meta.homeTitle },
    description: t.meta.homeDescription,
    alternates: pageAlternates("/", locale),
    openGraph: { title: t.meta.homeTitle, description: t.meta.homeDescription, locale: LOCALE_INFO[locale].intl.replace("-", "_") },
  };
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-widest text-accent">{eyebrow}</span>
      <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
      <p className="max-w-3xl text-muted">{text}</p>
    </div>
  );
}

function PopularPalCard({ pal, locale, t }: { pal: Pal; locale: Locale; t: Dictionary }) {
  const pair = easiestPair(pal);
  return (
    <li>
      <Link
        href={localePath(locale, `/pals/${pal.slug}/`)}
        className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_14px_40px_-20px_var(--glow)]"
      >
        <div className="flex items-center gap-3">
          <PalAvatar pal={pal} size="md" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="font-bold leading-snug group-hover:text-accent">{fmt(t.home.howToBreed, { name: pal.name })}</h3>
            <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <RarityBadge rarity={pal.rarity} />
              {fmt(t.home.pairCount, { count: getParents(pal).length })}
            </span>
          </div>
        </div>
        <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm">
          <span className="text-muted">{pair ? t.home.easiest : t.home.onlyFrom} </span>
          <span className="font-semibold">{pair ? `${pair.parentA.name} + ${pair.parentB.name}` : `2 × ${pal.name}`}</span>
        </p>
        <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-accent">
          {t.home.fullGuide}
          <ArrowIcon />
        </span>
      </Link>
    </li>
  );
}

function HowItWorks({ t }: { t: Dictionary }) {
  const a = getPal("SheepBall")!;
  const b = getPal("PinkCat")!;
  const child = getChild(a, b)!;
  const target = Math.floor((a.breedingPower + b.breedingPower + 1) / 2);
  const steps = [
    { title: t.home.step1Title, text: t.home.step1Text },
    { title: t.home.step2Title, text: t.home.step2Text },
    { title: t.home.step3Title, text: t.home.step3Text },
  ];

  return (
    <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative mx-auto w-full max-w-md">
        <div className="hero-glow absolute inset-0 rounded-full blur-2xl" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, image is already sized */}
        <img
          src="/img/breeding-flow.webp"
          alt=""
          aria-hidden="true"
          width={720}
          height={743}
          loading="lazy"
          className="relative w-full drop-shadow-[0_20px_50px_var(--glow)]"
        />
      </div>

      <div className="flex flex-col gap-4">
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
              <span className="btn-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="panel flex flex-col gap-4 p-5">
          <h3 className="text-lg font-bold">{t.home.formulaTitle}</h3>
          <div className="flex items-center justify-between gap-2 text-center text-sm">
            {[a, b].map((pal, i) => (
              <div key={pal.id} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted">+</span>}
                <div className="flex flex-col items-center gap-1">
                  <PalAvatar pal={pal} size="md" />
                  <span className="font-semibold">{pal.name}</span>
                  <span className="font-mono text-xs text-muted">{pal.breedingPower}</span>
                </div>
              </div>
            ))}
            <span className="text-muted">=</span>
            <div className="flex flex-col items-center gap-1">
              <PalAvatar pal={child} size="md" />
              <span className="font-semibold">{child.name}</span>
              <span className="font-mono text-xs text-muted">{child.breedingPower}</span>
            </div>
          </div>
          <p className="rounded-xl bg-surface-2 p-3 font-mono text-sm">
            ({a.breedingPower} + {b.breedingPower} + 1) ÷ 2 = <span className="font-bold text-accent">{target}</span>
          </p>
          <p className="text-sm text-muted">{fmt(t.home.formulaText, { target })}</p>
        </div>
      </div>
    </div>
  );
}

function webAppJsonLd(locale: Locale, t: Dictionary): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${SITE_NAME} - ${t.home.h1a} ${t.home.h1b}`,
    url: `${SITE_URL}${localePath(locale, "/")}`,
    inLanguage: LOCALE_INFO[locale].hreflang,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: t.meta.homeDescription,
  };
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export default function HomeView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const content = loadPageContent("home", locale);
  const breedable = pals.filter(canBreed).length;
  const number = new Intl.NumberFormat(LOCALE_INFO[locale].intl);
  const stats = [
    { value: pals.length, label: t.home.statPals },
    { value: getUniqueCombos().length, label: t.home.statCombos },
    { value: number.format((breedable * (breedable + 1)) / 2), label: t.home.statPairs },
    { value: "1.0", label: t.home.statVersion },
  ];
  const sections = [
    { href: "#calculator", label: t.home.navBreed },
    { href: "#reverse", label: t.home.navFind },
    { href: "#popular", label: t.home.navPopular },
    { href: "#how-it-works", label: t.home.navHow },
    { href: "#unique-combos", label: t.home.navUnique },
    { href: "#faq", label: t.home.navFaq },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webAppJsonLd(locale, t) }} />

      <div className="relative overflow-hidden">
        <div className="hero-glow absolute inset-0" aria-hidden="true" />
        <div className="bg-dots absolute inset-0" aria-hidden="true" />
        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pb-10 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <span className="flex w-fit items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden="true" />
              {t.home.badge}
            </span>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              {t.home.h1a} <span className="text-gradient">{t.home.h1b}</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted">{fmt(t.home.intro, { count: pals.length })}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#calculator"
                className="btn-primary group flex items-center gap-2 rounded-xl px-6 py-3 font-bold shadow-lg shadow-accent/25 transition hover:scale-[1.03]"
              >
                {t.home.ctaBreed}
                <ArrowIcon />
              </Link>
              <Link
                href="#reverse"
                className="rounded-xl border border-line-strong bg-surface/70 px-6 py-3 font-bold backdrop-blur transition hover:border-accent hover:text-accent"
              >
                {t.home.ctaFind}
              </Link>
            </div>
            <dl className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse rounded-2xl border border-line bg-surface/70 px-4 py-3 backdrop-blur">
                  <dt className="text-xs font-medium text-muted">{s.label}</dt>
                  <dd className="text-gradient text-2xl font-black">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="hero-glow absolute inset-8 rounded-full blur-3xl" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, image is already sized */}
            <img
              src="/img/breeding-pair.webp"
              alt=""
              aria-hidden="true"
              width={960}
              height={577}
              fetchPriority="high"
              className="relative mx-auto w-full max-w-xl drop-shadow-[0_24px_60px_var(--glow)]"
            />
          </div>
        </section>

        <nav aria-label={t.home.onThisPage} className="relative mx-auto max-w-6xl px-4 pb-6">
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((s) => (
              <li key={s.href} className="shrink-0">
                <Link
                  href={s.href}
                  className="block rounded-full border border-line bg-surface/70 px-4 py-1.5 text-sm font-semibold text-muted backdrop-blur transition hover:border-accent hover:text-accent"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-10">
        <div id="calculator" className="flex scroll-mt-32 flex-col gap-5">
          <SectionHeading eyebrow={t.home.calcEyebrow} title={t.home.calcTitle} text={t.home.calcText} />
          <BreedingCalculator />
        </div>

        <div id="reverse" className="flex scroll-mt-32 flex-col gap-5">
          <SectionHeading eyebrow={t.home.reverseEyebrow} title={t.home.reverseTitle} text={t.home.reverseText} />
          <ReverseCalculator />
        </div>

        <div id="popular" className="flex scroll-mt-32 flex-col gap-5">
          <SectionHeading eyebrow={t.home.popularEyebrow} title={t.home.popularTitle} text={t.home.popularText} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popularPals.map((pal) => (
              <PopularPalCard key={pal.id} pal={pal} locale={locale} t={t} />
            ))}
          </ul>
          <Link href={localePath(locale, "/pals/")} className="group mx-auto flex items-center gap-1.5 text-sm font-semibold text-accent">
            {fmt(t.home.browseAll, { count: pals.length })}
            <ArrowIcon />
          </Link>
        </div>

        <div id="how-it-works" className="flex scroll-mt-32 flex-col gap-5">
          <SectionHeading eyebrow={t.home.howEyebrow} title={t.home.howTitle} text={t.home.howText} />
          <HowItWorks t={t} />
        </div>

        <div id="unique-combos" className="flex scroll-mt-32 flex-col gap-5">
          <SectionHeading eyebrow={t.home.uniqueEyebrow} title={t.home.uniqueTitle} text={t.home.uniqueText} />
          <UniqueComboList />
        </div>

        <div className="border-t border-line pt-16">
          <PageContent content={content} faqTitle={[t.home.faqTitleA, t.home.faqTitleB]} />
        </div>

        {content.faq.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(content.faq) }} />
        )}
      </section>
    </>
  );
}
