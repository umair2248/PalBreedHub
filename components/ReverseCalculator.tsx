"use client";

import { useMemo, useState } from "react";
import { canBreed, compareByEase, getParents, orientPair, pals, type Pal, type ParentPair } from "../lib/breeding";
import { fmt } from "../lib/i18n/config";
import ArrowIcon from "./ArrowIcon";
import { ElementBadges } from "./ElementBadge";
import { useI18n } from "./I18nProvider";
import PairRow, { pairKey } from "./PairRow";
import PalAvatar from "./PalAvatar";
import PalSelect from "./PalSelect";
import RarityBadge from "./RarityBadge";

const PAGE_SIZE = 20;

const targetOptions = [...pals].sort((a, b) => a.name.localeCompare(b.name));
const ownedOptions = targetOptions.filter(canBreed);

type SortKey = "name" | "common" | "rare";

const SORTS: Record<SortKey, { label: "sortName" | "sortCommon" | "sortRare"; compare: (a: ParentPair, b: ParentPair) => number }> = {
  name: {
    label: "sortName",
    compare: (a, b) => a.parentA.name.localeCompare(b.parentA.name) || a.parentB.name.localeCompare(b.parentB.name),
  },
  common: { label: "sortCommon", compare: compareByEase },
  rare: { label: "sortRare", compare: (a, b) => compareByEase(b, a) },
};

export default function ReverseCalculator() {
  const { t } = useI18n();
  const [target, setTarget] = useState<Pal | null>(null);
  const [owned, setOwned] = useState<Pal | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("common");
  const [page, setPage] = useState(1);

  const allPairs = useMemo(() => (target ? getParents(target) : []), [target]);

  const pairs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPairs
      .filter((p) => !owned || p.parentA.id === owned.id || p.parentB.id === owned.id)
      .filter((p) => !q || p.parentA.name.toLowerCase().includes(q) || p.parentB.name.toLowerCase().includes(q))
      .map((p) => orientPair(p, owned))
      .sort(SORTS[sort].compare);
  }, [allPairs, owned, search, sort]);

  const pageCount = Math.max(1, Math.ceil(pairs.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = pairs.slice(start, start + PAGE_SIZE);

  return (
    <div className="panel flex flex-col gap-5 p-4 sm:p-6">
      <div className="grid items-start gap-4 md:grid-cols-2">
        <PalSelect
          id="reverse-target"
          label={t.reverse.want}
          options={targetOptions}
          value={target}
          onChange={(pal) => {
            setTarget(pal);
            setPage(1);
          }}
        />
        <div className="flex flex-col gap-1">
          <PalSelect
            id="reverse-owned"
            label={t.reverse.owned}
            placeholder={t.reverse.ownedPlaceholder}
            options={ownedOptions}
            value={owned}
            onChange={(pal) => {
              setOwned(pal);
              setPage(1);
            }}
          />
          {owned && (
            <button
              type="button"
              className="w-fit self-end text-sm font-medium text-muted hover:text-accent"
              onClick={() => {
                setOwned(null);
                setPage(1);
              }}
            >
              {t.reverse.clearFilter}
            </button>
          )}
        </div>
      </div>

      {!target && (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface-2 p-8 text-center text-muted">
          {t.reverse.pickTarget}
        </p>
      )}

      {target && (
        <div className="animate-pop flex flex-wrap items-center gap-4 rounded-2xl bg-surface-2 p-4">
          <PalAvatar pal={target} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl font-extrabold">{target.name}</span>
            <span className="flex flex-wrap items-center gap-1.5">
              <ElementBadges elements={target.elements} />
              <RarityBadge rarity={target.rarity} />
            </span>
          </div>
          <div className="text-right">
            <span className="text-gradient block text-3xl font-black">{allPairs.length}</span>
            <span className="text-xs text-muted">{t.reverse.parentPairs}</span>
          </div>
        </div>
      )}

      {target && allPairs.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface-2 p-6 text-center text-muted">
          {fmt(t.reverse.cantBreed, { name: target.name })}
        </p>
      )}

      {target && allPairs.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-muted">
              {t.reverse.searchParents}
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t.reverse.searchPlaceholder}
                className="h-11 rounded-xl border border-line bg-surface-2 px-3 text-base font-normal text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-muted">
              {t.reverse.sortBy}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortKey);
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-line bg-surface-2 px-3 text-base font-normal text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
              >
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {t.reverse[label]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-sm text-muted" aria-live="polite" data-testid="pair-count">
            {pairs.length === 0
              ? t.reverse.noMatch
              : fmt(t.reverse.showing, { from: start + 1, to: start + visible.length, total: pairs.length, name: target.name })}
          </p>

          {visible.length > 0 && (
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface" data-testid="pair-list">
              {visible.map((pair) => (
                <PairRow key={pairKey(pair)} pair={pair} />
              ))}
            </ul>
          )}

          {pageCount > 1 && (
            <nav aria-label={t.reverse.pagination} className="flex items-center justify-between gap-2 text-sm">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="group flex items-center gap-2 rounded-xl border border-line px-4 py-2 font-medium transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowIcon direction="left" />
                {t.reverse.previous}
              </button>
              <span className="text-muted">
                {fmt(t.reverse.page, { page: currentPage, count: pageCount })}
              </span>
              <button
                type="button"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
                className="group flex items-center gap-2 rounded-xl border border-line px-4 py-2 font-medium transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
              >
                {t.reverse.next}
                <ArrowIcon />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
