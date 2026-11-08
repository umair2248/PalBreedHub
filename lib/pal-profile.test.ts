import { describe, expect, it } from "vitest";
import { getOffspring, getPal, getParents, pals, type Pal } from "./breeding";
import { parsePalContent } from "./content";
import { getDictionary, LOCALES } from "./i18n";
import { baseForm, buildPalProfile, powerPercentiles, sortedWork } from "./pal-profile";
import { easiestPair } from "./popular";

const en = getDictionary("en");

function profileFor(pal: Pal, locale: (typeof LOCALES)[number] = "en") {
  return buildPalProfile(
    { pal, pairCount: getParents(pal).length, easiest: easiestPair(pal), offspringCount: getOffspring(pal).length },
    getDictionary(locale),
    locale,
  );
}

describe("buildPalProfile", () => {
  it("writes 3 paragraphs and 8 quick facts for a normal Pal", () => {
    const lamball = getPal("lamball")!;
    const profile = profileFor(lamball);
    expect(profile.paragraphs).toHaveLength(3);
    expect(profile.paragraphs[0]).toContain("Lamball is a Neutral Pal, listed as #001");
    expect(profile.paragraphs[2]).toMatch(/The easiest way to breed it is .+ \+ .+/);
    expect(profile.facts).toHaveLength(8);
    expect(profile.facts.find((f) => f.label === en.pal.parentPairs)?.value).toBe(String(getParents(lamball).length));
  });

  it("explains self-breeding and non-breedable Pals", () => {
    expect(profileFor(getPal("JetDragon")!).paragraphs[2]).toContain("the only way to get more is to breed two Jetragon");
    const notBreedable = profileFor(getPal("KingWhale")!);
    expect(notBreedable.paragraphs[2]).toContain("can't be bred");
    expect(notBreedable.facts.find((f) => f.label === en.pal.factEasiest)?.value).toBe(en.pal.none);
  });

  it("mentions the base form of variants", () => {
    const variant = pals.find((p) => p.paldeckSuffix)!;
    expect(baseForm(variant)).not.toBeNull();
    expect(profileFor(variant).paragraphs[0]).toContain(`variant of ${baseForm(variant)!.name}`);
  });

  it("gives every Pal its own intro", () => {
    const intros = new Set(pals.map((p) => profileFor(p).paragraphs.join(" ")));
    expect(intros.size).toBe(pals.length);
  });

  it("fills every placeholder in every language", () => {
    for (const locale of LOCALES) {
      for (const pal of [getPal("lamball")!, getPal("JetDragon")!, getPal("KingWhale")!, pals.find((p) => p.paldeckSuffix)!]) {
        const { paragraphs, facts } = profileFor(pal, locale);
        for (const text of [...paragraphs, ...facts.map((f) => f.value)]) expect(text).not.toMatch(/\{\w+\}|undefined/);
      }
    }
  });
});

describe("helpers", () => {
  it("sorts work skills by level", () => {
    const levels = pals.flatMap((p) => sortedWork(p).map(([, level], i, all) => (i === 0 ? 0 : all[i - 1][1] - level)));
    expect(levels.every((d) => d >= 0)).toBe(true);
  });

  it("keeps breeding power shares between 0 and 100", () => {
    for (const pal of pals) {
      const { higher, lower } = powerPercentiles(pal);
      expect(higher + lower).toBeLessThanOrEqual(101); // both are rounded
      expect(Math.min(higher, lower)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("parsePalContent", () => {
  it("uses the text before the first heading as the intro", () => {
    const content = parsePalContent(["<!-- note -->", "Hand-written **intro**.", "## Tips", "Use it early.", "## FAQ", "### Is it good?", "Yes."].join("\n"));
    expect(content.introHtml).toBe("<p>Hand-written <strong>intro</strong>.</p>\n");
    expect(content.sections.map((s) => s.heading)).toEqual(["Tips"]);
    expect(content.faq.map((f) => f.question)).toEqual(["Is it good?"]);
  });

  it("keeps the generated intro when the file starts with a heading", () => {
    expect(parsePalContent("## Tips\nText").introHtml).toBeNull();
  });
});
