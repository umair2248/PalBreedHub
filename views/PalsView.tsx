import type { Metadata } from "next";
import PalList from "@/components/PalList";
import { pals } from "@/lib/breeding";
import { fmt, getDictionary, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";

export function palsMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    title: { absolute: t.meta.palsTitle },
    description: fmt(t.meta.palsDescription, { count: pals.length }),
    alternates: pageAlternates("/pals/", locale),
  };
}

export default function PalsView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:py-14">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-72" aria-hidden="true" />
      <span className="w-fit rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
        {fmt(t.palsPage.badge, { count: pals.length })}
      </span>
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        {t.palsPage.h1a} <span className="text-gradient">{t.palsPage.h1b}</span>
      </h1>
      <p className="max-w-2xl text-lg text-muted">{fmt(t.palsPage.intro, { count: pals.length })}</p>
      <PalList />
    </section>
  );
}
