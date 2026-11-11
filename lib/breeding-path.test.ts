import { describe, expect, it } from "vitest";
import { getChild, pals, type Pal } from "./breeding";
import { findBreedingPath } from "./breeding-path";

function pal(name: string): Pal {
  const found = pals.find((p) => p.name === name);
  if (!found) throw new Error(`No Pal named ${name}`);
  return found;
}

describe("findBreedingPath", () => {
  it("needs no steps when the target is already owned", () => {
    expect(findBreedingPath([pal("Lamball")], pal("Lamball"))).toEqual({ generations: 0, steps: [] });
  });

  it("finds a one-generation unique combo", () => {
    const path = findBreedingPath([pal("Frostallion"), pal("Helzephyr")], pal("Frostallion Noct"))!;
    expect(path.generations).toBe(1);
    expect(path.steps).toHaveLength(1);
    expect(path.steps[0].child.name).toBe("Frostallion Noct");
  });

  it("returns null for self-breed-only Pals that aren't owned", () => {
    expect(findBreedingPath([pal("Lamball"), pal("Cattiva"), pal("Chikipi")], pal("Grizzbolt"))).toBeNull();
  });

  it("finds a multi-generation path where every step really gives its child", () => {
    const owned = [pal("Lamball"), pal("Cattiva"), pal("Chikipi"), pal("Foxparks"), pal("Pengullet")];
    const target = pal("Anubis");
    const path = findBreedingPath(owned, target)!;
    expect(path).not.toBeNull();
    expect(path.generations).toBeGreaterThan(1);
    expect(path.steps.at(-1)!.child.id).toBe(target.id);

    const have = new Set(owned.map((p) => p.id));
    for (const step of path.steps) {
      expect(have.has(step.parentA.id) && have.has(step.parentB.id)).toBe(true);
      const child = getChild(step.parentA, step.parentB, {
        parentA: step.parentAGender ?? undefined,
        parentB: step.parentBGender ?? undefined,
      });
      expect(child?.id).toBe(step.child.id);
      have.add(step.child.id);
    }
  });

  it("is never longer than a known one-generation pair", () => {
    const path = findBreedingPath([pal("Lamball"), pal("Cattiva"), pal("Anubis"), pal("Penking")], pal("Anubis"))!;
    expect(path.generations).toBe(0);
  });
});
