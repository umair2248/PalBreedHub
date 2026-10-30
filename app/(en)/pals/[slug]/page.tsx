import type { Metadata } from "next";
import { pals } from "@/lib/breeding";
import PalView, { palMetadata } from "@/views/PalView";

export const dynamicParams = false;

export function generateStaticParams() {
  return pals.map((pal) => ({ slug: pal.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pals/[slug]">): Promise<Metadata> {
  return palMetadata((await params).slug, "en");
}

export default async function Page({ params }: PageProps<"/pals/[slug]">) {
  return <PalView slug={(await params).slug} locale="en" />;
}
