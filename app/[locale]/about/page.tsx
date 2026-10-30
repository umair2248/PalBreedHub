import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  return infoMetadata("about", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/about">) {
  return <InfoView page="about" locale={(await params).locale as Locale} />;
}
