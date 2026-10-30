// Prints 10 random Pals with their breeding power and unique combos, for checking by hand.
// Usage: npm run data:sample            (new random pick every time)
//        npm run data:sample -- 12345   (same pick again, using that seed)

import { readFile } from "node:fs/promises";

const read = async (file) => JSON.parse(await readFile(new URL(`../data/${file}`, import.meta.url), "utf8"));
const { pals } = await read("pals.json");
const { combos, selfBreedOnly } = await read("unique-combos.json");

const seed = Number(process.argv[2]) || Math.floor(Math.random() * 100000);
let state = seed;
const random = () => {
  state = (state * 1103515245 + 12345) % 2147483648;
  return state / 2147483648;
};

const byId = new Map(pals.map((p) => [p.id, p]));
const name = (id) => byId.get(id).name;
const parent = (id, gender) => (gender ? `${name(id)} (${gender === "male" ? "M" : "F"})` : name(id));
const code = (p) => `${p.paldeckNumber}${p.paldeckSuffix ?? ""}`;

const pool = [...pals];
const picked = [];
while (picked.length < 10) picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
picked.sort((a, b) => a.paldeckNumber - b.paldeckNumber);

const rows = picked.map((p) => {
  const recipes = combos.filter((c) => c.child === p.id).map((c) => `${parent(c.parentA, c.parentAGender)} + ${parent(c.parentB, c.parentBGender)}`);
  if (selfBreedOnly.includes(p.id)) recipes.push(`only ${p.name} + ${p.name}`);
  return { "#": code(p), Pal: p.name, "Breeding Power": p.breedingPower, "Unique combo": recipes.join("; ") || "-" };
});

console.log(`Seed ${seed} (run "npm run data:sample -- ${seed}" to see the same Pals again)\n`);
console.table(rows);
