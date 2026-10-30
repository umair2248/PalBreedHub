"use client";

import Link from "next/link";
import { useState } from "react";
import { canBreed, getChildOutcomes, getPal, isUniqueCombo, pals, type Gender, type Pal } from "../lib/breeding";
import { fmt } from "../lib/i18n/config";
import { paldeckCode } from "../lib/labels";
import ArrowIcon from "./ArrowIcon";
import { ElementBadges } from "./ElementBadge";
import { useI18n } from "./I18nProvider";
import PalAvatar from "./PalAvatar";
import PalSelect from "./PalSelect";
import RarityBadge from "./RarityBadge";

const options = pals.filter(canBreed).sort((a, b) => a.name.localeCompare(b.name));

const GENDER_SIGN: Record<Gender, string> = { male: "♂", female: "♀" };

// Quick-start examples: [parent 1 id, parent 2 id]
const EXAMPLES: [string, string][] = [
  ["LazyDragon", "ElecCat"],
  ["CatMage", "FoxMage"],
  ["IceHorse", "HadesBird"],
  ["Hedgehog", "Penguin"],
];
const examplePairs = EXAMPLES.map(([a, b]) => [getPal(a), getPal(b)]).filter(
  (pair): pair is [Pal, Pal] => Boolean(pair[0] && pair[1]),
);

function ParentSlot({
  id,
  label,
  gender,
  value,
  onChange,
}: {
  id: string;
  label: string;
  gender: Gender;
  value: Pal | null;
  onChange: (pal: Pal) => void;
}) {
  const { t } = useI18n();
  const genderColor = gender === "male" ? "var(--male)" : "var(--female)";
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4">
      <span
        className="absolute -top-3 left-4 flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold text-white shadow"
        style={{ background: genderColor }}
      >
        <span aria-hidden="true">{GENDER_SIGN[gender]}</span> {label}
      </span>
      <div className="flex min-h-20 items-center gap-3 pt-2">
        {value ? (
          <>
            <PalAvatar pal={value} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-xs text-muted">{paldeckCode(value)}</span>
              <ElementBadges elements={value.elements} />
              <span className="text-xs text-muted">
                {t.calc.breedingPower} <span className="font-semibold text-foreground">{value.breedingPower}</span>
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line-strong text-2xl text-muted">
              ?
            </span>
            <span className="text-sm text-muted">{t.calc.choose}</span>
          </>
        )}
      </div>
      <PalSelect id={id} label={label} options={options} value={value} onChange={onChange} hideLabel />
    </div>
  );
}

function WhyThisChild({ parentA, parentB, child }: { parentA: Pal; parentB: Pal; child: Pal }) {
  const { t } = useI18n();
  if (parentA.id === parentB.id) {
    return <>{t.calc.whySame}</>;
  }
  if (isUniqueCombo(parentA, parentB)) {
    return (
      <>
        <span className="font-semibold text-gold">{t.calc.whyUniqueLabel}</span> {fmt(t.calc.whyUnique, { name: child.name })}
      </>
    );
  }
  const target = Math.floor((parentA.breedingPower + parentB.breedingPower + 1) / 2);
  return (
    <>
      ({parentA.breedingPower} + {parentB.breedingPower} + 1) ÷ 2 ={" "}
      <span className="font-semibold text-foreground">{target}</span>.{" "}
      {fmt(t.calc.whyFormula, { name: child.name, power: child.breedingPower })}
    </>
  );
}

function ChildCard({ child, parentA, parentB }: { child: Pal; parentA: Pal; parentB: Pal }) {
  const { t, href } = useI18n();
  return (
    <div className="animate-pop flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <PalAvatar pal={child} size="xl" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-mono text-xs text-muted">{paldeckCode(child)}</span>
          <span className="text-2xl font-extrabold leading-tight sm:text-3xl" data-testid="child-name">
            {child.name}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <ElementBadges elements={child.elements} />
            <RarityBadge rarity={child.rarity} />
          </span>
        </div>
      </div>
      <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
        <span className="font-semibold text-foreground">{t.calc.why} </span>
        <WhyThisChild parentA={parentA} parentB={parentB} child={child} />
      </p>
      <Link
        href={href(`/pals/${child.slug}/`)}
        className="btn-primary group flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:opacity-90"
      >
        {fmt(t.calc.view, { name: child.name })}
        <ArrowIcon />
      </Link>
    </div>
  );
}

export default function BreedingCalculator() {
  const { t } = useI18n();
  const [parentA, setParentA] = useState<Pal | null>(null);
  const [parentB, setParentB] = useState<Pal | null>(null);

  const outcomes = parentA && parentB ? getChildOutcomes(parentA, parentB) : [];
  const genderDependent = outcomes.some((o) => o.parentAGender !== null);

  return (
    <div className="panel flex flex-col gap-5 p-4 sm:p-6">
      <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1.15fr]">
        <ParentSlot id="parent-1" label={t.calc.parent1} gender="male" value={parentA} onChange={setParentA} />

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setParentA(parentB);
              setParentB(parentA);
            }}
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-xl font-bold text-muted transition hover:border-accent hover:text-accent"
            aria-label={t.calc.swap}
            title={t.calc.swap}
          >
            <span aria-hidden="true" className="group-hover:hidden">
              +
            </span>
            <span aria-hidden="true" className="hidden text-base group-hover:inline">
              ⇄
            </span>
          </button>
        </div>

        <ParentSlot id="parent-2" label={t.calc.parent2} gender="female" value={parentB} onChange={setParentB} />

        <div className="flex items-center justify-center text-2xl font-bold text-muted" aria-hidden="true">
          <span className="rotate-90 lg:rotate-0">=</span>
        </div>

        <div
          className={`relative flex flex-col justify-center rounded-2xl border p-4 transition ${
            outcomes.length > 0 ? "result-glow border-transparent bg-surface" : "border-dashed border-line-strong bg-surface-2"
          }`}
          aria-live="polite"
        >
          <span className="absolute -top-3 left-4 flex h-6 items-center rounded-full bg-accent px-2.5 text-xs font-bold text-accent-contrast shadow">
            {t.calc.child}
          </span>

          {outcomes.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, image is already sized */}
              <img src="/egg.webp" alt="" aria-hidden="true" width={350} height={420} className="h-20 w-auto animate-pulse opacity-80" />
              <p className="text-muted">{t.calc.pickTwo}</p>
            </div>
          )}

          {outcomes.length > 0 && !genderDependent && (
            <div className="pt-2">
              <ChildCard child={outcomes[0].child} parentA={parentA!} parentB={parentB!} />
            </div>
          )}

          {genderDependent && (
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-sm font-medium text-gold">{t.calc.genderDepends}</p>
              {outcomes.map((o) => (
                <div
                  key={`${o.parentAGender}-${o.parentBGender}`}
                  className="flex flex-col gap-2 border-t border-line pt-4 first:border-0 first:pt-0"
                >
                  <span className="text-sm font-medium">
                    {parentA!.name} {GENDER_SIGN[o.parentAGender!]} + {parentB!.name} {GENDER_SIGN[o.parentBGender!]}
                  </span>
                  <ChildCard child={o.child} parentA={parentA!} parentB={parentB!} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">{t.calc.try}</span>
          {examplePairs.map(([a, b]) => (
            <button
              key={`${a.id}-${b.id}`}
              type="button"
              onClick={() => {
                setParentA(a);
                setParentB(b);
              }}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 font-medium transition hover:border-accent hover:text-accent"
            >
              {a.name} + {b.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setParentA(null);
            setParentB(null);
          }}
          className="w-fit shrink-0 self-end rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-surface-hover hover:text-foreground sm:self-auto"
        >
          <span aria-hidden="true">↺</span> {t.calc.reset}
        </button>
      </div>
    </div>
  );
}
