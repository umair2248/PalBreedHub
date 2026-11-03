import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import CombosView, { combosMetadata } from "@/views/CombosView";

export async function generateMetadata({ params }: PageProps<"/[locale]/breeding-combos">): Promise<Metadata> {
  return combosMetadata((await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/breeding-combos">) {
  return <CombosView locale={(await params).locale as Locale} />;
}
