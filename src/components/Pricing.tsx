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
  starter: ["video", "mode", "finish", "revisions", "export"] as const,
  growth: ["videos", "directions", "mode", "finish", "revisions", "export"] as const,
  partnership: [
    "videos",
    "mode",
    "planning",
    "priority",
    "hooks",
    "delivery",
    "revisions",
  ] as const,
};

const TAGGED_PACKAGES = ["starter", "growth", "partnership"] as const;

type TaggedPackage = (typeof TAGGED_PACKAGES)[number];

type Translator = Awaited<ReturnType<typeof getTranslations>>;

function optional(t: Translator, key: string): string | null {
  return t.has(key) ? t(key) : null;
}

/** Copy, intro pricing and CTA for the three known packages come from messages. */
function localizedCopy(key: TaggedPackage, t: Translator) {
  const base = `packages.${key}`;
  return {
    tagline: t(`${base}.tagline`),
    features: FEATURE_KEYS[key].map((feature) =>
      t(`${base}.features.${feature}`),
    ),
    oldPrice: optional(t, `${base}.oldPrice`),
    discount: optional(t, `${base}.discount`),
    period: optional(t, `${base}.period`),
    valueNote: optional(t, `${base}.valueNote`),
    cta: t(`${base}.cta`),
  };
}

function withLocalizedPackageCopy(
  packages: DisplayPackage[],
  t: Translator,
): DisplayPackage[] {
  return packages.map((pack) => {
    const tagged = TAGGED_PACKAGES.includes(pack.key as TaggedPackage);
    if (!tagged) return pack;
    return { ...pack, ...localizedCopy(pack.key as TaggedPackage, t) };
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

  const fallbackPackages: DisplayPackage[] = TAGGED_PACKAGES.map((key) => ({
    key,
    name: t(`packages.${key}.name`),
    price: t(`packages.${key}.price`),
    pricePerUnit: optional(t, `packages.${key}.perUnit`),
    features: [],
    featured: key === "growth",
  }));

  const cmsPackages = mapVideoPackages(isNl, doc?.videoPackages);
  const packages = withLocalizedPackageCopy(
    cmsPackages.length > 0 ? cmsPackages : fallbackPackages,
    t,
  );

  return (
    <PricingView
      heading={t("title")}
      intro={t("intro")}
      kicker={t("kicker")}
      badge={t("badge")}
      introLabel={t("introLabel")}
      regularPriceLabel={t("regularPrice")}
      defaultCta={t("packages.starter.cta")}
      packages={packages}
    />
  );
}
