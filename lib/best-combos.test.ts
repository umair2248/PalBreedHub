import { describe, expect, it } from "vitest";
import { getBestCombos, PAIRS_PER_PAL } from "./best-combos";
import { getChild } from "./breeding";

describe("best combos", () => {
  const sections = getBestCombos();

  it("fills every section", () => {
    for (const list of Object.values(sections)) expect(list.length).toBeGreaterThan(5);
  });

  it("only shows pairs that really breed the child, never the Pal with itself", () => {
    for (const list of Object.values(sections)) {
      for (const { child, pairs } of list) {
        expect(pairs.length).toBeGreaterThan(0);
        expect(pairs.length).toBeLessThanOrEqual(PAIRS_PER_PAL);
        for (const pair of pairs) {
          expect(pair.parentA.id === child.id && pair.parentB.id === child.id).toBe(false);
          const result = getChild(pair.parentA, pair.parentB, {
            parentA: pair.parentAGender ?? undefined,
            parentB: pair.parentBGender ?? undefined,
          });
          expect(result?.id, `${pair.parentA.name} + ${pair.parentB.name}`).toBe(child.id);
        }
      }
    }
  });

  it("lists one best worker per job", () => {
    const jobs = sections.workers.map((e) => e.work!.key);
    expect(new Set(jobs).size).toBe(jobs.length);
  });

  it("doesn't repeat combat or mount Pals in the unique section", () => {
    const shown = new Set([...sections.combat, ...sections.mounts].map((e) => e.child.id));
    expect(sections.unique.some((e) => shown.has(e.child.id))).toBe(false);
  });
});
