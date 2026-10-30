export interface SiteLink {
  href: string;
  label: string;
}

export const SITE_NAME = "PalBreedHub";

export const mainLinks: SiteLink[] = [
  { href: "/", label: "Breeding Calculator" },
  { href: "/pals/", label: "Pals" },
  { href: "/breeding-guide/", label: "Breeding Guide" },
  { href: "/passive-skills/", label: "Passive Skills" },
  { href: "/tier-list/", label: "Tier List" },
];

export const footerLinks: SiteLink[] = [
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
  { href: "/privacy-policy/", label: "Privacy Policy" },
  { href: "/disclaimer/", label: "Disclaimer" },
];
