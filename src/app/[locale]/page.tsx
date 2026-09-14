import { getTranslations, setRequestLocale } from "next-intl/server";
import { AIPipeline } from "@/components/AIPipeline";
import { CommercialPortfolio } from "@/components/CommercialPortfolio";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { HomeHashScroll } from "@/components/HomeHashScroll";
import { Faq } from "@/components/Faq";
import { TrustBar } from "@/components/TrustBar";
import { PhotoPricing } from "@/components/PhotoPricing";
import { Pricing } from "@/components/Pricing";
import { toMediaType } from "@/lib/portfolio";
import {
  isPlayableVideoUrl,
  resolveSanityFileUrl,
  resolveSanityImageUrl,
} from "@/lib/sanity-media";
import { client } from "@/lib/sanity";

type Props = {
  params: Promise<{ locale: string }>;
};

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
  title: string | null;
  category: string | null;
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

const CASE_STUDIES_QUERY = `*[_type == "caseStudy"] | order(displayOrder asc) {
  _id,
  title,
  category,
  year,
  featured,
  mediaType,
  caseVideo,
  videoFile,
  thumbnail,
  "videoUrl": caseVideo.asset->url,
  "videoFileUrl": videoFile.asset->url,
  "videoAssetRef": coalesce(caseVideo.asset._ref, videoFile.asset._ref),
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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Hero");
  const isNl = locale === "nl";
  const [hero, caseStudies] = await Promise.all([
    fetchHeroSection(),
    fetchCaseStudies(),
  ]);

  const portfolioItems = caseStudies.map((caseItem) => {
    const videoUrl =
      resolveSanityFileUrl(caseItem.videoUrl) ??
      resolveSanityFileUrl(caseItem.videoFileUrl) ??
      resolveSanityFileUrl(caseItem.caseVideo) ??
      resolveSanityFileUrl(caseItem.videoFile) ??
      resolveSanityFileUrl(caseItem.videoAssetRef);
    const imageUrl =
      resolveSanityImageUrl(caseItem.imageUrl) ??
      resolveSanityImageUrl(caseItem.thumbnail);

    return {
      id: caseItem._id,
      title: caseItem.title?.trim() || "Untitled",
      category: caseItem.category?.trim() || "",
      year: caseItem.year != null ? String(caseItem.year) : "",
      mediaType: toMediaType(caseItem.mediaType),
      imageUrl,
      videoUrl: isPlayableVideoUrl(videoUrl) ? videoUrl : null,
    };
  });

  const kicker =
    (isNl ? hero?.kickerNl : hero?.kickerEn)?.trim() || t("kicker");
  const headline = (
    (isNl ? hero?.headlineNl : hero?.headlineEn)?.trim() || t("title")
  ).replace(/\.$/, "");
  const subheadline =
    (isNl ? hero?.subheadlineNl : hero?.subheadlineEn)?.trim() || t("subtitle");
  const videoUrl = hero?.videoUrl?.trim() || null;

  return (
    <main className="relative z-20 flex-1">
      <HomeHashScroll />
      <Hero
        kicker={kicker}
        headline={headline}
        subheadline={subheadline}
        videoUrl={videoUrl}
      />
      <TrustBar />
      <CommercialPortfolio items={portfolioItems} sanityDocs={caseStudies} />
      <AIPipeline />
      <Pricing />
      <PhotoPricing />
      <Faq />
      <Contact />
    </main>
  );
}
