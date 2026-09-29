import { client } from "@/lib/sanity";
import type { Locale } from "@/lib/services";

/**
 * A case page exists only when it's switched on and has real text in both languages.
 * Keep in sync with REQUIRED_FOR_CASE_PAGE in the caseStudy schema.
 */
export const CASE_READY = `publishCasePage == true && defined(slug.current)
  && defined(summaryNl) && defined(summaryEn)
  && defined(conceptNl) && defined(conceptEn)
  && defined(approachNl) && defined(approachEn)`;

export const PLATFORM_KEYS = [
  "instagram",
  "tiktok",
  "metaAds",
  "youtube",
  "webshop",
  "organic",
] as const;

export type PlatformKey = (typeof PLATFORM_KEYS)[number];

export type CaseDoc = {
  _id: string;
  slug: string;
  title: string | null;
  caseTitleNl: string | null;
  caseTitleEn: string | null;
  eyebrowNl: string | null;
  eyebrowEn: string | null;
  seoTitleNl: string | null;
  seoTitleEn: string | null;
  seoDescriptionNl: string | null;
  seoDescriptionEn: string | null;
  visualNl: string | null;
  visualEn: string | null;
  industryNl: string | null;
  industryEn: string | null;
  platforms: string[] | null;
  summaryNl: string;
  summaryEn: string;
  conceptNl: string;
  conceptEn: string;
  objectiveNl: string | null;
  objectiveEn: string | null;
  approachNl: string;
  approachEn: string;
  deliverablesNl: string[] | null;
  deliverablesEn: string[] | null;
};

export type LocalizedCase = {
  id: string;
  slug: string;
  caseTitle: string | null;
  eyebrow: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  visual: string | null;
  industry: string | null;
  platforms: PlatformKey[];
  summary: string;
  concept: string;
  objective: string | null;
  approach: string;
  deliverables: string[];
};

const CASE_FIELDS = `
  _id,
  "slug": slug.current,
  title, caseTitleNl, caseTitleEn, eyebrowNl, eyebrowEn, seoTitleNl, seoTitleEn,
  seoDescriptionNl, seoDescriptionEn, visualNl, visualEn, industryNl, industryEn, platforms,
  summaryNl, summaryEn, conceptNl, conceptEn, objectiveNl, objectiveEn,
  approachNl, approachEn, deliverablesNl, deliverablesEn
`;

export function localizeCase(doc: CaseDoc, locale: Locale): LocalizedCase {
  const nl = locale === "nl";
  const clean = (value: string | null | undefined) => value?.trim() || null;
  return {
    id: doc._id,
    slug: doc.slug,
    caseTitle: clean(nl ? doc.caseTitleNl : doc.caseTitleEn),
    eyebrow: clean(nl ? doc.eyebrowNl : doc.eyebrowEn),
    seoTitle: clean(nl ? doc.seoTitleNl : doc.seoTitleEn),
    seoDescription: clean(nl ? doc.seoDescriptionNl : doc.seoDescriptionEn),
    visual: clean(nl ? doc.visualNl : doc.visualEn),
    industry: clean(nl ? doc.industryNl : doc.industryEn),
    platforms: (doc.platforms ?? []).filter((value): value is PlatformKey =>
      (PLATFORM_KEYS as readonly string[]).includes(value),
    ),
    summary: (nl ? doc.summaryNl : doc.summaryEn).trim(),
    concept: (nl ? doc.conceptNl : doc.conceptEn).trim(),
    objective: clean(nl ? doc.objectiveNl : doc.objectiveEn),
    approach: (nl ? doc.approachNl : doc.approachEn).trim(),
    deliverables: ((nl ? doc.deliverablesNl : doc.deliverablesEn) ?? [])
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

export async function fetchCase(slug: string): Promise<CaseDoc | null> {
  try {
    return await client.fetch<CaseDoc | null>(
      `*[_type == "caseStudy" && slug.current == $slug && ${CASE_READY}][0]{${CASE_FIELDS}}`,
      { slug },
    );
  } catch {
    return null;
  }
}

/** Slugs of all published case pages (sitemap). */
export async function fetchCaseSlugs(): Promise<string[]> {
  try {
    return await client.fetch<string[]>(
      `*[_type == "caseStudy" && ${CASE_READY}] | order(displayOrder asc).slug.current`,
      {},
      // The sitemap is static + hourly ISR; without this the fetch is cached for a year.
      { next: { revalidate: 3600 } },
    );
  } catch {
    return [];
  }
}
