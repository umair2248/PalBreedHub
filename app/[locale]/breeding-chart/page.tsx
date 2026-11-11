import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import ToolView, { toolMetadata } from "@/views/ToolView";

export async function generateMetadata({ params }: PageProps<"/[locale]/breeding-chart">): Promise<Metadata> {
  return toolMetadata("chart", (await params).locale as Locale);
}

export default async function Page({ params }: PageProps<"/[locale]/breeding-chart">) {
  return <ToolView page="chart" locale={(await params).locale as Locale} />;
}
