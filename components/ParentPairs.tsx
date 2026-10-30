"use client";

import { useState } from "react";
import { compareByEase, getParents, getPal } from "../lib/breeding";
import { fmt } from "../lib/i18n/config";
import { useI18n } from "./I18nProvider";
import PairRow, { orientPair, pairKey } from "./PairRow";

const INITIAL_COUNT = 20;

/** Parent pairs for a Pal: the 20 easiest are in the page HTML, the rest load on "Show all". */
export default function ParentPairs({ palId }: { palId: string }) {
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const pal = getPal(palId)!;
  const pairs = getParents(pal)
    .map((p) => orientPair(p, null))
    .sort(compareByEase);
  const visible = showAll ? pairs : pairs.slice(0, INITIAL_COUNT);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface" data-testid="parent-pairs">
        {visible.map((pair) => (
          <PairRow key={pairKey(pair)} pair={pair} />
        ))}
      </ul>
      {pairs.length > INITIAL_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="w-fit rounded-xl border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
        >
          {showAll ? t.pal.showFewer : fmt(t.pal.showAll, { count: pairs.length })}
        </button>
      )}
    </div>
  );
}
