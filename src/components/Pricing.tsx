import { getLocale, getTranslations } from "next-intl/server";
import { PricingView } from "@/components/PricingView";
import {
  mapVideoPackages,
  PRICING_SECTION_QUERY,
  type DisplayPackage,
  type PricingSectionDoc,
} from "@/lib/cms-pricing";
import { client } from "@/lib/sanity";

const FEATURE_KEYS = {
  starter: ["video", "hook", "asmr", "revisions", "delivery"] as const,
  growth: ["videos", "asmr", "post", "revisions", "delivery"] as const,
  partnership: ["videos", "cycle", "priority", "slot", "revisions"] as const,
};

const TAGGED_PACKAGES = ["starter", "growth", "partnership"] as const;

function withLocalizedPackageCopy(
  packages: DisplayPackage[],
  t: Awaited<ReturnType<typeof getTranslations>>,
): DisplayPackage[] {
  return packages.map((pack) => {
    const tagged = TAGGED_PACKAGES.includes(
      pack.key as (typeof TAGGED_PACKAGES)[number],
    );
    if (!tagged) return pack;

    const keys = FEATURE_KEYS[pack.key as (typeof TAGGED_PACKAGES)[number]];
    return {
      ...pack,
      tagline: t(`packages.${pack.key}.tagline`),
      features: keys.map((feature) =>
        t(`packages.${pack.key}.features.${feature}`),
      ),
    };
  });
}

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
      tagline: t("packages.starter.tagline"),
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
      tagline: t("packages.growth.tagline"),
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
      tagline: t("packages.partnership.tagline"),
      features: FEATURE_KEYS.partnership.map((feature) =>
        t(`packages.partnership.features.${feature}`),
      ),
      featured: false,
    },
  ];

  const cmsPackages = mapVideoPackages(isNl, doc?.videoPackages);
  const heading = t("title");
  const packages = withLocalizedPackageCopy(
    cmsPackages.length > 0 ? cmsPackages : fallbackPackages,
    t,
  );

  return (
    <PricingView
      heading={heading}
      kicker={t("kicker")}
      badge={t("badge")}
      cta={t("packages.starter.cta")}
      packages={packages}
    />
  );
}
