import type { Locale } from "@/lib/services";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * schema.org JSON-LD. Only facts that are on the site: no ratings, reviews,
 * client counts or office addresses.
 */

const PERSON_ID = new URL("/#person", SITE_URL).toString();
const WEBSITE_ID = new URL("/#website", SITE_URL).toString();

export function personJsonLd(sameAs: string[], aboutUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_NAME,
    url: aboutUrl,
    jobTitle: "UGC & AI Content Creator",
    knowsAbout: ["UGC", "AI commercials", "Product content", "Video production"],
    // Profile URLs without share/tracking query strings.
    sameAs: sameAs.filter(Boolean).map((url) => url.split("?")[0]),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["en", "nl"],
    publisher: { "@id": PERSON_ID },
  };
}

export function serviceJsonLd(input: {
  locale: Locale;
  url: string;
  name: string;
  serviceType: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    url: input.url,
    inLanguage: input.locale,
    provider: { "@id": PERSON_ID },
    audience: { "@type": "BusinessAudience", audienceType: "E-commerce brands" },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
