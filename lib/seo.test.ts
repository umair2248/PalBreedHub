import { describe, expect, it } from "vitest";
import { getChild, getOffspring, getParents, pals } from "./breeding";
import { breadcrumbJsonLd, palDescription, palTitle } from "./seo";

const pal = (name: string) => pals.find((p) => p.name === name)!;

describe("Pal page SEO", () => {
  const titles = pals.map((p) => palTitle(p));
  const descriptions = pals.map((p) => palDescription(p, getParents(p).length));

  it("uses the title format", () => {
    expect(palTitle(pal("Anubis"))).toBe("How to Breed Anubis in Palworld 1.0 - All Breeding Combos");
  });

  it("gives every Pal a unique title and description", () => {
    expect(new Set(titles).size).toBe(pals.length);
    expect(new Set(descriptions).size).toBe(pals.length);
  });

  it("keeps every description at or under 160 characters", () => {
    const tooLong = descriptions.filter((d) => d.length > 160);
    expect(tooLong).toEqual([]);
  });

  it("describes self-breed-only and non-breedable Pals correctly", () => {
    expect(palDescription(pal("Jetragon"), 1)).toContain("can only be bred from two Jetragon");
    expect(palDescription(pal("Panthalus"), 0)).toContain("why it can't be bred");
  });

  it("builds a BreadcrumbList with absolute URLs", () => {
    const schema = JSON.parse(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Pals", path: "/pals/" }]));
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement[1]).toMatchObject({ position: 2, name: "Pals" });
    expect(schema.itemListElement[1].item).toMatch(/^https:\/\/.+\/pals\/$/);
  });
});

describe("getOffspring", () => {
  it("matches getChild for every partner", () => {
    const lamball = pal("Lamball");
    for (const { child, partners } of getOffspring(lamball)) {
      for (const { partner, palGender, partnerGender } of partners) {
        const genders = { parentA: palGender ?? undefined, parentB: partnerGender ?? undefined };
        expect(getChild(lamball, partner, genders)?.id).toBe(child.id);
      }
    }
  });

  it("is empty for Pals that can't be bred", () => {
    expect(getOffspring(pal("Panthalus"))).toEqual([]);
  });
});
