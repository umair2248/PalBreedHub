import { pals } from "@/lib/breeding";

export default function Home() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:py-20">
      <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
        Updated for Palworld 1.0
      </span>
      <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        Palworld <span className="text-accent">Breeding Calculator</span>
      </h1>
      <p className="max-w-2xl text-lg text-muted">
        Pick two parents to see their child, or pick a Pal to find every parent pair that breeds it.
        Covers {pals.length} Pals, including all variants and unique combos.
      </p>
      <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-muted">
        The calculator is coming soon.
      </div>
    </section>
  );
}
