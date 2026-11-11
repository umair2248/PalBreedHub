"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { canBreed, getChildOutcomes, isUniqueCombo, pals, type BreedingOutcome, type Pal } from "../lib/breeding";
import { fmt } from "../lib/i18n/config";
import { ElementIcon, elementColor } from "./ElementIcon";
import { useI18n } from "./I18nProvider";
import PalAvatar from "./PalAvatar";
import PalSelect from "./PalSelect";

const CELL_W = 84;
const CELL_H = 64;
const HEAD_W = 132;
const HEAD_H = 72;
/** Extra rows/columns rendered outside the viewport so fast scrolling doesn't show gaps */
const OVERSCAN = 2;

const breedable = pals.filter(canBreed);
const searchOptions = [...breedable].sort((a, b) => a.name.localeCompare(b.name));

// Children worked out so far, shared by every render (the result of a pair never changes)
const outcomeCache = new Map<string, BreedingOutcome[]>();

function outcomes(a: Pal, b: Pal): BreedingOutcome[] {
  const key = `${a.id}|${b.id}`;
  let result = outcomeCache.get(key);
  if (!result) {
    result = getChildOutcomes(a, b);
    outcomeCache.set(key, result);
  }
  return result;
}

/**
 * Every Pal against every Pal (~290 × 290 cells). Only the cells in view are rendered, and each
 * child is worked out when its cell first appears, so the page stays fast on phones.
 */
export default function BreedingChart() {
  const { t, href } = useI18n();
  const [element, setElement] = useState("");
  const [focus, setFocus] = useState<Pal | null>(null);
  const [view, setView] = useState({ top: 0, left: 0, width: 1200, height: 800 });
  const scroller = useRef<HTMLDivElement>(null);

  const list = useMemo(() => (element ? breedable.filter((p) => p.elements.includes(element)) : breedable), [element]);
  const n = list.length;

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // A box that isn't laid out yet reports 0; keep a sensible size so the grid isn't empty
      setView({ top: el.scrollTop, left: el.scrollLeft, width: el.clientWidth || 1200, height: el.clientHeight || 800 });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", schedule);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // Scroll the chosen Pal's row and column to the top-left corner of the grid
  useEffect(() => {
    if (!focus) return;
    const index = list.findIndex((p) => p.id === focus.id);
    if (index >= 0) scroller.current?.scrollTo?.({ top: index * CELL_H, left: index * CELL_W, behavior: "smooth" });
  }, [focus, list]);

  function jumpTo(pal: Pal) {
    // A Pal hidden by the element filter can't be shown, so clear the filter first
    if (element && !pal.elements.includes(element)) setElement("");
    setFocus(pal);
  }

  const col0 = Math.max(0, Math.floor(view.left / CELL_W) - OVERSCAN);
  const col1 = Math.min(n, Math.ceil((view.left + view.width - HEAD_W) / CELL_W) + OVERSCAN);
  const row0 = Math.max(0, Math.floor(view.top / CELL_H) - OVERSCAN);
  const row1 = Math.min(n, Math.ceil((view.top + view.height - HEAD_H) / CELL_H) + OVERSCAN);
  const cols = list.slice(col0, col1).map((pal, i) => ({ pal, index: col0 + i }));
  const rows = list.slice(row0, row1).map((pal, i) => ({ pal, index: row0 + i }));

  const headerLink = "flex items-center gap-2 hover:text-accent";

  return (
    <div className="flex flex-col gap-4">
      <div className="panel flex flex-col gap-4 p-4">
        <div className="max-w-sm">
          <PalSelect
            id="chart-jump"
            label={t.chart.jumpLabel}
            options={searchOptions}
            value={focus}
            onChange={jumpTo}
            placeholder={t.chart.jumpPlaceholder}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.chart.filterLabel}>
          <button
            type="button"
            onClick={() => setElement("")}
            aria-pressed={element === ""}
            className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
              element === "" ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-foreground"
            }`}
          >
            {t.chart.all}
          </button>
          {Object.entries(t.elements).map(([key, label]) => {
            const on = element === key;
            const color = elementColor(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setElement(on ? "" : key)}
                aria-pressed={on}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition"
                style={{
                  color: on ? color : undefined,
                  borderColor: on ? color : "var(--line)",
                  background: on ? `color-mix(in srgb, ${color} 14%, transparent)` : undefined,
                }}
              >
                <ElementIcon element={key} className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
          <span>{fmt(t.chart.gridLabel, { count: n })}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border-2 border-gold" aria-hidden="true" />
            {t.chart.legendUnique}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold" aria-hidden="true">
              ♂♀
            </span>
            {t.chart.legendGender}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-accent-soft ring-1 ring-accent" aria-hidden="true" />
            {t.chart.legendFocus}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted">{t.chart.hint}</p>

      <div
        ref={scroller}
        role="region"
        aria-label={fmt(t.chart.gridLabel, { count: n })}
        tabIndex={0}
        className="relative h-[75vh] min-h-96 overflow-auto overscroll-contain rounded-2xl border border-line bg-surface"
        data-testid="breeding-chart"
      >
        <div style={{ width: HEAD_W + n * CELL_W, height: HEAD_H + n * CELL_H }}>
          {/* Column headers: stick to the top */}
          <div className="sticky top-0 z-20 flex" style={{ height: HEAD_H, width: HEAD_W + n * CELL_W }}>
            <div
              className="sticky left-0 z-30 flex flex-none items-center justify-center border-r border-b border-line bg-surface-2 px-2 text-center text-[11px] font-semibold text-muted"
              style={{ width: HEAD_W }}
            >
              {t.chart.corner}
            </div>
            <div className="relative flex-none border-b border-line bg-surface-2" style={{ width: n * CELL_W }}>
              {cols.map(({ pal, index }) => (
                <Link
                  key={pal.id}
                  href={href(`/pals/${pal.slug}/`)}
                  prefetch={false}
                  className={`absolute top-0 flex flex-col items-center justify-center gap-1 border-r border-line px-1 text-center hover:text-accent ${
                    focus?.id === pal.id ? "bg-accent-soft text-accent" : ""
                  }`}
                  style={{ left: index * CELL_W, width: CELL_W, height: HEAD_H }}
                >
                  <PalAvatar pal={pal} size="sm" />
                  <span className="w-full truncate text-[11px] font-semibold">{pal.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex" style={{ height: n * CELL_H }}>
            {/* Row headers: stick to the left */}
            <div className="sticky left-0 z-10 flex-none border-r border-line bg-surface-2" style={{ width: HEAD_W, height: n * CELL_H }}>
              {rows.map(({ pal, index }) => (
                <Link
                  key={pal.id}
                  href={href(`/pals/${pal.slug}/`)}
                  prefetch={false}
                  className={`${headerLink} absolute left-0 border-b border-line px-2 ${focus?.id === pal.id ? "bg-accent-soft text-accent" : ""}`}
                  style={{ top: index * CELL_H, width: HEAD_W, height: CELL_H }}
                >
                  <PalAvatar pal={pal} size="sm" />
                  <span className="min-w-0 truncate text-xs font-semibold">{pal.name}</span>
                </Link>
              ))}
            </div>

            {/* Cells */}
            <div className="relative flex-none" style={{ width: n * CELL_W }}>
              {rows.map(({ pal: a, index: r }) =>
                cols.map(({ pal: b, index: c }) => {
                  const results = outcomes(a, b);
                  const child = results[0]?.child;
                  if (!child) return null;
                  const children = [...new Set(results.map((o) => o.child.name))];
                  const unique = a.id !== b.id && isUniqueCombo(a, b);
                  const focused = focus && (focus.id === a.id || focus.id === b.id);
                  return (
                    <Link
                      key={`${a.id}|${b.id}`}
                      href={href(`/pals/${child.slug}/`)}
                      prefetch={false}
                      title={fmt(t.chart.cellTitle, { a: a.name, b: b.name, child: children.join(" / ") })}
                      className={`absolute flex flex-col items-center justify-center gap-0.5 border-r border-b border-line px-1 text-center transition-colors hover:bg-surface-2 hover:text-accent ${
                        focused ? "bg-accent-soft" : ""
                      } ${unique ? "outline-2 -outline-offset-2 outline-gold" : ""}`}
                      style={{ left: c * CELL_W, top: r * CELL_H, width: CELL_W, height: CELL_H }}
                    >
                      <PalAvatar pal={child} size="sm" />
                      <span className="w-full truncate text-[10px] font-semibold leading-tight">
                        {children.length > 1 && <span className="mr-0.5 font-bold text-gold">♂♀</span>}
                        {child.name}
                      </span>
                    </Link>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
