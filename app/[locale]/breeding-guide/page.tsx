import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import GuideView, { guideMetadata } from "@/views/GuideView";

export async function generateMetadata({ params }: PageProps<"/[locale]/breeding-guide">): Promise<Metadata> {
  return guideMetadata((await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/breeding-guide">) {
  return <GuideView locale={(await params).locale as Locale} />;
}
