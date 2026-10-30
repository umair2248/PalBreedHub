"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, localePath, type Locale } from "../lib/i18n/config";
import en, { type Dictionary } from "../lib/i18n/dictionaries/en";

const I18nContext = createContext<{ locale: Locale; t: Dictionary }>({ locale: DEFAULT_LOCALE, t: en });

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: dict }}>{children}</I18nContext.Provider>;
}

/** The current locale, its dictionary and a helper for locale-prefixed links. English outside a provider (tests). */
export function useI18n() {
  const { locale, t } = useContext(I18nContext);
  return { locale, t, href: (path: string) => localePath(locale, path) };
}
