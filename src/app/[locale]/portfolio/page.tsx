import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PortfolioPageView } from "@/components/PortfolioPageView";
import { routing } from "@/i18n/routing";
import { loadPortfolioItems } from "@/lib/home-page";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/services";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "PortfolioPage" });
  return pageMetadata({
    locale,
    paths: { en: "/portfolio", nl: "/portfolio" },
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

/** Full portfolio archive with filters; the homepage only shows a selection. */
export default async function PortfolioIndexPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const items = await loadPortfolioItems();
  return <PortfolioPageView locale={locale} items={items} />;
}
