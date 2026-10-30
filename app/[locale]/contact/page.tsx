import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  return infoMetadata("contact", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/contact">) {
  return <InfoView page="contact" locale={(await params).locale as Locale} />;
}
