import type { MetadataRoute } from "next";
import { fetchCaseSlugs } from "@/lib/cases";
import { absoluteUrl } from "@/lib/seo";
import { PAGE_KEYS, SERVICE_KEYS, pagePath, servicePath, type Locale } from "@/lib/services";

const LOCALES: Locale[] = ["en", "nl"];

// Case pages are published from Sanity without a redeploy; refresh the sitemap hourly.
export const revalidate = 3600;

/** Canonical, indexable pages only; each entry lists its NL/EN alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caseSlugs = await fetchCaseSlugs();
  const pages: Record<Locale, string>[] = [
    { en: "/", nl: "/" },
    ...PAGE_KEYS.map((key) => ({ en: pagePath(key, "en"), nl: pagePath(key, "nl") })),
    { en: "/portfolio", nl: "/portfolio" },
    ...SERVICE_KEYS.map((key) => ({
      en: servicePath(key, "en"),
      nl: servicePath(key, "nl"),
    })),
    // Published case pages only (CMS text in both languages).
    ...caseSlugs.map((slug) => ({ en: `/portfolio/${slug}`, nl: `/portfolio/${slug}` })),
    { en: "/about", nl: "/about" },
    { en: "/privacy-policy", nl: "/privacy-policy" },
  ];

  return pages.flatMap((paths) => {
    const languages = {
      en: absoluteUrl("en", paths.en),
      nl: absoluteUrl("nl", paths.nl),
    };
    return LOCALES.map((locale) => ({
      url: languages[locale],
      alternates: { languages },
    }));
  });
}
