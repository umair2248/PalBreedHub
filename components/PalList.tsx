"use client";

import { useMemo, useState } from "react";
import { pals, type Pal } from "../lib/breeding";
import { fmt } from "../lib/i18n/config";
import { ElementIcon, elementColor } from "./ElementIcon";
import { useI18n } from "./I18nProvider";
import PalCard from "./PalCard";

const inputClass =
  "h-11 rounded-xl border border-line bg-surface-2 px-3 text-base font-normal text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15";

type SortKey = "paldeck" | "name" | "rarity" | "power";

const SORTS: Record<SortKey, { label: "sortPaldeck" | "sortName" | "sortRarity" | "sortPower"; compare: (a: Pal, b: Pal) => number }> = {
  paldeck: { label: "sortPaldeck", compare: () => 0 },
  name: { label: "sortName", compare: (a, b) => a.name.localeCompare(b.name) },
  rarity: { label: "sortRarity", compare: (a, b) => b.rarity - a.rarity },
  power: { label: "sortPower", compare: (a, b) => a.breedingPower - b.breedingPower },
};

/** Searchable, filterable grid of every Pal. */
export default function PalList() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [element, setElement] = useState("");
  const [work, setWork] = useState("");
  const [sort, setSort] = useState<SortKey>("paldeck");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pals
      .filter(
        (p) =>
          (!q || p.name.toLowerCase().includes(q)) &&
          (!element || p.elements.includes(element)) &&
          (!work || work in p.workSuitability),
      )
      .sort(SORTS[sort].compare);
  }, [search, element, work, sort]);

  const filtering = search || element || work || sort !== "paldeck";

  return (
    <div className="flex flex-col gap-4">
      <div className="panel grid gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
          {t.list.search}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.list.searchPlaceholder}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
          {t.list.element}
          <select value={element} onChange={(e) => setElement(e.target.value)} className={inputClass}>
            <option value="">{t.list.allElements}</option>
            {Object.entries(t.elements).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
          {t.list.work}
          <select value={work} onChange={(e) => setWork(e.target.value)} className={inputClass}>
            <option value="">{t.list.allWork}</option>
            {Object.entries(t.work).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
          {t.list.sortBy}
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputClass}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {t.list[label]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-4" role="group" aria-label={t.list.quickFilter}>
          {Object.entries(t.elements).map(([key, label]) => {
            const on = element === key;
            const color = elementColor(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => setElement(on ? "" : key)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition"
                style={{
                  color,
                  borderColor: on ? color : "var(--line)",
                  background: on ? `color-mix(in srgb, ${color} 15%, transparent)` : "transparent",
                }}
              >
                <ElementIcon element={key} className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-muted">
        <p aria-live="polite" data-testid="pal-count">
          {filtered.length === pals.length
            ? fmt(t.list.count, { count: pals.length })
            : fmt(t.list.countOf, { count: filtered.length, total: pals.length })}
        </p>
        {filtering && (
          <button
            type="button"
            className="font-medium hover:text-accent"
            onClick={() => {
              setSearch("");
              setElement("");
              setWork("");
              setSort("paldeck");
            }}
          >
            {t.list.clear}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-muted">{t.list.none}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" data-testid="pal-grid">
          {filtered.map((pal) => (
            <li key={pal.id}>
              <PalCard pal={pal} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
