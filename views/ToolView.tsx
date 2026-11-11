import type { Metadata } from "next";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import BreedingChart from "@/components/BreedingChart";
import BreedingPathFinder from "@/components/BreedingPathFinder";
import PageContent from "@/components/PageContent";
import { faqJsonLd, loadPageContent } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, pageAlternates } from "@/lib/seo";
import { INFO_PATHS } from "./InfoView";

export type ToolPage = "chart" | "path";

const TOOLS: Record<ToolPage, { content: string; tool: () => React.ReactNode }> = {
  chart: { content: "breeding-chart", tool: () => <BreedingChart /> },
  path: { content: "breeding-path", tool: () => <BreedingPathFinder /> },
};

export function toolMetadata(page: ToolPage, locale: Locale): Metadata {
  const { heading, description } = getDictionary(locale).pages[page];
  return { title: { absolute: heading }, description, alternates: pageAlternates(INFO_PATHS[page], locale) };
}

/**
 * A page built around an interactive tool (breeding chart, path finder): heading, the tool,
 * then the explanation and FAQ from content/{name}.md.
 */
export default function ToolView({ page, locale }: { page: ToolPage; locale: Locale }) {
  const t = getDictionary(locale);
  const href = (path: string) => localePath(locale, path);
  const { title, heading, description } = t.pages[page];
  const content = loadPageContent(TOOLS[page].content, locale);
  const faqTitle: [string, string] = [t.home.faqTitleA, t.home.faqTitleB];
  const crumbs = [
    { name: t.pal.home, path: href("/") },
    { name: title, path: href(INFO_PATHS[page]) },
  ];

  return (
    <article className="flex w-full flex-col gap-12 px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd(crumbs) }} />
      {content.faq.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(content.faq) }} />}

      <header className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <nav aria-label={t.pal.breadcrumb} className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={href("/")} className="hover:text-accent">
                {t.pal.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {title}
            </li>
          </ol>
        </nav>
        <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          {t.home.badge}
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{heading}</h1>
        <p className="max-w-3xl text-lg text-muted">{description}</p>
      </header>

      <div className="mx-auto w-full max-w-7xl">{TOOLS[page].tool()}</div>

      <PageContent content={content} faqTitle={faqTitle} />

      <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-xl font-black tracking-tight">{t.bestCombos.ctaTitle}</h2>
        <p className="text-muted">{t.bestCombos.ctaText}</p>
        <div className="flex flex-wrap gap-4">
          <Link href={href("/")} className="group flex items-center gap-1.5 text-sm font-semibold text-accent">
            {t.nav.calculator}
            <ArrowIcon />
          </Link>
          {(["chart", "path"] as const)
            .filter((p) => p !== page)
            .map((p) => (
              <Link key={p} href={href(INFO_PATHS[p])} className="group flex items-center gap-1.5 text-sm font-semibold text-accent">
                {t.nav[p]}
                <ArrowIcon />
              </Link>
            ))}
          <Link href={href("/breeding-guide/")} className="group flex items-center gap-1.5 text-sm font-semibold text-accent">
            {t.nav.guide}
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </article>
  );
}
