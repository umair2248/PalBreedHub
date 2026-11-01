import { ElementSprite } from "@/components/ElementIcon";
import { I18nProvider } from "@/components/I18nProvider";
import NavProgress from "@/components/NavProgress";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { DEFAULT_LOCALE, LOCALE_INFO, getDictionary, type Locale } from "@/lib/i18n";

/** Header, footer and translations around every page of one language. */
export default function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <I18nProvider locale={locale} dict={getDictionary(locale)}>
      {locale !== DEFAULT_LOCALE && (
        // The root layout renders <html lang="en">; correct it for this language before paint
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(LOCALE_INFO[locale].hreflang)}` }} />
      )}
      <ElementSprite />
      <NavProgress />
      <SiteHeader locale={locale} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter locale={locale} />
    </I18nProvider>
  );
}
