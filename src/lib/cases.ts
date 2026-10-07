import { client } from "@/lib/sanity";
import type { Locale } from "@/lib/services";

/**
 * A case page exists only when it's switched on and has real text in both languages.
 * Keep in sync with REQUIRED_FOR_CASE_PAGE in the caseStudy schema.
 */
export const CASE_READY = `publishCasePage == true && defined(slug.current)
  && defined(summaryNl) && defined(summaryEn)
  && defined(conceptNl) && defined(conceptEn)`;

/**
 * Portfolio order everywhere (All, categories, homepage, services): newest first.
 * publishedAt is set when a work is created in Studio; older works without it use the
 * document's creation date. Never _updatedAt, so editing an old work doesn't move it up.
 * _id breaks ties so equal dates keep a stable order.
 */
export const PORTFOLIO_ORDER = `order(coalesce(publishedAt, _createdAt) desc, _id asc)`;

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
  approachNl: string | null;
  approachEn: string | null;
  resultNl: string | null;
  resultEn: string | null;
  conceptHeadingNl: string | null;
  conceptHeadingEn: string | null;
  visualHeadingNl: string | null;
  visualHeadingEn: string | null;
  resultHeadingNl: string | null;
  resultHeadingEn: string | null;
  pullQuoteNl: string | null;
  pullQuoteEn: string | null;
  applicationsNl: string | null;
  applicationsEn: string | null;
  projectDetailsNl: string[] | null;
  projectDetailsEn: string[] | null;
  disclaimerNl: string | null;
  disclaimerEn: string | null;
  stills: { url: string | null; altNl: string | null; altEn: string | null }[] | null;
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
  approach: string | null;
  result: string | null;
  /** Per-case heading overrides; null = the standard heading. */
  headings: { concept: string | null; visual: string | null; result: string | null };
  pullQuote: string | null;
  /** "Label: value" facts for the details grid; entries without a label are shown as lines. */
  details: { label: string | null; value: string }[];
  applications: string | null;
  disclaimer: string | null;
  stills: { url: string; alt: string | null }[];
  deliverables: string[];
};

const CASE_FIELDS = `
  _id,
  "slug": slug.current,
  title, caseTitleNl, caseTitleEn, eyebrowNl, eyebrowEn, seoTitleNl, seoTitleEn,
  seoDescriptionNl, seoDescriptionEn, visualNl, visualEn, industryNl, industryEn, platforms,
  summaryNl, summaryEn, conceptNl, conceptEn, objectiveNl, objectiveEn,
  approachNl, approachEn, resultNl, resultEn, deliverablesNl, deliverablesEn,
  conceptHeadingNl, conceptHeadingEn, visualHeadingNl, visualHeadingEn, resultHeadingNl, resultHeadingEn,
  projectDetailsNl, projectDetailsEn, disclaimerNl, disclaimerEn,
  pullQuoteNl, pullQuoteEn, applicationsNl, applicationsEn,
  "stills": stills[]{ "url": asset->url, altNl, altEn }
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
    approach: clean(nl ? doc.approachNl : doc.approachEn),
    result: clean(nl ? doc.resultNl : doc.resultEn),
    headings: {
      concept: clean(nl ? doc.conceptHeadingNl : doc.conceptHeadingEn),
      visual: clean(nl ? doc.visualHeadingNl : doc.visualHeadingEn),
      result: clean(nl ? doc.resultHeadingNl : doc.resultHeadingEn),
    },
    pullQuote: clean(nl ? doc.pullQuoteNl : doc.pullQuoteEn),
    details: ((nl ? doc.projectDetailsNl : doc.projectDetailsEn) ?? [])
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const match = item.match(/^([^:]{1,32}):\s+(.+)$/);
        return match ? { label: match[1].trim(), value: match[2].trim() } : { label: null, value: item };
      }),
    applications: clean(nl ? doc.applicationsNl : doc.applicationsEn),
    disclaimer: clean(nl ? doc.disclaimerNl : doc.disclaimerEn),
    stills: (doc.stills ?? []).flatMap((still) => (still.url ? [{ url: still.url, alt: clean(nl ? still.altNl : still.altEn) }] : [])),
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
      `*[_type == "caseStudy" && ${CASE_READY}] | ${PORTFOLIO_ORDER}.slug.current`,
      {},
      // The sitemap is static + hourly ISR; without this the fetch is cached for a year.
      { next: { revalidate: 3600 } },
    );
  } catch {
    return [];
  }
}
