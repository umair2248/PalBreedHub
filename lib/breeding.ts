// Palworld breeding logic.
//
// How the game picks a child:
//   1. Two of the same Pal always make that Pal.
//   2. Some parent pairs have a fixed result (data/unique-combos.json), a few only for certain genders.
//   3. Otherwise: target = floor((powerA + powerB + 1) / 2), and the child is the Pal whose
//      breedingPower is closest to the target. On a tie, the Pal with the higher breedingPower wins.
//      Pals that only come from unique combos or self-breeding are never picked by this rule.

import palsData from "../data/pals.json";
import combosData from "../data/unique-combos.json";

export type Gender = "male" | "female";

export type Pal = (typeof palsData.pals)[number];

export interface ParentGenders {
  parentA?: Gender;
  parentB?: Gender;
}

export interface BreedingOutcome {
  child: Pal;
  /** null means either gender gives this result */
  parentAGender: Gender | null;
  parentBGender: Gender | null;
}

export interface ParentPair {
  parentA: Pal;
  parentB: Pal;
  /** null means either gender works */
  parentAGender: Gender | null;
  parentBGender: Gender | null;
}

interface UniqueCombo {
  parentA: string;
  parentAGender: Gender | null;
  parentB: string;
  parentBGender: Gender | null;
  child: string;
}

export const pals: Pal[] = palsData.pals;
const combos = combosData.combos as UniqueCombo[];

const palById = new Map(pals.map((p) => [p.id, p]));
const palBySlug = new Map(pals.map((p) => [p.slug, p]));
const notBreedable = new Set(combosData.notBreedable);

// Pals the breeding-power formula is never allowed to return
const formulaExcluded = new Set([...combos.map((c) => c.child), ...combosData.selfBreedOnly, ...notBreedable]);

// Highest breedingPower first, so the first Pal found at the smallest distance wins ties
const formulaCandidates = pals
  .filter((p) => !formulaExcluded.has(p.id))
  .sort((a, b) => b.breedingPower - a.breedingPower);

const ALL_GENDERS: Gender[] = ["male", "female"];

export function getPal(idOrSlug: string): Pal | undefined {
  return palById.get(idOrSlug) ?? palBySlug.get(idOrSlug);
}

export function canBreed(pal: Pal): boolean {
  return !notBreedable.has(pal.id);
}

function genderMatches(required: Gender | null, actual: Gender | undefined): boolean {
  return required === null || required === actual;
}

function findUniqueCombo(a: Pal, b: Pal, genders: ParentGenders): UniqueCombo | undefined {
  return combos.find(
    (c) =>
      (c.parentA === a.id &&
        c.parentB === b.id &&
        genderMatches(c.parentAGender, genders.parentA) &&
        genderMatches(c.parentBGender, genders.parentB)) ||
      (c.parentA === b.id &&
        c.parentB === a.id &&
        genderMatches(c.parentAGender, genders.parentB) &&
        genderMatches(c.parentBGender, genders.parentA)),
  );
}

const childByTarget = new Map<number, Pal>();

function getFormulaChild(a: Pal, b: Pal): Pal {
  const target = Math.floor((a.breedingPower + b.breedingPower + 1) / 2);
  let child = childByTarget.get(target);
  if (!child) {
    let bestDistance = Infinity;
    for (const pal of formulaCandidates) {
      const distance = Math.abs(pal.breedingPower - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        child = pal;
      }
    }
    childByTarget.set(target, child!);
  }
  return child!;
}

/**
 * The child two parents produce, or null if either parent can't be bred.
 * Pass genders for gender-dependent combos (e.g. Katress + Wixen); without them those combos don't apply.
 */
export function getChild(parentA: Pal, parentB: Pal, genders: ParentGenders = {}): Pal | null {
  if (!canBreed(parentA) || !canBreed(parentB)) return null;
  if (parentA.id === parentB.id) return parentA;

  const combo = findUniqueCombo(parentA, parentB, genders);
  if (combo) return palById.get(combo.child)!;

  return getFormulaChild(parentA, parentB);
}

/** Every possible child of two parents, with the genders needed when the result depends on them. */
export function getChildOutcomes(parentA: Pal, parentB: Pal): BreedingOutcome[] {
  const genderDependent = combos.some(
    (c) =>
      (c.parentAGender || c.parentBGender) &&
      ((c.parentA === parentA.id && c.parentB === parentB.id) ||
        (c.parentA === parentB.id && c.parentB === parentA.id)),
  );

  if (!genderDependent) {
    const child = getChild(parentA, parentB);
    return child ? [{ child, parentAGender: null, parentBGender: null }] : [];
  }

  const outcomes: BreedingOutcome[] = [];
  for (const genderA of ALL_GENDERS) {
    for (const genderB of ALL_GENDERS) {
      const child = getChild(parentA, parentB, { parentA: genderA, parentB: genderB });
      if (child) outcomes.push({ child, parentAGender: genderA, parentBGender: genderB });
    }
  }
  return outcomes;
}

let parentsByChild: Map<string, ParentPair[]> | undefined;

function buildParentIndex(): Map<string, ParentPair[]> {
  const index = new Map<string, ParentPair[]>();
  const breedable = pals.filter(canBreed);

  for (let i = 0; i < breedable.length; i++) {
    for (let j = i; j < breedable.length; j++) {
      const parentA = breedable[i];
      const parentB = breedable[j];
      for (const outcome of getChildOutcomes(parentA, parentB)) {
        const list = index.get(outcome.child.id) ?? [];
        list.push({
          parentA,
          parentB,
          parentAGender: outcome.parentAGender,
          parentBGender: outcome.parentBGender,
        });
        index.set(outcome.child.id, list);
      }
    }
  }
  return index;
}

/** Every parent pair (in either order, listed once) that produces this child. */
export function getParents(child: Pal): ParentPair[] {
  parentsByChild ??= buildParentIndex();
  return parentsByChild.get(child.id) ?? [];
}
