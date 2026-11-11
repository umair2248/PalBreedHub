"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { getPal, pals, type Gender, type Pal } from "../lib/breeding";
import { findBreedingPath, type PathStep } from "../lib/breeding-path";
import { fmt } from "../lib/i18n/config";
import { useI18n } from "./I18nProvider";
import PalAvatar from "./PalAvatar";
import PalSelect from "./PalSelect";

const STORAGE_KEY = "pbh-owned-pals";
const GENDER_SIGN: Record<Gender, string> = { male: "♂", female: "♀" };
const options = [...pals].sort((a, b) => a.name.localeCompare(b.name));

// Owned Pals live in localStorage; this small store lets React read them without a hydration mismatch
const NONE: Pal[] = [];
const listeners = new Set<() => void>();
let memory: Pal[] | null = null; // used when storage is blocked
let lastRaw: string | null = null;
let lastList: Pal[] = NONE;

function readOwned(): Pal[] {
  if (memory) return memory;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return NONE;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const ids: unknown = JSON.parse(raw ?? "[]");
      lastList = Array.isArray(ids) ? ids.map((id) => getPal(String(id))).filter((p): p is Pal => Boolean(p)) : NONE;
    } catch {
      lastList = NONE;
    }
  }
  return lastList;
}

function writeOwned(owned: Pal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(owned.map((p) => p.id)));
  } catch {
    // Private mode or blocked storage: keep the list for this visit only
    memory = owned;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function StepPal({ pal, gender }: { pal: Pal; gender: Gender | null }) {
  const { t, href } = useI18n();
  return (
    <Link href={href(`/pals/${pal.slug}/`)} className="flex min-w-0 items-center gap-2 hover:text-accent">
      <PalAvatar pal={pal} size="sm" />
      <span className="truncate text-sm font-semibold">
        {pal.name}
        {gender && (
          <span
            className="ml-1 font-bold"
            style={{ color: gender === "male" ? "var(--male)" : "var(--female)" }}
            aria-label={t.gender[gender]}
          >
            {GENDER_SIGN[gender]}
          </span>
        )}
      </span>
    </Link>
  );
}

function StepRow({ step, isTarget }: { step: PathStep; isTarget: boolean }) {
  const { t } = useI18n();
  return (
    <li
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-2 ${
        isTarget ? "border-accent bg-accent-soft" : "border-line bg-surface-2"
      }`}
    >
      <StepPal pal={step.parentA} gender={step.parentAGender} />
      <span className="text-muted" aria-hidden="true">
        +
      </span>
      <StepPal pal={step.parentB} gender={step.parentBGender} />
      <span className="text-sm text-muted">{t.path.gives}</span>
      <StepPal pal={step.child} gender={null} />
    </li>
  );
}

/** Owned Pals (kept in localStorage) + a target, and the shortest breeding path between them. */
export default function BreedingPathFinder() {
  const { t } = useI18n();
  const owned = useSyncExternalStore(subscribe, readOwned, () => NONE);
  const [target, setTarget] = useState<Pal | null>(null);
  const setOwned = (update: (list: Pal[]) => Pal[]) => writeOwned(update(readOwned()));

  const addOptions = useMemo(() => options.filter((p) => !owned.some((o) => o.id === p.id)), [owned]);
  const path = useMemo(() => (target && owned.length > 0 ? findBreedingPath(owned, target) : undefined), [owned, target]);

  const generations = path
    ? Array.from({ length: path.generations }, (_, i) => path.steps.filter((s) => s.generation === i + 1))
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section className="panel flex flex-col gap-4 p-5" aria-label={t.path.ownedLabel}>
        <PalSelect
          id="path-owned"
          label={t.path.ownedLabel}
          options={addOptions}
          value={null}
          onChange={(pal) => setOwned((list) => [...list, pal])}
          placeholder={t.path.ownedPlaceholder}
        />
        {owned.length === 0 ? (
          <p className="text-sm text-muted">{t.path.ownedEmpty}</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 text-xs text-muted">
              <span>{fmt(t.path.ownedCount, { count: owned.length })}</span>
              <button type="button" onClick={() => setOwned(() => [])} className="font-semibold hover:text-accent">
                {t.path.clear}
              </button>
            </div>
            <ul className="flex flex-wrap gap-2" data-testid="owned-pals">
              {owned.map((pal) => (
                <li key={pal.id} className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 py-1 pr-1 pl-1.5">
                  <PalAvatar pal={pal} size="sm" />
                  <span className="text-sm font-semibold">{pal.name}</span>
                  <button
                    type="button"
                    onClick={() => setOwned((list) => list.filter((p) => p.id !== pal.id))}
                    aria-label={fmt(t.path.remove, { name: pal.name })}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-accent"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="panel flex flex-col gap-4 p-5" aria-live="polite">
        <PalSelect
          id="path-target"
          label={t.path.targetLabel}
          options={options}
          value={target}
          onChange={setTarget}
          placeholder={t.path.targetPlaceholder}
        />

        {!target || owned.length === 0 ? (
          <p className="text-sm text-muted">{t.path.start}</p>
        ) : path === null ? (
          <p className="rounded-xl border border-dashed border-line-strong p-4 text-sm text-muted">
            {fmt(t.path.unreachable, { name: target.name })}
          </p>
        ) : path && path.generations === 0 ? (
          <p className="rounded-xl bg-accent-soft p-4 text-sm font-semibold">{fmt(t.path.owned, { name: target.name })}</p>
        ) : (
          path && (
            <div className="flex flex-col gap-4" data-testid="breeding-path">
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  {fmt(t.path.resultTitle, { name: target.name, count: path.generations })}
                </h2>
                <p className="text-sm text-muted">{fmt(t.path.resultSteps, { count: path.steps.length })}</p>
              </div>
              <ol className="flex flex-col gap-4">
                {generations.map((steps, i) => (
                  <li key={i} className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent">
                      {fmt(t.path.generation, { n: i + 1 })}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {steps.map((step) => (
                        <StepRow key={step.child.id} step={step} isTarget={step.child.id === target.id} />
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          )
        )}
      </section>
    </div>
  );
}
