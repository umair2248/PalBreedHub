import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-16">
      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
        Coming soon
      </span>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-lg text-muted">{description}</p>
      <Link href="/" className="mt-2 font-medium text-accent hover:underline">
        ← Back to the Breeding Calculator
      </Link>
    </section>
  );
}
