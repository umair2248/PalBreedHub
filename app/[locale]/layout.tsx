import { PREFIXED_LOCALES, type Locale } from "@/lib/i18n";
import SiteShell from "@/views/SiteShell";

export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  return <SiteShell locale={(await params).locale as Locale}>{children}</SiteShell>;
}
