export const LOCALES = ["en", "de", "es", "fr", "it", "ru", "ja", "ko", "pt", "zh-tw", "zh-cn"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales served under a /{locale}/ prefix. English lives at the site root. */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export const LOCALE_INFO: Record<Locale, { name: string; hreflang: string; intl: string }> = {
  en: { name: "English", hreflang: "en", intl: "en-US" },
  de: { name: "Deutsch", hreflang: "de", intl: "de-DE" },
  es: { name: "Español", hreflang: "es", intl: "es-ES" },
  fr: { name: "Français", hreflang: "fr", intl: "fr-FR" },
  it: { name: "Italiano", hreflang: "it", intl: "it-IT" },
  ru: { name: "Русский", hreflang: "ru", intl: "ru-RU" },
  ja: { name: "日本語", hreflang: "ja", intl: "ja-JP" },
  ko: { name: "한국어", hreflang: "ko", intl: "ko-KR" },
  pt: { name: "Português", hreflang: "pt", intl: "pt-BR" },
  "zh-tw": { name: "繁體中文", hreflang: "zh-Hant", intl: "zh-TW" },
  "zh-cn": { name: "简体中文", hreflang: "zh-Hans", intl: "zh-CN" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Site path for a locale: "/pals/" -> "/de/pals/" (English keeps the bare path). */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith("/")) return path;
  return `/${locale}${path}`;
}

/** Splits "/de/pals/" into the locale and the locale-free path "/pals/". */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, path: pathname.slice(first.length + 1) || "/" };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}

/** Fills {placeholders} in a dictionary string. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}
