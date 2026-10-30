import type { Metadata } from "next";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import PageContent from "@/components/PageContent";
import { hasPageContent, loadPageContent } from "@/lib/content";
import { getDictionary, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";

export type InfoPage = keyof Omit<Dictionary["pages"], "comingSoon">;

/** Locale-free path of each info page */
export const INFO_PATHS: Record<InfoPage, string> = {
  about: "/about/",
  guide: "/breeding-guide/",
  passives: "/passive-skills/",
  tierList: "/tier-list/",
  contact: "/contact/",
  privacy: "/privacy-policy/",
  disclaimer: "/disclaimer/",
};

export function infoMetadata(page: InfoPage, locale: Locale): Metadata {
  const { title, description } = getDictionary(locale).pages[page];
  return { title, description, alternates: pageAlternates(INFO_PATHS[page], locale) };
}

/**
 * Renders content/{path}.md (e.g. content/privacy-policy.md) when it exists,
 * otherwise a "Coming soon" placeholder.
 */
export default function InfoView({ page, locale }: { page: InfoPage; locale: Locale }) {
  const t = getDictionary(locale);
  const { title, description } = t.pages[page];
  const contentName = INFO_PATHS[page].replace(/\//g, "");

  if (hasPageContent(contentName)) {
    return (
      <div className="w-full px-4 py-16">
        <header className="mx-auto mb-12 flex max-w-3xl flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="text-lg text-muted">{description}</p>
        </header>
        <PageContent content={loadPageContent(contentName, locale)} faqTitle={[t.home.faqTitleA, t.home.faqTitleB]} />
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-16">
      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
        {t.pages.comingSoon}
      </span>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-lg text-muted">{description}</p>
      <Link href={localePath(locale, "/")} className="group mt-2 flex items-center gap-2 font-medium text-accent">
        <ArrowIcon direction="left" />
        {t.pal.back}
      </Link>
    </section>
  );
}
