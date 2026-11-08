// Builds the data-driven text for a Pal page: a 2-3 paragraph intro and a "Quick facts" table.
// Every sentence comes from the Pal's own numbers, so no two Pal pages read the same.

import { canBreed, isUniqueCombo, pals, type Gender, type Pal, type ParentPair } from "./breeding";
import { fmt, LOCALE_INFO, type Dictionary, type Locale } from "./i18n";
import { paldeckCode, rarityTier, WORK_LABELS } from "./labels";

type WorkKey = keyof Dictionary["work"];

export interface PalProfileInput {
  pal: Pal;
  /** Number of parent pairs that breed this Pal (including the Pal with itself) */
  pairCount: number;
  /** The easiest pair that isn't the Pal with itself, or null */
  easiest: ParentPair | null;
  /** How many different Pals this Pal can breed as a parent */
  offspringCount: number;
}

export interface PalProfile {
  paragraphs: string[];
  facts: { label: string; value: string }[];
}

const WORK_ORDER = Object.keys(WORK_LABELS);
const NO_SPACE_LOCALES = new Set<Locale>(["ja", "zh-cn", "zh-tw"]);

/** Work skills, highest level first; equal levels keep the in-game order. */
export function sortedWork(pal: Pal): [WorkKey, number][] {
  return (Object.entries(pal.workSuitability) as [WorkKey, number][]).sort(
    ([a, levelA], [b, levelB]) => levelB - levelA || WORK_ORDER.indexOf(a) - WORK_ORDER.indexOf(b),
  );
}

/** Share of all other Pals (0-100) with a higher and a lower breeding power than this Pal. */
export function powerPercentiles(pal: Pal): { higher: number; lower: number } {
  const share = (test: (p: Pal) => boolean) =>
    Math.round((100 * pals.filter((p) => p.id !== pal.id && test(p)).length) / (pals.length - 1));
  return {
    higher: share((p) => p.breedingPower > pal.breedingPower),
    lower: share((p) => p.breedingPower < pal.breedingPower),
  };
}

/** The base form for variants like "Fuack Ignis", or null. */
export function baseForm(pal: Pal): Pal | null {
  if (!pal.paldeckSuffix) return null;
  return pals.find((p) => p.paldeckNumber === pal.paldeckNumber && !p.paldeckSuffix) ?? null;
}

function listFormat(locale: Locale, items: string[]): string {
  return new Intl.ListFormat(LOCALE_INFO[locale].intl, { style: "long", type: "conjunction" }).format(items);
}

function withGender(name: string, gender: Gender | null, t: Dictionary): string {
  return gender ? `${name} (${t.gender[gender]})` : name;
}

export function pairLabel(pair: ParentPair, t: Dictionary): string {
  return `${withGender(pair.parentA.name, pair.parentAGender, t)} + ${withGender(pair.parentB.name, pair.parentBGender, t)}`;
}

export function buildPalProfile({ pal, pairCount, easiest, offspringCount }: PalProfileInput, t: Dictionary, locale: Locale): PalProfile {
  const p = t.pal;
  const name = pal.name;
  const elements = listFormat(locale, pal.elements.map((e) => t.elements[e as keyof Dictionary["elements"]] ?? e));
  const tier = t.rarity[rarityTier(pal.rarity)];
  const work = sortedWork(pal);
  const workLabel = (key: WorkKey) => t.work[key] ?? key;
  const share = powerPercentiles(pal);

  // 1. What the Pal is
  const first = [fmt(p.introElements, { name, elements, code: paldeckCode(pal) })];
  const base = baseForm(pal);
  if (base) first.push(fmt(p.introVariant, { base: base.name }));
  first.push(fmt(p.introRarity, { rarity: pal.rarity, tier }));
  first.push(
    share.higher >= share.lower
      ? fmt(p.introPowerRare, { power: pal.breedingPower, percent: share.higher })
      : fmt(p.introPowerCommon, { power: pal.breedingPower, percent: share.lower }),
  );

  // 2. What it is good for
  const second: string[] = [];
  if (work.length === 0) {
    second.push(fmt(p.introNoWork, { name }));
  } else {
    const [bestKey, bestLevel] = work[0];
    second.push(fmt(p.introBestWork, { work: workLabel(bestKey), level: bestLevel }));
    const others = work.slice(1).map(([key, level]) => `${workLabel(key)} (${fmt(p.level, { level })})`);
    if (others.length > 0) second.push(fmt(p.introOtherWork, { list: listFormat(locale, others) }));
    second.push(fmt(p.introGoodFor, { use: p.workUse[bestKey] }));
  }

  // 3. How to breed it
  const third: string[] = [];
  if (!canBreed(pal)) {
    third.push(fmt(p.introNoBreed, { name }));
  } else if (!easiest) {
    third.push(fmt(p.introSelfOnly, { name }));
  } else {
    third.push(fmt(p.introEasiest, { name, pair: pairLabel(easiest, t), count: pairCount }));
    if (isUniqueCombo(easiest.parentA, easiest.parentB)) third.push(p.introUnique);
  }
  if (offspringCount > 0) third.push(fmt(p.introOffspring, { name, count: offspringCount }));

  const bestWork = work.length > 0 ? `${workLabel(work[0][0])} (${fmt(p.level, { level: work[0][1] })})` : p.none;
  const easiestValue = !canBreed(pal) ? p.none : easiest ? pairLabel(easiest, t) : `${name} + ${name}`;

  return {
    // Japanese and Chinese don't put spaces between sentences
    paragraphs: [first, second, third].map((sentences) => sentences.join(NO_SPACE_LOCALES.has(locale) ? "" : " ")),
    facts: [
      { label: p.factPaldeck, value: paldeckCode(pal) },
      { label: p.factElements, value: elements },
      { label: p.rarity, value: `${pal.rarity} (${tier})` },
      { label: p.breedingPower, value: String(pal.breedingPower) },
      { label: p.factBestWork, value: bestWork },
      { label: p.parentPairs, value: String(pairCount) },
      { label: p.factEasiest, value: easiestValue },
      { label: p.factChildren, value: String(offspringCount) },
    ],
  };
}
