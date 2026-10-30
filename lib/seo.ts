import type { Metadata } from "next";
import { SITE_URL } from "../components/site-links";
import type { Pal } from "./breeding";
import { DEFAULT_LOCALE, LOCALES, LOCALE_INFO, fmt, localePath, type Locale } from "./i18n/config";
import en, { type Dictionary } from "./i18n/dictionaries/en";
import { paldeckCode } from "./labels";

export function palTitle(pal: Pal, t: Dictionary = en): string {
  return fmt(t.meta.palTitle, { name: pal.name });
}

export function palDescription(pal: Pal, parentPairCount: number, t: Dictionary = en): string {
  const elements = pal.elements.map((e) => t.elements[e as keyof Dictionary["elements"]]).join("/");
  const intro = fmt(t.meta.palIntro, { name: pal.name, code: paldeckCode(pal), elements });
  if (parentPairCount === 0) return fmt(t.meta.palNone, { intro });
  if (parentPairCount === 1) return fmt(t.meta.palSelf, { intro, name: pal.name, power: pal.breedingPower });
  return fmt(t.meta.palMany, { intro, count: parentPairCount, power: pal.breedingPower });
}

/** Canonical URL plus hreflang links to the same page in every language. `path` is locale-free, e.g. "/pals/". */
export function pageAlternates(path: string, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [LOCALE_INFO[l].hreflang, localePath(l, path)]),
  );
  languages["x-default"] = localePath(DEFAULT_LOCALE, path);
  return { canonical: localePath(locale, path), languages };
}

export interface Breadcrumb {
  name: string;
  path: string;
}

/** BreadcrumbList structured data. Paths are site-relative, e.g. "/pals/". */
export function breadcrumbJsonLd(crumbs: Breadcrumb[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
  // Escape "<" so text can never close the <script> tag
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
