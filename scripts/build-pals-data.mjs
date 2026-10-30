// Builds data/pals.json from open-source data extracted from the Palworld game files.
//
// Sources (both MIT licensed, both read DT_PalMonsterParameter from the dedicated server):
//   - Awy64/palworld-atlas-data: name, Paldeck number, elements, CombiRank, rarity, work suitability
//   - GGarnize/palworld-knowledge: ZukanIndexSuffix (the "B" in variant numbers like 5B)
//
// Usage: npm run data:pals

import { writeFile, mkdir } from "node:fs/promises";

const ATLAS = "https://awy64.github.io/palworld-atlas-data/v1";
const KNOWLEDGE = "https://raw.githubusercontent.com/GGarnize/palworld-knowledge/HEAD/data";
const OUT_FILE = new URL("../data/pals.json", import.meta.url);

// Game-internal names -> the names players see in-game
const ELEMENTS = {
  Normal: "neutral",
  Fire: "fire",
  Water: "water",
  Leaf: "grass",
  Electricity: "electric",
  Ice: "ice",
  Earth: "ground",
  Dark: "dark",
  Dragon: "dragon",
};

const WORK = {
  EmitFlame: "kindling",
  Watering: "watering",
  Seeding: "planting",
  GenerateElectricity: "generatingElectricity",
  Handcraft: "handiwork",
  Collection: "gathering",
  Deforest: "lumbering",
  Mining: "mining",
  ProductMedicine: "medicineProduction",
  Cool: "cooling",
  Transport: "transporting",
  MonsterFarm: "farming",
};

// Game rows that share a display name with another Pal
const NAME_OVERRIDES = {
  PlantSlime_Flower: "Gumoss (Flower)",
};

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapKeys(table, values, id) {
  return values.map((v) => {
    if (!table[v]) throw new Error(`Unknown value "${v}" on ${id} - add it to the mapping`);
    return table[v];
  });
}

const latest = await getJson(`${ATLAS}/latest.json`);
const build = await getJson(`${ATLAS}/${latest.buildPath}/manifest.json`);
const { records } = await getJson(`${ATLAS}/${latest.buildPath}/pals/index.json`);
const knowledgeBuild = await getJson(`${KNOWLEDGE}/build.json`);
const knowledgePals = await getJson(`${KNOWLEDGE}/pals.json`);

if (knowledgeBuild.steamBuildId !== latest.steamBuildId) {
  console.warn(
    `Warning: sources are on different game builds (atlas ${latest.steamBuildId}, ` +
      `knowledge ${knowledgeBuild.steamBuildId}). Variant suffixes may be out of date.`,
  );
}

const suffixById = new Map(knowledgePals.map((p) => [p.id, p.zukanIndexSuffix ?? null]));

const pals = records.map((p) => {
  const name = NAME_OVERRIDES[p.id] ?? p.name;
  const workSuitability = {};
  for (const [key, level] of Object.entries(p.workSuitability)) {
    workSuitability[mapKeys(WORK, [key], p.id)[0]] = level;
  }

  return {
    id: p.id,
    slug: slugify(name),
    name,
    paldeckNumber: p.paldexNumber,
    paldeckSuffix: suffixById.get(p.id) ?? null,
    elements: mapKeys(ELEMENTS, p.elements, p.id),
    breedingPower: p.breedingRank,
    rarity: p.rarity,
    workSuitability,
    description: "",
  };
});

pals.sort(
  (a, b) =>
    a.paldeckNumber - b.paldeckNumber ||
    (a.paldeckSuffix ?? "").localeCompare(b.paldeckSuffix ?? "") ||
    a.name.localeCompare(b.name),
);

const output = {
  meta: {
    game: "Palworld",
    steamBuildId: latest.steamBuildId,
    extractedAt: build.generatedAt,
    generatedAt: new Date().toISOString(),
    count: pals.length,
    sources: [
      {
        name: "palworld-atlas-data",
        url: "https://github.com/Awy64/palworld-atlas-data",
        license: "MIT, Copyright (c) 2026 Adam Young",
      },
      {
        name: "palworld-knowledge",
        url: "https://github.com/GGarnize/palworld-knowledge",
        license: "MIT, Copyright (c) 2026 GGarnize",
      },
    ],
    notice: "Palworld and all Pal names are the property of Pocketpair, Inc.",
  },
  pals,
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(output, null, 2) + "\n");
console.log(`Wrote ${pals.length} Pals (game build ${latest.steamBuildId}) to data/pals.json`);
