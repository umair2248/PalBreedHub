import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">): Promise<Metadata> {
  return infoMetadata("terms", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/terms">) {
  return <InfoView page="terms" locale={(await params).locale as Locale} />;
}
