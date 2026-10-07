import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CasePage, caseHeading } from "@/components/CasePage";
import { JsonLd } from "@/components/JsonLd";
import { routing } from "@/i18n/routing";
import { fetchCase, localizeCase } from "@/lib/cases";
import { loadPortfolioItems } from "@/lib/home-page";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/services";
import { breadcrumbJsonLd } from "@/lib/structured-data";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const DESCRIPTION_MAX = 160;

function toDescription(text: string) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= DESCRIPTION_MAX) return flat;
  return `${flat.slice(0, flat.lastIndexOf(" ", DESCRIPTION_MAX - 1))}…`;
}

/** The case after this one in portfolio order (wrapping round), for the "Next project" link. */
function nextOf<T extends { id: string }>(cases: T[], id: string): T | null {
  if (cases.length < 2) return null;
  const index = cases.findIndex((entry) => entry.id === id);
  return cases[(index + 1) % cases.length];
}

/** Published case (CMS text in both languages) + its portfolio media, or null → 404. */
async function loadCase(locale: string, slug: string) {
  if (!hasLocale(routing.locales, locale)) return null;
  const [doc, items] = await Promise.all([fetchCase(slug), loadPortfolioItems()]);
  const item = doc ? items.find((entry) => entry.id === doc._id) : undefined;
  if (!doc || !item) return null;
  return {
    locale: locale as Locale,
    item,
    data: localizeCase(doc, locale as Locale),
    otherCases: items.filter((entry) => entry.caseSlug && entry.id !== item.id),
    nextCase: nextOf(items.filter((entry) => entry.caseSlug), item.id),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const found = await loadCase(locale, slug);
  if (!found) return {};

  setRequestLocale(found.locale);
  const heading = await caseHeading(found.item, found.data);
  return pageMetadata({
    locale: found.locale,
    paths: { en: `/portfolio/${slug}`, nl: `/portfolio/${slug}` },
    title: found.data.seoTitle ?? `${heading} | Monika Mal`,
    description: toDescription(found.data.seoDescription ?? found.data.summary),
    image: found.item.imageUrl,
  });
}

export default async function CaseRoute({ params }: Props) {
  const { locale, slug } = await params;
  const found = await loadCase(locale, slug);
  if (!found) notFound();

  setRequestLocale(found.locale);
  const common = await getTranslations("ServicePages.common");
  const heading = await caseHeading(found.item, found.data);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: absoluteUrl(found.locale, "/") },
          { name: heading, url: absoluteUrl(found.locale, `/portfolio/${slug}`) },
        ])}
      />
      <CasePage
        item={found.item}
        data={found.data}
        locale={found.locale}
        otherCases={found.otherCases}
        nextCase={found.nextCase}
      />
    </>
  );
}
