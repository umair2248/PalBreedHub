import type { Metadata } from "next";
import { pals } from "@/lib/breeding";
import type { Locale } from "@/lib/i18n";
import PalView, { palMetadata } from "@/views/PalView";

export const dynamicParams = false;

export function generateStaticParams() {
  return pals.map((pal) => ({ slug: pal.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/pals/[slug]">): Promise<Metadata> {
  const { slug, locale } = await params;
  return palMetadata(slug, locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/pals/[slug]">) {
  const { slug, locale } = await params;
  return <PalView slug={slug} locale={locale as Locale} />;
}
