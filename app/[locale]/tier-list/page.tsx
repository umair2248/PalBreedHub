import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/tier-list">): Promise<Metadata> {
  return infoMetadata("tierList", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/tier-list">) {
  return <InfoView page="tierList" locale={(await params).locale as Locale} />;
}
