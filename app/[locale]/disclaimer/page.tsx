import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/disclaimer">): Promise<Metadata> {
  return infoMetadata("disclaimer", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/disclaimer">) {
  return <InfoView page="disclaimer" locale={(await params).locale as Locale} />;
}
