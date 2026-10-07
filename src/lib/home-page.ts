import { getTranslations, setRequestLocale } from "next-intl/server";
import { type HomePortfolioItem } from "@/components/HomeMain";
import { CASE_READY, PORTFOLIO_ORDER } from "@/lib/cases";
import { toContentType, toMediaType, toProjectType, uniqueProjectSlugs } from "@/lib/portfolio";
import {
  isPlayableVideoUrl,
  resolveSanityFileUrl,
  resolveSanityImageUrl,
} from "@/lib/sanity-media";
import { client } from "@/lib/sanity";

type HeroSectionDoc = {
  kickerEn?: string | null;
  kickerNl?: string | null;
  headlineEn?: string | null;
  headlineNl?: string | null;
  subheadlineEn?: string | null;
  subheadlineNl?: string | null;
  videoUrl?: string | null;
};

type CaseStudyDoc = {
  _id: string;
  _createdAt: string;
  title: string | null;
  category: string | null;
  contentType: string | null;
  projectType: string | null;
  format: string | null;
  caseSlug: string | null;
  slug: string | null;
  year: number | string | null;
  featured: boolean | null;
  mediaType: string | null;
  videoUrl: string | null;
  videoFileUrl: string | null;
  videoAssetRef: string | null;
  imageUrl: string | null;
  caseVideo?: unknown;
  videoFile?: unknown;
  thumbnail?: unknown;
};

const HERO_SECTION_QUERY = `*[_type == "heroSection"][0]{kickerEn, kickerNl, headlineEn, headlineNl, subheadlineEn, subheadlineNl, "videoUrl": showreelVideo.asset->url}`;

// Sorted in the query, before any filter or homepage limit is applied.
const CASE_STUDIES_QUERY = `*[_type == "caseStudy" && !(_id in path("drafts.**"))] | ${PORTFOLIO_ORDER} {
  _id,
  _createdAt,
  title,
  category,
  contentType,
  projectType,
  format,
  "caseSlug": select(${CASE_READY} => slug.current, null),
  "slug": slug.current,
  year,
  featured,
  mediaType,
  caseVideo,
  videoFile,
  thumbnail,
  "videoUrl": coalesce(caseVideo.asset->url, videoFile.asset->url),
  "videoFileUrl": videoFile.asset->url,
  "videoAssetRef": coalesce(caseVideo.asset._ref, videoFile.asset._ref, caseVideo.asset->_id, videoFile.asset->_id),
  "imageUrl": thumbnail.asset->url
}`;

async function fetchHeroSection(): Promise<HeroSectionDoc | null> {
  try {
    return await client.fetch<HeroSectionDoc | null>(HERO_SECTION_QUERY);
  } catch {
    return null;
  }
}

async function fetchCaseStudies(): Promise<CaseStudyDoc[]> {
  try {
    return (await client.fetch<CaseStudyDoc[] | null>(CASE_STUDIES_QUERY)) ?? [];
  } catch {
    return [];
  }
}

function toPortfolioItem(caseItem: CaseStudyDoc, projectSlug: string): HomePortfolioItem {
  const videoUrl =
    resolveSanityFileUrl(caseItem.videoUrl) ??
    resolveSanityFileUrl(caseItem.videoFileUrl) ??
    resolveSanityFileUrl(caseItem.caseVideo) ??
    resolveSanityFileUrl(caseItem.videoFile) ??
    resolveSanityFileUrl(caseItem.videoAssetRef);
  const imageUrl =
    resolveSanityImageUrl(caseItem.imageUrl) ??
    resolveSanityImageUrl(caseItem.thumbnail);

  const mediaType = toMediaType(caseItem.mediaType);

  return {
    id: caseItem._id,
    title: caseItem.title?.trim() || "Untitled",
    contentType: toContentType(caseItem.contentType, mediaType),
    projectType: toProjectType(caseItem.projectType, caseItem.category),
    format: caseItem.format?.trim() || "",
    caseSlug: caseItem.caseSlug ?? null,
    projectSlug,
    featured: caseItem.featured !== false,
    year: caseItem.year != null ? String(caseItem.year) : "",
    mediaType,
    imageUrl,
    videoUrl: isPlayableVideoUrl(videoUrl) ? videoUrl : null,
  };
}

function toPortfolioItems(docs: CaseStudyDoc[]): HomePortfolioItem[] {
  // Title-based fallback slugs are numbered oldest first, so a newer work with the same title
  // never takes over an existing /projects/[slug] link.
  const oldestFirst = [...docs].sort(
    (a, b) => a._createdAt.localeCompare(b._createdAt) || a._id.localeCompare(b._id),
  );
  const fallbackSlugs = uniqueProjectSlugs(oldestFirst.map((doc) => doc.title?.trim() || "project"));
  const fallbackById = new Map(oldestFirst.map((doc, index) => [doc._id, fallbackSlugs[index]]));
  return docs.map((doc) => toPortfolioItem(doc, doc.slug?.trim() || fallbackById.get(doc._id)!));
}

/** Portfolio items for service pages (same mapping as the homepage grid). */
export async function loadPortfolioItems(): Promise<HomePortfolioItem[]> {
  return toPortfolioItems(await fetchCaseStudies());
}

export async function loadHomePageData(locale: string): Promise<{
  kicker: string;
  headline: string;
  subheadline: string;
  videoUrl: string | null;
  portfolioItems: HomePortfolioItem[];
  caseStudies: CaseStudyDoc[];
}> {
  setRequestLocale(locale);
  const t = await getTranslations("Hero");
  const [hero, caseStudies] = await Promise.all([
    fetchHeroSection(),
    fetchCaseStudies(),
  ]);

  const portfolioItems = toPortfolioItems(caseStudies);

  return {
    kicker: t("kicker"),
    headline: t("title"),
    subheadline: t("subtitle"),
    videoUrl: hero?.videoUrl?.trim() || null,
    portfolioItems,
    caseStudies,
  };
}
