"use client";

import { useState } from "react";
import { getPal, type Gender, type ParentPair } from "../lib/breeding";
import { fmt } from "../lib/i18n/config";
import { useI18n } from "./I18nProvider";
import PairRow, { pairKey } from "./PairRow";

const INITIAL_COUNT = 20;

/** A parent pair as [parentA id, parentA gender, parentB id, parentB gender], small enough to send to the browser. */
export type PairRef = [string, Gender | null, string, Gender | null];

function fromRef([a, aGender, b, bGender]: PairRef): ParentPair {
  return { parentA: getPal(a)!, parentAGender: aGender, parentB: getPal(b)!, parentBGender: bGender };
}

/**
 * Parent pairs for a Pal, already sorted on the server: the 20 easiest are in the page HTML,
 * the rest show on "Show all". Working the pairs out in the browser would block the page for seconds on phones.
 */
export default function ParentPairs({ pairs }: { pairs: PairRef[] }) {
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const visible = (showAll ? pairs : pairs.slice(0, INITIAL_COUNT)).map(fromRef);

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
