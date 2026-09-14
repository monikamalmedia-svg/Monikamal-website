import { getLocale, getTranslations } from "next-intl/server";
import { PricingView } from "@/components/PricingView";
import {
  cmsHeading,
  mapVideoPackages,
  PRICING_SECTION_QUERY,
  type DisplayPackage,
  type PricingSectionDoc,
} from "@/lib/cms-pricing";
import { client } from "@/lib/sanity";

const FEATURE_KEYS = {
  starter: ["video", "avatar", "revisions", "delivery"] as const,
  growth: ["videos", "craft", "revisions", "delivery"] as const,
  partnership: ["videos", "priority", "slot", "revisions"] as const,
};

async function fetchPricingSection(): Promise<PricingSectionDoc | null> {
  try {
    return await client.fetch<PricingSectionDoc | null>(PRICING_SECTION_QUERY);
  } catch {
    return null;
  }
}

export async function Pricing() {
  const locale = await getLocale();
  const isNl = locale === "nl";
  const t = await getTranslations("Pricing");
  const doc = await fetchPricingSection();

  const fallbackPackages: DisplayPackage[] = [
    {
      key: "starter",
      name: t("packages.starter.name"),
      price: t("packages.starter.price"),
      pricePerUnit: null,
      features: FEATURE_KEYS.starter.map((feature) =>
        t(`packages.starter.features.${feature}`),
      ),
      featured: false,
    },
    {
      key: "growth",
      name: t("packages.growth.name"),
      price: t("packages.growth.price"),
      pricePerUnit: null,
      features: FEATURE_KEYS.growth.map((feature) =>
        t(`packages.growth.features.${feature}`),
      ),
      featured: true,
    },
    {
      key: "partnership",
      name: t("packages.partnership.name"),
      price: t("packages.partnership.price"),
      pricePerUnit: t("packages.partnership.perUnit"),
      features: FEATURE_KEYS.partnership.map((feature) =>
        t(`packages.partnership.features.${feature}`),
      ),
      featured: false,
    },
  ];

  const cmsPackages = mapVideoPackages(isNl, doc?.videoPackages);
  const heading = cmsHeading(isNl, doc?.headingEn, doc?.headingNl) || t("title");

  return (
    <PricingView
      heading={heading}
      kicker={t("kicker")}
      badge={t("badge")}
      cta={t("packages.starter.cta")}
      packages={cmsPackages.length > 0 ? cmsPackages : fallbackPackages}
    />
  );
}
