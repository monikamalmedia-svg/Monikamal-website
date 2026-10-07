import { getLocale, getTranslations } from "next-intl/server";
import { PricingView } from "@/components/PricingView";
import {
  mapVideoPackages,
  PRICING_SECTION_QUERY,
  type DisplayPackage,
  type PricingSectionDoc,
} from "@/lib/cms-pricing";
import { client } from "@/lib/sanity";

/** Video packages (AI commercials). */
const VIDEO_FEATURES = {
  starter: ["video", "mode", "finish", "revisions", "export"] as const,
  growth: ["videos", "directions", "mode", "finish", "revisions", "export"] as const,
  partnership: ["videos", "mode", "planning", "priority", "hooks", "delivery", "revisions"] as const,
};

const VIDEO_PACKAGES = ["starter", "growth", "partnership"] as const;

type VideoPackage = (typeof VIDEO_PACKAGES)[number];

/** UGC packages; keys double as the package option in the intro-call form. */
const UGC_PACKAGES = [
  { key: "ugcOne", messageKey: "one", features: ["finish", "revisions", "export"] },
  { key: "ugcThree", messageKey: "three", features: ["finish", "revisions", "export"] },
  { key: "ugcCustom", messageKey: "custom", features: [] },
] as const;

/** Product photography packages (photo count and price only). */
const PHOTO_PACKAGES = [
  { key: "photoFive", messageKey: "five" },
  { key: "photoTen", messageKey: "ten" },
  { key: "photoCustom", messageKey: "custom" },
] as const;

type Translator = Awaited<ReturnType<typeof getTranslations>>;

function optional(t: Translator, key: string): string | null {
  return t.has(key) ? t(key) : null;
}

/** Copy, price period and CTA for the known video packages come from messages. */
function withVideoCopy(packages: DisplayPackage[], t: Translator): DisplayPackage[] {
  return packages.map((pack) => {
    if (!VIDEO_PACKAGES.includes(pack.key as VideoPackage)) return pack;
    const base = `packages.${pack.key}`;
    return {
      ...pack,
      tagline: t(`${base}.tagline`),
      features: VIDEO_FEATURES[pack.key as VideoPackage].map((feature) => t(`${base}.features.${feature}`)),
      period: optional(t, `${base}.period`),
      cta: t(`${base}.cta`),
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

/**
 * Packages on a service page: "ugc" shows the UGC packages (one video / three videos / custom),
 * "photo" the product photography packages (5 / 10 photos / custom), "video" the content packages
 * used for AI commercials. Prices never appear on the homepage.
 */
export async function Pricing({
  variant,
  heading,
  intro,
}: {
  variant: "ugc" | "photo" | "video";
  heading?: string;
  intro?: string;
}) {
  if (variant === "ugc") {
    const t = await getTranslations("UgcPricing");
    const packages: DisplayPackage[] = UGC_PACKAGES.map(({ key, messageKey, features }) => ({
      key,
      name: t(`packages.${messageKey}.name`),
      price: t(`packages.${messageKey}.price`),
      pricePerUnit: null,
      tagline: t(`packages.${messageKey}.tagline`),
      features: features.map((feature) => t(`packages.${messageKey}.features.${feature}`)),
      cta: t("cta"),
    }));
    return (
      <PricingView
        heading={heading ?? t("title")}
        intro={intro}
        kicker={t("kicker")}
        defaultCta={t("cta")}
        packages={packages}
        note={t("note")}
      />
    );
  }

  if (variant === "photo") {
    const t = await getTranslations("PhotoPricing");
    const packages: DisplayPackage[] = PHOTO_PACKAGES.map(({ key, messageKey }) => ({
      key,
      name: t(`packages.${messageKey}.name`),
      price: t(`packages.${messageKey}.price`),
      pricePerUnit: null,
      features: [],
      cta: t("cta"),
    }));
    return (
      <PricingView
        heading={heading ?? t("title")}
        intro={intro}
        kicker={t("kicker")}
        defaultCta={t("cta")}
        packages={packages}
        note={t("note")}
      />
    );
  }

  const locale = await getLocale();
  const t = await getTranslations("Pricing");
  const doc = await fetchPricingSection();
  const fallback: DisplayPackage[] = VIDEO_PACKAGES.map((key) => ({
    key,
    name: t(`packages.${key}.name`),
    price: t(`packages.${key}.price`),
    pricePerUnit: optional(t, `packages.${key}.perUnit`),
    features: [],
  }));
  const cmsPackages = mapVideoPackages(locale === "nl", doc?.videoPackages);

  return (
    <PricingView
      heading={heading ?? t("title")}
      intro={intro ?? t("intro")}
      kicker={t("kicker")}
      defaultCta={t("packages.starter.cta")}
      packages={withVideoCopy(cmsPackages.length > 0 ? cmsPackages : fallback, t)}
    />
  );
}
