// Breeding path finder: from the Pals a player owns, the fewest generations of breeding to reach a target.
//
// Breadth-first search over generations: generation n+1 is every child of two Pals known after
// generation n. The first generation that contains the target is the shortest path. When several
// pairs give the same new Pal, the one needing the fewest breeding steps so far is kept, so the
// path also stays short in total steps.

import { canBreed, getChildOutcomes, type Gender, type Pal } from "./breeding";

export interface PathStep {
  parentA: Pal;
  parentB: Pal;
  /** null means either gender works */
  parentAGender: Gender | null;
  parentBGender: Gender | null;
  child: Pal;
  /** 1 for a child of two owned Pals, 2 for the next generation, ... */
  generation: number;
}

export interface BreedingPath {
  /** Number of generations needed; 0 when the target is already owned */
  generations: number;
  /** Breeding steps in the order to do them */
  steps: PathStep[];
}

interface Known {
  generation: number;
  /** Breeding steps needed to get this Pal (shared steps counted twice; good enough to compare pairs) */
  cost: number;
  step?: PathStep;
}

const MAX_GENERATIONS = 20;

/** The shortest breeding path from the owned Pals to the target, or null if it can't be reached. */
export function findBreedingPath(owned: Pal[], target: Pal): BreedingPath | null {
  if (owned.some((p) => p.id === target.id)) return { generations: 0, steps: [] };
  if (!canBreed(target)) return null;

  const known = new Map<string, Known>();
  const parents: Pal[] = [];
  for (const pal of owned) {
    if (known.has(pal.id)) continue;
    known.set(pal.id, { generation: 0, cost: 0 });
    if (canBreed(pal)) parents.push(pal);
  }

  let frontierStart = 0;
  for (let generation = 1; generation <= MAX_GENERATIONS; generation++) {
    const found = new Map<string, { step: PathStep; cost: number; rarity: number }>();

    // Every pair with at least one Pal from the last generation; older pairs were checked already
    for (let i = frontierStart; i < parents.length; i++) {
      for (let j = 0; j < parents.length; j++) {
        if (j >= frontierStart && j < i) continue; // new-new pairs once
        const a = parents[i];
        const b = parents[j];
        if (a.id === b.id) continue;
        const cost = known.get(a.id)!.cost + known.get(b.id)!.cost + 1;
        const rarity = a.rarity + b.rarity;
        for (const outcome of getChildOutcomes(a, b)) {
          const child = outcome.child;
          if (known.has(child.id)) continue;
          const best = found.get(child.id);
          if (best && (best.cost < cost || (best.cost === cost && best.rarity <= rarity))) continue;
          found.set(child.id, {
            cost,
            rarity,
            step: {
              parentA: a,
              parentB: b,
              parentAGender: outcome.parentAGender,
              parentBGender: outcome.parentBGender,
              child,
              generation,
            },
          });
        }
      }
    }

    if (found.size === 0) return null;

    frontierStart = parents.length;
    for (const [id, { step, cost }] of found) {
      known.set(id, { generation, cost, step });
      parents.push(step.child);
    }

    if (known.has(target.id)) return { generations: generation, steps: collectSteps(target, known) };
  }
  return null;
}

/** The steps that lead to the target, parents before children, each Pal bred once. */
function collectSteps(target: Pal, known: Map<string, Known>): PathStep[] {
  const steps: PathStep[] = [];
  const seen = new Set<string>();
  const visit = (pal: Pal) => {
    if (seen.has(pal.id)) return;
    seen.add(pal.id);
    const step = known.get(pal.id)?.step;
    if (!step) return;
    visit(step.parentA);
    visit(step.parentB);
    steps.push(step);
  };
  visit(target);
  return steps.sort((x, y) => x.generation - y.generation);
}
