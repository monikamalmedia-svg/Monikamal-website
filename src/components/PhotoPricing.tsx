import { getLocale, getTranslations } from "next-intl/server";
import { PhotoPricingView } from "@/components/PhotoPricingView";
import {
  cmsHeading,
  mapPhotoPackages,
  PHOTO_PRICING_SECTION_QUERY,
  type DisplayPackage,
  type PhotoPricingSectionDoc,
} from "@/lib/cms-pricing";
import { client } from "@/lib/sanity";

const FEATURE_KEYS = ["count", "formats", "revisions", "delivery"] as const;

async function fetchPhotoPricingSection(): Promise<PhotoPricingSectionDoc | null> {
  try {
    return await client.fetch<PhotoPricingSectionDoc | null>(
      PHOTO_PRICING_SECTION_QUERY,
    );
  } catch {
    return null;
  }
}

export async function PhotoPricing() {
  const locale = await getLocale();
  const isNl = locale === "nl";
  const t = await getTranslations("Photography");
  const doc = await fetchPhotoPricingSection();

  const fallbackPackages: DisplayPackage[] = [
    {
      key: "photographyFive",
      name: t("packages.five.name"),
      price: t("packages.five.price"),
      pricePerUnit: t("packages.five.perPhoto"),
      features: FEATURE_KEYS.map((feature) =>
        t(`packages.five.features.${feature}`),
      ),
      featured: false,
    },
    {
      key: "photographyTen",
      name: t("packages.ten.name"),
      price: t("packages.ten.price"),
      pricePerUnit: t("packages.ten.perPhoto"),
      features: FEATURE_KEYS.map((feature) =>
        t(`packages.ten.features.${feature}`),
      ),
      featured: true,
    },
  ];

  const cmsPackages = mapPhotoPackages(isNl, doc?.photoPackages);
  const heading = cmsHeading(isNl, doc?.headingEn, doc?.headingNl) || t("title");

  return (
    <PhotoPricingView
      heading={heading}
      kicker={t("kicker")}
      intro={t("intro")}
      badge={t("badge")}
      cta={t("cta")}
      packages={cmsPackages.length > 0 ? cmsPackages : fallbackPackages}
    />
  );
}
