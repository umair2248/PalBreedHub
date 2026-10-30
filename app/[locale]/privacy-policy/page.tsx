import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy-policy">): Promise<Metadata> {
  return infoMetadata("privacy", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/privacy-policy">) {
  return <InfoView page="privacy" locale={(await params).locale as Locale} />;
}
