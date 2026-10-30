"use client";

import Link from "next/link";
import type { Pal } from "../lib/breeding";
import { paldeckCode } from "../lib/labels";
import { ElementIcon, elementColor } from "./ElementIcon";
import PalAvatar from "./PalAvatar";
import { useI18n } from "./I18nProvider";
import RarityBadge from "./RarityBadge";

export default function PalCard({ pal }: { pal: Pal }) {
  const { href } = useI18n();
  return (
    <Link
      href={href(`/pals/${pal.slug}/`)}
      className="group relative flex h-full flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 pt-5 text-center transition hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_14px_40px_-20px_var(--glow)]"
    >
      <span className="absolute left-3 top-3 flex flex-col gap-1">
        {pal.elements.map((el) => (
          <span key={el} style={{ color: elementColor(el) }}>
            <ElementIcon element={el} className="h-4 w-4" />
          </span>
        ))}
      </span>
      <span className="absolute right-3 top-3 font-mono text-[11px] text-muted">{paldeckCode(pal)}</span>
      <span className="transition-transform group-hover:scale-105">
        <PalAvatar pal={pal} size="lg" />
      </span>
      <span className="font-semibold leading-tight">{pal.name}</span>
      <RarityBadge rarity={pal.rarity} />
    </Link>
  );
}
