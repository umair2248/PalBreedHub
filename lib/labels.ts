export const ELEMENT_LABELS: Record<string, string> = {
  neutral: "Neutral",
  fire: "Fire",
  water: "Water",
  grass: "Grass",
  electric: "Electric",
  ice: "Ice",
  ground: "Ground",
  dark: "Dark",
  dragon: "Dragon",
};

export const WORK_LABELS: Record<string, string> = {
  kindling: "Kindling",
  watering: "Watering",
  planting: "Planting",
  generatingElectricity: "Generating Electricity",
  handiwork: "Handiwork",
  gathering: "Gathering",
  lumbering: "Lumbering",
  mining: "Mining",
  medicineProduction: "Medicine Production",
  cooling: "Cooling",
  transporting: "Transporting",
  farming: "Farming",
};

export type RarityTier = "Common" | "Rare" | "Epic" | "Legendary";

/** The in-game rarity bands: 1-4 Common, 5-7 Rare, 8-10 Epic, above that Legendary. */
export function rarityTier(rarity: number): RarityTier {
  if (rarity <= 4) return "Common";
  if (rarity <= 7) return "Rare";
  if (rarity <= 10) return "Epic";
  return "Legendary";
}

export function paldeckCode(pal: { paldeckNumber: number; paldeckSuffix: string | null }): string {
  return `#${String(pal.paldeckNumber).padStart(3, "0")}${pal.paldeckSuffix ?? ""}`;
}
