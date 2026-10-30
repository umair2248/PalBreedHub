import type { Locale } from "./config";
import de from "./dictionaries/de";
import en, { type Dictionary } from "./dictionaries/en";
import es from "./dictionaries/es";
import fr from "./dictionaries/fr";
import it from "./dictionaries/it";
import ja from "./dictionaries/ja";
import ko from "./dictionaries/ko";
import pt from "./dictionaries/pt";
import ru from "./dictionaries/ru";
import zhCN from "./dictionaries/zh-cn";
import zhTW from "./dictionaries/zh-tw";

export * from "./config";
export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  de,
  es,
  fr,
  it,
  ru,
  ja,
  ko,
  pt,
  "zh-tw": zhTW,
  "zh-cn": zhCN,
};

/** Server-side lookup. Client components get their dictionary from I18nProvider instead. */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
