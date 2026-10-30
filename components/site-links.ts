import type { Dictionary } from "../lib/i18n/dictionaries/en";

export interface SiteLink {
  /** Locale-free path; prefix it with localePath() before linking */
  href: string;
  /** Key of the label in the dictionary's `nav` section */
  key: keyof Dictionary["nav"];
}

export const SITE_NAME = "PalBreedHub";

// Change this to the real domain before launch; it is used in structured data (schema) URLs
export const SITE_URL = "https://palbreedhub.com";

export const mainLinks: SiteLink[] = [
  { href: "/", key: "calculator" },
  { href: "/pals/", key: "pals" },
  { href: "/breeding-guide/", key: "guide" },
  { href: "/passive-skills/", key: "passives" },
  { href: "/tier-list/", key: "tierList" },
];

export const footerLinks: SiteLink[] = [
  { href: "/about/", key: "about" },
  { href: "/contact/", key: "contact" },
  { href: "/privacy-policy/", key: "privacy" },
  { href: "/disclaimer/", key: "disclaimer" },
];
