// Checks data/pals.json and data/unique-combos.json for problems that would break the breeding calculator.
// Usage: npm run validate:data

import { readFile } from "node:fs/promises";

const ELEMENTS = new Set(["neutral", "fire", "water", "grass", "electric", "ice", "ground", "dark", "dragon"]);
const WORK = new Set([
  "kindling",
  "watering",
  "planting",
  "generatingElectricity",
  "handiwork",
  "gathering",
  "lumbering",
  "mining",
  "medicineProduction",
  "cooling",
  "transporting",
  "farming",
]);

const { pals } = JSON.parse(await readFile(new URL("../data/pals.json", import.meta.url), "utf8"));
const errors = [];
const seen = { id: new Map(), slug: new Map(), name: new Map() };

for (const [i, pal] of pals.entries()) {
  const label = pal.name ? `${pal.name} (#${i})` : `entry #${i}`;
  const fail = (msg) => errors.push(`${label}: ${msg}`);

  for (const field of ["id", "slug", "name"]) {
    if (typeof pal[field] !== "string" || pal[field] === "") {
      fail(`missing ${field}`);
      continue;
    }
    if (seen[field].has(pal[field])) fail(`duplicate ${field} "${pal[field]}" (also on ${seen[field].get(pal[field])})`);
    seen[field].set(pal[field], label);
  }

  if (pal.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pal.slug)) fail(`slug "${pal.slug}" is not URL-safe`);
  if (!Number.isInteger(pal.breedingPower) || pal.breedingPower <= 0) fail("missing or invalid breedingPower");
  if (!Number.isInteger(pal.paldeckNumber) || pal.paldeckNumber <= 0) fail("missing or invalid paldeckNumber");
  if (pal.paldeckSuffix !== null && !/^[A-Z]$/.test(pal.paldeckSuffix)) fail(`invalid paldeckSuffix "${pal.paldeckSuffix}"`);
  if (!Number.isInteger(pal.rarity) || pal.rarity <= 0) fail("missing or invalid rarity");

  if (!Array.isArray(pal.elements) || pal.elements.length === 0 || pal.elements.length > 2) {
    fail("elements must have 1 or 2 entries");
  } else {
    for (const el of pal.elements) if (!ELEMENTS.has(el)) fail(`unknown element "${el}"`);
  }

  for (const [work, level] of Object.entries(pal.workSuitability ?? {})) {
    if (!WORK.has(work)) fail(`unknown work suitability "${work}"`);
    // Palworld 1.0 work levels go up to 8; 10 leaves room for future patches
    if (!Number.isInteger(level) || level < 1 || level > 10) fail(`work level for ${work} out of range: ${level}`);
  }

  if (typeof pal.description !== "string") fail("description must be a string");
}

const paldeckCodes = new Map();
for (const pal of pals) {
  const code = `${pal.paldeckNumber}${pal.paldeckSuffix ?? ""}`;
  paldeckCodes.set(code, [...(paldeckCodes.get(code) ?? []), pal.name]);
}
const sharedCodes = [...paldeckCodes].filter(([, names]) => names.length > 1);

const { combos, selfBreedOnly, notBreedable } = JSON.parse(await readFile(new URL("../data/unique-combos.json", import.meta.url), "utf8"));
const comboKeys = new Set();
for (const [i, combo] of combos.entries()) {
  const fail = (msg) => errors.push(`unique-combos #${i}: ${msg}`);
  for (const field of ["parentA", "parentB", "child"]) {
    if (!seen.id.has(combo[field])) fail(`${field} "${combo[field]}" is not in pals.json`);
  }
  for (const field of ["parentAGender", "parentBGender"]) {
    if (![null, "male", "female"].includes(combo[field])) fail(`invalid ${field} "${combo[field]}"`);
  }
  const key = [`${combo.parentA}:${combo.parentAGender}`, `${combo.parentB}:${combo.parentBGender}`].sort().join("+");
  if (comboKeys.has(key)) fail(`duplicate parent pair ${key}`);
  comboKeys.add(key);
}
for (const [list, ids] of Object.entries({ selfBreedOnly, notBreedable })) {
  for (const id of ids) if (!seen.id.has(id)) errors.push(`unique-combos ${list}: "${id}" is not in pals.json`);
}

if (errors.length > 0) {
  console.error(`✗ data has ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ data/pals.json is valid: ${pals.length} Pals, no duplicate slugs, every Pal has breedingPower.`);
console.log(`✓ data/unique-combos.json is valid: ${combos.length} combos, ${selfBreedOnly.length} self-breed-only Pals, all IDs exist.`);
for (const [code, names] of sharedCodes) console.log(`  note: Paldeck #${code} is shared by ${names.join(", ")}`);
