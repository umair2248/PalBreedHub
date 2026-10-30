import { describe, expect, it } from "vitest";
import { compareByEase, getChild, getChildOutcomes, getPal, getParents, pals, type Pal } from "./breeding";

function pal(name: string): Pal {
  const found = pals.find((p) => p.name === name);
  if (!found) throw new Error(`No Pal named ${name}`);
  return found;
}

function child(a: string, b: string): string | undefined {
  return getChild(pal(a), pal(b))?.name;
}

describe("getChild - breeding power formula", () => {
  it.each([
    // [parent A, parent B, expected child]
    ["Lamball", "Chikipi", "Teafant"],
    ["Penking", "Bushi", "Sibelyx"],
    ["Penking", "Pengullet", "Amione"],
    ["Mossanda", "Rushoar", "Kelpsea Ignis"],
    ["Grizzbolt", "Relaxaurus", "Reptyro"],
    ["Jormuntide", "Lunaris", "Warsect"],
    ["Anubis", "Direhowl", "Felbat"],
    ["Depresso", "Lamball", "Jolthog"],
  ])("%s + %s = %s", (a, b, expected) => {
    expect(child(a, b)).toBe(expected);
  });

  it("uses floor((A + B + 1) / 2) as the target", () => {
    // 3050 + 3060 -> target 3055, exactly between Lamball (3050) and Vixy (3060)
    expect(child("Lamball", "Vixy")).toBe("Vixy");
  });

  it("picks the Pal with the higher breeding power on a tie", () => {
    // Target 2905: Tanzee (2900) and Daedream (2910) are both 5 away
    expect(child("Lamball", "Cattiva")).toBe("Daedream");
  });

  it("skips Pals that only come from unique combos", () => {
    // Target 1080: Mammorest Cryst (1070) is closer but needs Mammorest + Wumpo
    expect(child("Kitsun", "Astegon")).toBe("Relaxaurus");
  });

  it("gives the same result in either parent order", () => {
    for (const [a, b] of [
      ["Penking", "Bushi"],
      ["Relaxaurus", "Sparkit"],
      ["Lamball", "Cattiva"],
    ]) {
      expect(child(b, a)).toBe(child(a, b));
    }
  });
});

describe("getChild - unique combos", () => {
  it.each([
    ["Relaxaurus", "Sparkit", "Relaxaurus Lux"],
    ["Frostallion", "Helzephyr", "Frostallion Noct"],
    ["Mammorest", "Wumpo", "Mammorest Cryst"],
    ["Vanwyrm", "Foxcicle", "Vanwyrm Cryst"],
    ["Jolthog", "Pengullet", "Jolthog Cryst"],
  ])("%s + %s = %s", (a, b, expected) => {
    expect(child(a, b)).toBe(expected);
  });

  it("two of the same Pal make that Pal", () => {
    expect(child("Jetragon", "Jetragon")).toBe("Jetragon");
    expect(child("Lamball", "Lamball")).toBe("Lamball");
  });

  it("uses parent genders for gender-dependent combos", () => {
    const katress = pal("Katress");
    const wixen = pal("Wixen");
    expect(getChild(katress, wixen, { parentA: "female", parentB: "male" })?.name).toBe("Katress Ignis");
    expect(getChild(katress, wixen, { parentA: "male", parentB: "female" })?.name).toBe("Wixen Noct");
    // Same-gender pairs don't match either combo, so the formula applies
    expect(getChild(katress, wixen, { parentA: "male", parentB: "male" })?.name).toBe("Mossanda");
  });

  it("lists every gender outcome for gender-dependent pairs", () => {
    const outcomes = getChildOutcomes(pal("Wixen"), pal("Katress")).map(
      (o) => `${o.parentAGender}+${o.parentBGender}=${o.child.name}`,
    );
    expect(outcomes).toEqual([
      "male+male=Mossanda",
      "male+female=Katress Ignis",
      "female+male=Wixen Noct",
      "female+female=Mossanda",
    ]);
  });

  it("returns null when a parent can't enter the Breeding Farm", () => {
    expect(getChild(pal("Panthalus"), pal("Lamball"))).toBeNull();
    expect(getChild(pal("Astralym"), pal("Astralym"))).toBeNull();
  });
});

describe("getParents", () => {
  it("finds the unique combo and self-breeding for a combo-only Pal", () => {
    const pairs = getParents(pal("Relaxaurus Lux")).map((p) => [p.parentA.name, p.parentB.name].sort().join(" + "));
    expect(pairs.sort()).toEqual(["Relaxaurus + Sparkit", "Relaxaurus Lux + Relaxaurus Lux"]);
  });

  it("returns only self-breeding for self-breed-only Pals", () => {
    for (const name of ["Jetragon", "Gumoss (Flower)"]) {
      const pairs = getParents(pal(name));
      expect(pairs).toHaveLength(1);
      expect(pairs[0].parentA.name).toBe(name);
      expect(pairs[0].parentB.name).toBe(name);
    }
  });

  it("includes the required genders for gender-dependent combos", () => {
    const combo = getParents(pal("Katress Ignis")).find((p) => p.parentAGender !== null);
    expect(combo).toBeDefined();
    const female = combo!.parentAGender === "female" ? combo!.parentA : combo!.parentB;
    expect(female.name).toBe("Katress");
  });

  it("returns nothing for Pals that can't be bred", () => {
    expect(getParents(pal("Panthalus"))).toEqual([]);
  });

  it("agrees with getChild for every pair it returns", () => {
    for (const name of ["Anubis", "Daedream", "Sibelyx", "Teafant"]) {
      const target = pal(name);
      const pairs = getParents(target);
      expect(pairs.length).toBeGreaterThan(0);
      for (const p of pairs) {
        const genders = { parentA: p.parentAGender ?? undefined, parentB: p.parentBGender ?? undefined };
        expect(getChild(p.parentA, p.parentB, genders)?.id).toBe(target.id);
      }
    }
  });

  it("includes a known pair", () => {
    const pairs = getParents(pal("Sibelyx")).map((p) => [p.parentA.name, p.parentB.name].sort().join(" + "));
    expect(pairs).toContain("Bushi + Penking");
  });
});

describe("compareByEase", () => {
  it("puts pairs of common Pals before pairs that need a rare Pal", () => {
    const sorted = [...getParents(pal("Anubis"))].sort(compareByEase);
    const rarest = (i: number) => Math.max(sorted[i].parentA.rarity, sorted[i].parentB.rarity);
    for (let i = 1; i < sorted.length; i++) expect(rarest(i)).toBeGreaterThanOrEqual(rarest(i - 1));
  });
});

describe("getPal", () => {
  it("finds a Pal by id or slug", () => {
    expect(getPal("BluePlatypus_Fire")?.name).toBe("Fuack Ignis");
    expect(getPal("fuack-ignis")?.name).toBe("Fuack Ignis");
    expect(getPal("not-a-pal")).toBeUndefined();
  });
});
