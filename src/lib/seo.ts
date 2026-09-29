import type { Metadata } from "next";
import type { Locale } from "@/lib/services";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630 };

/** Absolute URL for a locale-less path, e.g. ("nl", "/ugc-content") → https://…/nl/ugc-content. */
export function absoluteUrl(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  return new URL(`/${locale}${clean}`, SITE_URL).toString();
}

type PageMetadataInput = {
  locale: Locale;
  /** Locale-less path per locale; slugs may differ between languages. */
  paths: Record<Locale, string>;
  title: string;
  description: string;
  /** Defaults to the English URL. The homepage passes the language-detecting root. */
  xDefault?: string;
  /** Point the canonical at another page (duplicate routes). */
  canonicalPaths?: Record<Locale, string>;
  /** Absolute image URL for social previews; defaults to the site OG image. */
  image?: string | null;
};

/**
 * Self-referencing canonical + NL/EN hreflang + x-default, with matching Open Graph and Twitter tags.
 * Page-level `openGraph` replaces the layout's, so every field is set here.
 */
export function pageMetadata({
  locale,
  paths,
  title,
  description,
  xDefault,
  canonicalPaths,
  image,
}: PageMetadataInput): Metadata {
  const ogImage = image ? { url: image } : OG_IMAGE;
  // hreflang must reference canonical URLs, so duplicates point at their original too.
  const target = canonicalPaths ?? paths;
  const en = absoluteUrl("en", target.en);
  const nl = absoluteUrl("nl", target.nl);
  const canonical = locale === "nl" ? nl : en;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { en, nl, "x-default": xDefault ?? en },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "nl" ? "nl_NL" : "en_US",
      alternateLocale: locale === "nl" ? ["en_US"] : ["nl_NL"],
      url: canonical,
      title,
      description,
      images: [{ ...ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
