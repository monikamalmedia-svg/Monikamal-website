import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { ServicePage } from "@/components/ServicePage";
import { ServicesHub } from "@/components/ServicesHub";
import { routing } from "@/i18n/routing";
import { fetchSiteSettings } from "@/lib/cms-site-settings";
import { loadPortfolioItems } from "@/lib/home-page";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import {
  allLocalizedSlugs,
  pagePath,
  routeFromSlug,
  routePath,
  servicePath,
  type LocalizedRoute,
  type Locale,
} from "@/lib/services";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Props = {
  params: Promise<{ locale: string; page: string }>;
};

// Services, the services hub and "how it works" — slugs differ per language. Everything else is a 404.
export const dynamicParams = false;

/** Every locale × every slug: a slug from the other language redirects to this language's slug. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    allLocalizedSlugs().map((page) => ({ locale, page })),
  );
}

function resolve(locale: string, slug: string): { locale: Locale; route: LocalizedRoute } | null {
  if (!hasLocale(routing.locales, locale)) return null;
  const route = routeFromSlug(slug);
  return route ? { locale, route } : null;
}

const paths = (route: LocalizedRoute) => ({ en: routePath(route, "en"), nl: routePath(route, "nl") });

/** Message namespace holding meta.title / meta.description for each route. */
const namespaceFor = (route: LocalizedRoute) =>
  route.kind === "service"
    ? `ServicePages.${route.key}`
    : route.key === "hub"
      ? "Hub"
      : "HowItWorks";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page } = await params;
  const match = resolve(locale, page);
  if (!match) return {};

  const t = await getTranslations({ locale: match.locale, namespace: namespaceFor(match.route) });
  return pageMetadata({
    locale: match.locale,
    paths: paths(match.route),
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function LocalizedPageRoute({ params }: Props) {
  const { locale: rawLocale, page } = await params;
  const match = resolve(rawLocale, page);
  if (!match) notFound();

  const { locale, route } = match;
  const expected = routePath(route, locale);
  if (`/${page}` !== expected) {
    permanentRedirect(`/${locale}${expected}`);
  }

  setRequestLocale(locale);
  const [t, common, hub, portfolioItems, settings] = await Promise.all([
    getTranslations(namespaceFor(route)),
    getTranslations("ServicePages.common"),
    getTranslations("Hub"),
    loadPortfolioItems(),
    fetchSiteSettings(),
  ]);
  const url = absoluteUrl(locale, expected);
  const home = { name: common("home"), url: absoluteUrl(locale, "/") };

  if (route.kind === "page") {
    return (
      <>
        <JsonLd data={breadcrumbJsonLd([home, { name: t("breadcrumb"), url }])} />
        {route.key === "hub" ? (
          <ServicesHub locale={locale} portfolioItems={portfolioItems} />
        ) : (
          <HowItWorks locale={locale} />
        )}
      </>
    );
  }

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            locale,
            url,
            name: t("hero.title"),
            serviceType: t("serviceType"),
            description: t("meta.description"),
          }),
          breadcrumbJsonLd([
            home,
            { name: hub("breadcrumb"), url: absoluteUrl(locale, pagePath("hub", locale)) },
            { name: t("breadcrumb"), url: absoluteUrl(locale, servicePath(route.key, locale)) },
          ]),
        ]}
      />
      <ServicePage
        service={route.key}
        locale={locale}
        portfolioItems={portfolioItems}
        socialUrl={settings.tiktokUrl}
      />
    </>
  );
}
