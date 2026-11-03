// Data for the /breeding-combos/ page. Only call this on the server: it uses getParents(),
// which builds the full parent index on first use.
//
// The Pal picks for combat and mounts are hand-curated (the game data has no combat stats or
// mount flags); every combo shown for them is worked out from the breeding rules, so the
// parents always match the calculator. Base workers are picked from work suitability levels.

import {
  compareByEase,
  getPal,
  getParents,
  getUniqueComboChild,
  getUniqueCombos,
  pals,
  type Pal,
  type ParentPair,
} from "./breeding";

/** Parent pairs shown for each Pal */
export const PAIRS_PER_PAL = 3;

export interface ComboEntry {
  child: Pal;
  /** Easiest parent pairs first, never the Pal with itself */
  pairs: ParentPair[];
  /** Base workers only: the job this Pal is the best breedable pick for, and its level */
  work?: { key: string; level: number };
}

export interface ComboSections {
  combat: ComboEntry[];
  mounts: ComboEntry[];
  workers: ComboEntry[];
  unique: ComboEntry[];
}

// Strongest fighters in 1.0, strongest first
const COMBAT_IDS = [
  "Anubis",
  "KingBahamut",
  "BlackMetalDragon",
  "Umihebi_Fire",
  "LilyQueen_Dark",
  "IceHorse_Dark",
  "Suzaku_Water",
  "DarkScorpion",
  "WingGolem",
  "LotusDragon",
  "Umihebi",
  "HerculesBeetle",
  "LazyDragon_Electric",
  "Manticore_Dark",
];

// Best flying, ground and water mounts
const MOUNT_IDS = [
  "BlackMetalDragon",
  "SkyDragon",
  "RedArmorBird",
  "Suzaku",
  "HadesBird_Electric",
  "BlueThunderHorse",
  "FireKirin",
  "Umihebi",
  "BirdDragon",
  "ThunderBird",
  "FengyunDeeper",
  "AmaterasuWolf",
  "Deer",
  "HawkBird",
];

const UNIQUE_COUNT = 15;

function easiestPairs(pal: Pal): ParentPair[] {
  return getParents(pal)
    .filter((p) => p.parentA.id !== pal.id || p.parentB.id !== pal.id)
    .sort(compareByEase)
    .slice(0, PAIRS_PER_PAL);
}

function entriesFor(ids: string[]): ComboEntry[] {
  return ids
    .map((id) => getPal(id))
    .filter((pal): pal is Pal => Boolean(pal))
    .map((child) => ({ child, pairs: easiestPairs(child) }))
    .filter((entry) => entry.pairs.length > 0);
}

/** For every job, the breedable Pal with the highest level in it (the more common Pal wins ties). */
function workerEntries(): ComboEntry[] {
  const jobs = [...new Set(pals.flatMap((p) => Object.keys(p.workSuitability)))];
  const entries: ComboEntry[] = [];
  for (const key of jobs) {
    const level = (p: Pal) => (p.workSuitability as Record<string, number>)[key] ?? 0;
    const ranked = pals.filter((p) => level(p) > 0).sort((a, b) => level(b) - level(a) || a.rarity - b.rarity);
    for (const child of ranked) {
      const pairs = easiestPairs(child);
      if (pairs.length > 0) {
        entries.push({ child, pairs, work: { key, level: level(child) } });
        break;
      }
    }
  }
  return entries;
}

/** The rarest Pals that come from a unique combo, with the combo that makes them, skipping Pals listed elsewhere. */
function uniqueEntries(skip: Set<string>): ComboEntry[] {
  const byChild = new Map<string, ComboEntry>();
  for (const pair of getUniqueCombos()) {
    const child = getUniqueComboChild(pair);
    if (skip.has(child.id)) continue;
    const entry = byChild.get(child.id) ?? { child, pairs: [] };
    if (entry.pairs.length < PAIRS_PER_PAL) entry.pairs.push(pair);
    byChild.set(child.id, entry);
  }
  return [...byChild.values()]
    .sort((a, b) => b.child.rarity - a.child.rarity || a.child.name.localeCompare(b.child.name))
    .slice(0, UNIQUE_COUNT);
}

let cached: ComboSections | undefined;

export function getBestCombos(): ComboSections {
  if (!cached) {
    const combat = entriesFor(COMBAT_IDS);
    const mounts = entriesFor(MOUNT_IDS);
    const shown = new Set([...combat, ...mounts].map((e) => e.child.id));
    cached = { combat, mounts, workers: workerEntries(), unique: uniqueEntries(shown) };
  }
  return cached;
}
