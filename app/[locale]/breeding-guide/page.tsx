import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/breeding-guide">): Promise<Metadata> {
  return infoMetadata("guide", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/breeding-guide">) {
  return <InfoView page="guide" locale={(await params).locale as Locale} />;
}
