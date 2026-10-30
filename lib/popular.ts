import { compareByEase, getPal, getParents, type Pal, type ParentPair } from "./breeding";

// The Pals players search "how to breed" for the most, in display order
const POPULAR_IDS = [
  "Anubis",
  "JetDragon",
  "BlackGriffon",
  "Umihebi_Fire",
  "Horus",
  "BlackMetalDragon",
  "ThunderDragonMan",
  "KingBahamut",
  "LilyQueen_Dark",
  "Suzaku",
  "CaptainPenguin",
  "ElecPanda",
];

export const popularPals: Pal[] = POPULAR_IDS.map((id) => getPal(id)).filter((p): p is Pal => Boolean(p));

/** The easiest parent pair that isn't the Pal with itself, or null when self-breeding is the only way. */
export function easiestPair(pal: Pal): ParentPair | null {
  return (
    getParents(pal)
      .filter((p) => p.parentA.id !== pal.id || p.parentB.id !== pal.id)
      .sort(compareByEase)[0] ?? null
  );
}
