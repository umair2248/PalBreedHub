import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import PalsView, { palsMetadata } from "@/views/PalsView";

export async function generateMetadata({ params }: PageProps<"/[locale]/pals">): Promise<Metadata> {
  return palsMetadata((await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/pals">) {
  return <PalsView locale={(await params).locale as Locale} />;
}
