"use client";

import Link from "next/link";
import type { Gender, Pal, ParentPair } from "../lib/breeding";
import { ElementBadges } from "./ElementBadge";
import { useI18n } from "./I18nProvider";
import PalAvatar from "./PalAvatar";

const GENDER_SIGN: Record<Gender, string> = { male: "♂", female: "♀" };

export function PalName({ pal, gender }: { pal: Pal; gender: Gender | null }) {
  const { t, href } = useI18n();
  return (
    <span className="flex min-w-0 items-center gap-3">
      <PalAvatar pal={pal} size="md" />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1.5">
          <Link href={href(`/pals/${pal.slug}/`)} className="truncate font-semibold hover:text-accent">
            {pal.name}
          </Link>
          {gender && (
            <span
              className="text-sm font-bold"
              style={{ color: gender === "male" ? "var(--male)" : "var(--female)" }}
              aria-label={t.gender[gender]}
            >
              {GENDER_SIGN[gender]}
            </span>
          )}
        </span>
        <ElementBadges elements={pal.elements} />
      </span>
    </span>
  );
}

/** One "Parent A + Parent B" line in a list of parent pairs. */
export default function PairRow({ pair }: { pair: ParentPair }) {
  return (
    <li className="grid gap-2 px-4 py-3 transition-colors hover:bg-surface-hover sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
      <PalName pal={pair.parentA} gender={pair.parentAGender} />
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-sm font-bold text-muted max-sm:ml-3"
        aria-hidden="true"
      >
        +
      </span>
      <PalName pal={pair.parentB} gender={pair.parentBGender} />
    </li>
  );
}

export function pairKey(pair: ParentPair): string {
  return `${pair.parentA.id}-${pair.parentAGender}-${pair.parentB.id}-${pair.parentBGender}`;
}

/** Puts the given Pal first, otherwise the alphabetically first parent, keeping genders with their Pal. */
export function orientPair(pair: ParentPair, first: Pal | null): ParentPair {
  const flip = first
    ? pair.parentB.id === first.id && pair.parentA.id !== first.id
    : pair.parentB.name.localeCompare(pair.parentA.name) < 0;
  return flip
    ? { parentA: pair.parentB, parentB: pair.parentA, parentAGender: pair.parentBGender, parentBGender: pair.parentAGender }
    : pair;
}
