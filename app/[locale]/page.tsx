import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import HomeView, { homeMetadata } from "@/views/HomeView";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  return homeMetadata((await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]">) {
  return <HomeView locale={(await params).locale as Locale} />;
}
