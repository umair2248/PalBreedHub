import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/site-links";
import { pals } from "@/lib/breeding";
import { LOCALES, LOCALE_INFO, localePath } from "@/lib/i18n";
import { INFO_PATHS } from "@/views/InfoView";

export const dynamic = "force-static";

/** Every page in every language, each listing its translations as hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/pals/", ...pals.map((p) => `/pals/${p.slug}/`), ...Object.values(INFO_PATHS)];
  const lastModified = new Date();

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_INFO[l].hreflang, `${SITE_URL}${localePath(l, path)}`]));
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path.startsWith("/pals/") ? 0.8 : 0.4,
      alternates: { languages },
    }));
  });
}
