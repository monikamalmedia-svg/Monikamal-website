export type CmsVideoPackage = {
  nameEn?: string | null;
  nameNl?: string | null;
  price?: string | null;
  pricePerUnit?: string | null;
  featuresEn?: string[] | null;
  featuresNl?: string[] | null;
  isPopular?: boolean | null;
  order?: number | null;
};

export type CmsPhotoPackage = {
  nameEn?: string | null;
  nameNl?: string | null;
  price?: string | null;
  pricePerUnit?: string | null;
  featuresEn?: string[] | null;
  featuresNl?: string[] | null;
  isBetterValue?: boolean | null;
  order?: number | null;
};

export type PricingSectionDoc = {
  headingEn?: string | null;
  headingNl?: string | null;
  videoPackages?: CmsVideoPackage[] | null;
};

export type PhotoPricingSectionDoc = {
  headingEn?: string | null;
  headingNl?: string | null;
  photoPackages?: CmsPhotoPackage[] | null;
};

export type DisplayPackage = {
  key: string;
  name: string;
  price: string;
  pricePerUnit: string | null;
  tagline?: string | null;
  features: string[];
  featured: boolean;
};

export const PRICING_SECTION_QUERY = `*[_type == "pricingSection"][0]{
  headingEn,
  headingNl,
  videoPackages[]{
    nameEn,
    nameNl,
    price,
    pricePerUnit,
    featuresEn,
    featuresNl,
    isPopular,
    order
  }
}`;

export const PHOTO_PRICING_SECTION_QUERY = `*[_type == "photoPricingSection"][0]{
  headingEn,
  headingNl,
  photoPackages[]{
    nameEn,
    nameNl,
    price,
    pricePerUnit,
    featuresEn,
    featuresNl,
    isBetterValue,
    order
  }
}`;

function localeString(
  isNl: boolean,
  en?: string | null,
  nl?: string | null,
): string {
  return ((isNl ? nl : en) || en || nl || "").trim();
}

function localeList(
  isNl: boolean,
  en?: string[] | null,
  nl?: string[] | null,
): string[] {
  const picked = isNl ? nl : en;
  const fallback = isNl ? en : nl;
  const source = (picked?.length ? picked : fallback) ?? [];
  return source.map((item) => item.trim()).filter(Boolean);
}

function byOrder<T extends { order?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function videoContactKey(
  nameEn: string,
  nameNl: string,
  index: number,
): string {
  const hay = `${nameEn} ${nameNl}`.toLowerCase();
  if (hay.includes("starter")) return "starter";
  if (hay.includes("growth")) return "growth";
  if (hay.includes("partner") || hay.includes("samenwerking")) {
    return "partnership";
  }
  return (["starter", "growth", "partnership"] as const)[index] ?? "starter";
}

export function photoContactKey(
  nameEn: string,
  nameNl: string,
  index: number,
): string {
  const hay = `${nameEn} ${nameNl}`.toLowerCase();
  if (/\b10\b/.test(hay) || hay.includes("ten")) return "photographyTen";
  if (/\b5\b/.test(hay) || hay.includes("five")) return "photographyFive";
  return index === 1 ? "photographyTen" : "photographyFive";
}

export function mapVideoPackages(
  isNl: boolean,
  packages: CmsVideoPackage[] | null | undefined,
): DisplayPackage[] {
  return byOrder(packages ?? [])
    .map((pack, index) => {
      const nameEn = pack.nameEn?.trim() ?? "";
      const nameNl = pack.nameNl?.trim() ?? "";
      const name = localeString(isNl, pack.nameEn, pack.nameNl);
      const price = pack.price?.trim() ?? "";
      if (!name && !price) return null;
      return {
        key: videoContactKey(nameEn, nameNl, index),
        name: name || price,
        price,
        pricePerUnit: pack.pricePerUnit?.trim() || null,
        features: localeList(isNl, pack.featuresEn, pack.featuresNl),
        featured: Boolean(pack.isPopular),
      };
    })
    .filter((pack): pack is DisplayPackage => pack != null);
}

export function mapPhotoPackages(
  isNl: boolean,
  packages: CmsPhotoPackage[] | null | undefined,
): DisplayPackage[] {
  return byOrder(packages ?? [])
    .map((pack, index) => {
      const nameEn = pack.nameEn?.trim() ?? "";
      const nameNl = pack.nameNl?.trim() ?? "";
      const name = localeString(isNl, pack.nameEn, pack.nameNl);
      const price = pack.price?.trim() ?? "";
      if (!name && !price) return null;
      return {
        key: photoContactKey(nameEn, nameNl, index),
        name: name || price,
        price,
        pricePerUnit: pack.pricePerUnit?.trim() || null,
        features: localeList(isNl, pack.featuresEn, pack.featuresNl),
        featured: Boolean(pack.isBetterValue),
      };
    })
    .filter((pack): pack is DisplayPackage => pack != null);
}

export function cmsHeading(
  isNl: boolean,
  headingEn?: string | null,
  headingNl?: string | null,
): string {
  return localeString(isNl, headingEn, headingNl);
}
