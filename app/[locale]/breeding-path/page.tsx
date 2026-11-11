import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import ToolView, { toolMetadata } from "@/views/ToolView";

export async function generateMetadata({ params }: PageProps<"/[locale]/breeding-path">): Promise<Metadata> {
  return toolMetadata("path", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/breeding-path">) {
  return <ToolView page="path" locale={(await params).locale as Locale} />;
}
