import { describe, expect, it } from "vitest";
import { getDictionary, LOCALES, fmt, localePath, splitLocale } from "./i18n";
import en from "./i18n/dictionaries/en";
import { pals } from "./breeding";
import { palDescription, palTitle, pageAlternates } from "./seo";

/** Every leaf string of a dictionary, keyed by its dotted path */
function leaves(obj: object, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...leaves(value, path) };
  }, {});
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("i18n paths", () => {
  it("keeps English at the root and prefixes other languages", () => {
    expect(localePath("en", "/pals/")).toBe("/pals/");
    expect(localePath("de", "/pals/")).toBe("/de/pals/");
    expect(localePath("zh-cn", "/")).toBe("/zh-cn/");
  });

  it("splits a locale off a path", () => {
    expect(splitLocale("/ja/pals/anubis/")).toEqual({ locale: "ja", path: "/pals/anubis/" });
    expect(splitLocale("/pals/")).toEqual({ locale: "en", path: "/pals/" });
    expect(splitLocale("/de")).toEqual({ locale: "de", path: "/" });
  });

  it("fills placeholders", () => {
    expect(fmt("{a} + {b}", { a: 1, b: "x" })).toBe("1 + x");
  });

  it("links every language in hreflang alternates", () => {
    const alternates = pageAlternates("/pals/", "fr")!;
    expect(alternates.canonical).toBe("/fr/pals/");
    expect(Object.keys(alternates.languages!)).toHaveLength(LOCALES.length + 1);
    expect(alternates.languages!["x-default" as keyof typeof alternates.languages]).toBe("/pals/");
  });
});

describe("dictionaries", () => {
  const english = leaves(en);

  it.each(LOCALES.filter((l) => l !== "en"))("%s translates every string with the same placeholders", (locale) => {
    const translated = leaves(getDictionary(locale));
    for (const [key, text] of Object.entries(english)) {
      expect(translated[key], key).toBeTruthy();
      expect(placeholders(translated[key]), key).toEqual(placeholders(text));
    }
  });

  it.each(LOCALES)("%s gives Pal pages unique titles and descriptions", (locale) => {
    const t = getDictionary(locale);
    expect(new Set(pals.map((p) => palTitle(p, t))).size).toBe(pals.length);
    expect(new Set(pals.map((p) => palDescription(p, 2 + p.rarity, t))).size).toBe(pals.length);
  });
});
