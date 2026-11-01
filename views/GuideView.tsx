import type { Metadata } from "next";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import BreedingCalculator from "@/components/BreedingCalculator";
import PageContent from "@/components/PageContent";
import { faqJsonLd, loadPageContent } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { popularPals } from "@/lib/popular";
import { breadcrumbJsonLd, pageAlternates } from "@/lib/seo";
import { PopularPalCard, SectionHeading } from "./HomeView";

const PATH = "/breeding-guide/";
const POPULAR_COUNT = 10;

export function guideMetadata(locale: Locale): Metadata {
  const { heading, description } = getDictionary(locale).pages.guide;
  return { title: { absolute: heading }, description, alternates: pageAlternates(PATH, locale) };
}

/**
 * The breeding guide: text from content/breeding-guide.md with a table of contents, the breeding
 * calculator after the middle section, guides for the most popular Pals and the FAQ.
 */
export default function GuideView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const href = (path: string) => localePath(locale, path);
  const content = loadPageContent("breeding-guide", locale);
  const middle = Math.floor(content.sections.length / 2);
  const firstHalf = { sections: content.sections.slice(0, middle), faq: [] };
  const secondHalf = { sections: content.sections.slice(middle), faq: [] };
  const faqOnly = { sections: [], faq: content.faq };
  const faqTitle: [string, string] = [t.home.faqTitleA, t.home.faqTitleB];
  const crumbs = [
    { name: t.pal.home, path: href("/") },
    { name: t.pages.guide.title, path: href(PATH) },
  ];
  const toc = [
    ...content.sections.map((s) => ({ href: `#${s.id}`, label: s.heading })),
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
              {t.pages.guide.title}
            </li>
          </ol>
        </nav>
        <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          {t.home.badge}
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t.pages.guide.heading}</h1>
        <p className="text-lg text-muted">{t.pages.guide.description}</p>

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

      <PageContent content={firstHalf} faqTitle={faqTitle} />

      <section id="calculator" className="mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-5">
        <SectionHeading eyebrow={t.home.calcEyebrow} title={t.home.calcTitle} text={t.home.calcText} />
        <BreedingCalculator />
        <Link href={`${href("/")}#reverse`} className="group flex w-fit items-center gap-1.5 text-sm font-semibold text-accent">
          {t.home.ctaFind}
          <ArrowIcon />
        </Link>
      </section>

      <PageContent content={secondHalf} faqTitle={faqTitle} />

      <section className="defer-render mx-auto flex w-full max-w-6xl flex-col gap-5">
        <SectionHeading eyebrow={t.home.popularEyebrow} title={t.home.popularTitle} text={t.home.popularText} />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {popularPals.slice(0, POPULAR_COUNT).map((pal) => (
            <PopularPalCard key={pal.id} pal={pal} locale={locale} t={t} />
          ))}
        </ul>
      </section>

      <div className="defer-render">
        <PageContent content={faqOnly} faqTitle={faqTitle} />
      </div>
    </article>
  );
}
