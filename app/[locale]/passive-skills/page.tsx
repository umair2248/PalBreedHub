import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import InfoView, { infoMetadata } from "@/views/InfoView";

export async function generateMetadata({ params }: PageProps<"/[locale]/passive-skills">): Promise<Metadata> {
  return infoMetadata("passives", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/passive-skills">) {
  return <InfoView page="passives" locale={(await params).locale as Locale} />;
}
