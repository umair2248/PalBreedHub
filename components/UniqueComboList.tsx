"use client";

import Link from "next/link";
import { useState } from "react";
import { getUniqueComboChild, getUniqueCombos, type Gender, type Pal } from "../lib/breeding";
import { fmt } from "../lib/i18n/config";
import { ELEMENT_LABELS } from "../lib/labels";
import { ElementIcon, elementColor } from "./ElementIcon";
import { useI18n } from "./I18nProvider";
import PalAvatar from "./PalAvatar";

const GENDER_SIGN: Record<Gender, string> = { male: "♂", female: "♀" };
const COLLAPSED_COUNT = 12;

const combos = getUniqueCombos()
  .map((pair) => ({ ...pair, child: getUniqueComboChild(pair) }))
  .sort((a, b) => a.child.name.localeCompare(b.child.name));

const elements = Object.keys(ELEMENT_LABELS).filter((el) => combos.some((c) => c.child.elements.includes(el)));

function ComboPal({ pal, gender }: { pal: Pal; gender: Gender | null }) {
  const { href } = useI18n();
  return (
    <Link href={href(`/pals/${pal.slug}/`)} className="flex min-w-0 items-center gap-2 hover:text-accent">
      <PalAvatar pal={pal} size="sm" />
      <span className="truncate text-sm font-semibold">
        {pal.name}
        {gender && <span className="ml-1 text-muted">{GENDER_SIGN[gender]}</span>}
      </span>
    </Link>
  );
}

/** Every unique combo. All rows are in the HTML; the collapsed state only hides them visually. */
export default function UniqueComboList() {
  const { t, href } = useI18n();
  const [element, setElement] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = element ? combos.filter((c) => c.child.elements.includes(element)) : combos;
  const collapsed = !showAll && !element;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.combos.filterLabel}>
        <button
          type="button"
          aria-pressed={!element}
          onClick={() => setElement("")}
          className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
            !element ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-foreground"
          }`}
        >
          {fmt(t.combos.all, { count: combos.length })}
        </button>
        {elements.map((el) => {
          const on = element === el;
          const color = elementColor(el);
          return (
            <button
              key={el}
              type="button"
              aria-pressed={on}
              onClick={() => setElement(on ? "" : el)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition"
              style={{
                color,
                borderColor: on ? color : "var(--line)",
                background: on ? `color-mix(in srgb, ${color} 15%, transparent)` : "transparent",
              }}
            >
              <ElementIcon element={el} className="h-3.5 w-3.5" />
              {t.elements[el as keyof typeof t.elements]}
            </button>
          );
        })}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((combo, i) => (
          <li
            key={`${combo.parentA.id}-${combo.parentAGender}-${combo.parentB.id}-${combo.parentBGender}`}
            className={`flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:border-accent ${
              collapsed && i >= COLLAPSED_COUNT ? "hidden" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <ComboPal pal={combo.parentA} gender={combo.parentAGender} />
              <span className="text-muted" aria-hidden="true">
                +
              </span>
              <ComboPal pal={combo.parentB} gender={combo.parentBGender} />
            </div>
            <Link
              href={href(`/pals/${combo.child.slug}/`)}
              className="flex items-center gap-2 rounded-xl bg-surface-2 px-2 py-1.5 hover:text-accent"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">{t.combos.gives}</span>
              <PalAvatar pal={combo.child} size="sm" />
              <span className="truncate text-sm font-bold">{combo.child.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {!element && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mx-auto rounded-xl border border-line px-5 py-2.5 text-sm font-semibold transition hover:border-accent hover:text-accent"
        >
          {showAll ? t.combos.showFewer : fmt(t.combos.showAll, { count: combos.length })}
        </button>
      )}
    </div>
  );
}
