"use client";

import { rarityTier, type RarityTier } from "../lib/labels";
import { useI18n } from "./I18nProvider";

const TIER_COLORS: Record<RarityTier, string> = {
  Common: "var(--muted)",
  Rare: "var(--el-water)",
  Epic: "var(--el-dark)",
  Legendary: "var(--gold)",
};

export default function RarityBadge({ rarity }: { rarity: number }) {
  const { t } = useI18n();
  const tier = rarityTier(rarity);
  const color = TIER_COLORS[tier];
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold"
      style={{ color, borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }}
    >
      {t.rarity[tier]}
    </span>
  );
}
