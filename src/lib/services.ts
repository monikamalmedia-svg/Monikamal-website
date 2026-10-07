import type { ContentType } from "@/lib/portfolio";

export type Locale = "en" | "nl";

export const SERVICE_KEYS = ["ugc", "ai", "product"] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

type ServiceConfig = {
  /** URL slug per locale — natural wording per language, not a literal translation. */
  slugs: Record<Locale, string>;
  /** Portfolio items shown as examples on the page. */
  contentType: ContentType;
  /** Pre-selected answer in the intro-call form (Contact step 1). */
  formContentType: "ugc" | "ai" | "product";
};

export const SERVICES: Record<ServiceKey, ServiceConfig> = {
  ugc: {
    slugs: { nl: "ugc-content", en: "ugc-content" },
    contentType: "ugc",
    formContentType: "ugc",
  },
  ai: {
    slugs: { nl: "ai-commercial-laten-maken", en: "ai-commercials" },
    contentType: "aiCommercial",
    formContentType: "ai",
  },
  product: {
    slugs: { nl: "product-content", en: "product-content" },
    contentType: "productContent",
    formContentType: "product",
  },
};

/** Locale-less path, e.g. "/ai-commercials" — pass to the i18n `Link` together with the locale. */
export function servicePath(key: ServiceKey, locale: Locale): string {
  return `/${SERVICES[key].slugs[locale]}`;
}

/** The service page that matches a portfolio item's content type. */
export function serviceForContentType(contentType: ContentType): ServiceKey {
  return SERVICE_KEYS.find((key) => SERVICES[key].contentType === contentType) ?? "product";
}

/** Finds the service for a slug in any locale, so a wrong-locale slug can be redirected. */
export function serviceFromSlug(slug: string): ServiceKey | null {
  return (
    SERVICE_KEYS.find((key) =>
      Object.values(SERVICES[key].slugs).includes(slug),
    ) ?? null
  );
}

/** Other top-level pages whose slug differs per language (served by the same [page] route). */
export const PAGE_KEYS = ["hub", "howItWorks"] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGES: Record<PageKey, { slugs: Record<Locale, string> }> = {
  hub: { slugs: { nl: "diensten", en: "services" } },
  howItWorks: { slugs: { nl: "werkwijze", en: "how-i-work" } },
};

export function pagePath(key: PageKey, locale: Locale): string {
  return `/${PAGES[key].slugs[locale]}`;
}

export type LocalizedRoute =
  | { kind: "service"; key: ServiceKey }
  | { kind: "page"; key: PageKey };

/** Resolves a top-level slug (in any language) to a service page or one of the other localized pages. */
export function routeFromSlug(slug: string): LocalizedRoute | null {
  const service = serviceFromSlug(slug);
  if (service) return { kind: "service", key: service };
  const page = PAGE_KEYS.find((key) => Object.values(PAGES[key].slugs).includes(slug));
  return page ? { kind: "page", key: page } : null;
}

export function routePath(route: LocalizedRoute, locale: Locale): string {
  return route.kind === "service" ? servicePath(route.key, locale) : pagePath(route.key, locale);
}

/** Every slug served by the [page] route, in all languages. */
export function allLocalizedSlugs(): string[] {
  return [
    ...new Set([
      ...SERVICE_KEYS.flatMap((key) => Object.values(SERVICES[key].slugs)),
      ...PAGE_KEYS.flatMap((key) => Object.values(PAGES[key].slugs)),
    ]),
  ];
}

/** Locale-less pathname for the same page in another language (language switcher). */
export function translatePath(pathname: string, locale: Locale): string {
  const [first, ...rest] = pathname.replace(/^\//, "").split("/");
  const route = rest.length === 0 ? routeFromSlug(first) : null;
  return route ? routePath(route, locale) : pathname;
}
