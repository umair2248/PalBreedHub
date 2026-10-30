// Builds data/unique-combos.json from DT_PalCombiUnique, using the same source and
// game build as data/pals.json (run `npm run data:pals` first).
//
// Source: Awy64/palworld-atlas-data (MIT) - https://github.com/Awy64/palworld-atlas-data
//
// Usage: npm run data:combos

import { readFile, writeFile } from "node:fs/promises";

const ATLAS = "https://awy64.github.io/palworld-atlas-data/v1";
const PALS_FILE = new URL("../data/pals.json", import.meta.url);
const OUT_FILE = new URL("../data/unique-combos.json", import.meta.url);

// Rules the game enforces that are not in DT_PalCombiUnique as exported by the source
const MANUAL_NOT_BREEDABLE = {
  KingWhale: "Panthalus cannot be placed in the Breeding Farm",
  WorldTreeDragon: "Astralym cannot be placed in the Breeding Farm",
};
const MANUAL_SELF_BREED_ONLY = {
  PlantSlime_Flower: "Shares Gumoss's breeding power; the game always picks regular Gumoss",
};

const { meta, pals } = JSON.parse(await readFile(PALS_FILE, "utf8"));
const res = await fetch(`${ATLAS}/builds/${meta.steamBuildId}/breeding.json`);
if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching breeding.json`);
const { uniquePairs } = await res.json();

// The game table is not always consistent with ID casing (e.g. "Blueplatypus")
const idByLowercase = new Map(pals.map((p) => [p.id.toLowerCase(), p.id]));
const skipped = new Set();

function resolve(rawId) {
  const id = idByLowercase.get(rawId.toLowerCase());
  if (!id) skipped.add(rawId);
  return id;
}

const combos = [];
const selfRows = new Set();

for (const row of uniquePairs) {
  const parentA = resolve(row.parentAId);
  const parentB = resolve(row.parentBId);
  const child = resolve(row.childId);
  if (!parentA || !parentB || !child) continue;

  // A row like "Frostallion + Frostallion = Frostallion" removes the Pal from normal
  // breeding-power results; it is not a real combo
  if (parentA === parentB && parentA === child) {
    selfRows.add(child);
    continue;
  }

  combos.push({
    parentA,
    parentAGender: row.parentAGender ?? null,
    parentB,
    parentBGender: row.parentBGender ?? null,
    child,
  });
}

for (const id of Object.keys(MANUAL_SELF_BREED_ONLY)) selfRows.add(id);

const comboChildren = new Set(combos.map((c) => c.child));
const selfBreedOnly = [...selfRows].filter((id) => !comboChildren.has(id));
const notBreedable = Object.keys(MANUAL_NOT_BREEDABLE);

const order = new Map(pals.map((p, i) => [p.id, i]));
combos.sort((a, b) => order.get(a.child) - order.get(b.child) || order.get(a.parentA) - order.get(b.parentA));
selfBreedOnly.sort((a, b) => order.get(a) - order.get(b));

const output = {
  meta: {
    game: "Palworld",
    steamBuildId: meta.steamBuildId,
    generatedAt: new Date().toISOString(),
    comboCount: combos.length,
    selfBreedOnlyCount: selfBreedOnly.length,
    notes: [
      "IDs match the id field in data/pals.json.",
      "A null gender means either gender works.",
      "Pals that appear as a combo child cannot be produced by the normal breeding-power formula.",
      "selfBreedOnly Pals can only be bred by pairing two of the same Pal.",
      "notBreedable Pals cannot be used in the Breeding Farm at all.",
      ...Object.entries({ ...MANUAL_NOT_BREEDABLE, ...MANUAL_SELF_BREED_ONLY }).map(
        ([id, reason]) => `Manual rule for ${id}: ${reason}.`,
      ),
      `Skipped game rows that reference Pals missing from pals.json: ${[...skipped].sort().join(", ") || "none"}.`,
    ],
    sources: meta.sources.filter((s) => s.name === "palworld-atlas-data"),
    notice: meta.notice,
  },
  combos,
  selfBreedOnly,
  notBreedable,
};

await writeFile(OUT_FILE, JSON.stringify(output, null, 2) + "\n");
console.log(`Wrote ${combos.length} unique combos and ${selfBreedOnly.length} self-breed-only Pals to data/unique-combos.json`);
if (skipped.size > 0) console.log(`Skipped rows for Pals not in pals.json: ${[...skipped].sort().join(", ")}`);
