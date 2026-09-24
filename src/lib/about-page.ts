import { getTranslations, setRequestLocale } from "next-intl/server";
import { type AboutWorkItem } from "@/components/AboutWorkGrid";
import { uniqueProjectSlugs } from "@/lib/portfolio";
import { client } from "@/lib/sanity";
import {
  isPlayableVideoUrl,
  resolveSanityFileUrl,
  resolveSanityImageUrl,
} from "@/lib/sanity-media";

type AboutWorkSample = {
  video?: unknown;
  image?: unknown;
  videoUrl?: string | null;
  videoAssetRef?: string | null;
  titleEn?: string | null;
  titleNl?: string | null;
};

type AboutPageDoc = {
  videoUrl?: string | null;
  headingEn?: string | null;
  headingNl?: string | null;
  bioEn?: string | null;
  bioNl?: string | null;
  workSamples?: AboutWorkSample[] | null;
};

const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"][0]{
  headingEn,
  headingNl,
  bioEn,
  bioNl,
  "videoUrl": video.asset->url,
  workSamples[]{
    image,
    video,
    titleEn,
    titleNl,
    "videoUrl": video.asset->url,
    "videoAssetRef": coalesce(video.asset._ref, video.asset->_id)
  }
}`;

async function fetchAboutPage(): Promise<AboutPageDoc | null> {
  try {
    return await client
      .withConfig({ useCdn: false })
      .fetch<AboutPageDoc | null>(ABOUT_PAGE_QUERY, {}, { cache: "no-store" });
  } catch {
    return null;
  }
}

export async function loadAboutPageData(locale: string): Promise<{
  heading: string;
  videoUrl: string | null;
  works: AboutWorkItem[];
  placeholderLabel: string;
  ctaTitle: string;
  ctaBody: string;
  cta: string;
}> {
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const isNl = locale === "nl";
  const about = await fetchAboutPage();

  const heading =
    (isNl ? about?.headingNl : about?.headingEn)?.trim() || t("title");
  const videoUrl = about?.videoUrl?.trim() || null;

  const cmsSamples = (about?.workSamples ?? []).filter((sample) => {
    if (!sample) return false;
    const sampleVideoUrl =
      resolveSanityFileUrl(sample.videoUrl) ??
      resolveSanityFileUrl(sample.video) ??
      resolveSanityFileUrl(sample.videoAssetRef);
    return Boolean(
      sampleVideoUrl || sample.image || sample.titleEn || sample.titleNl,
    );
  });

  const fallbackWorks: AboutWorkItem[] = [
    {
      key: "one",
      slug: "one",
      title: t("works.one"),
      videoUrl: null,
      imageUrl: null,
    },
    {
      key: "two",
      slug: "two",
      title: t("works.two"),
      videoUrl: null,
      imageUrl: null,
    },
    {
      key: "three",
      slug: "three",
      title: t("works.three"),
      videoUrl: null,
      imageUrl: null,
    },
  ];

  const works: AboutWorkItem[] =
    cmsSamples.length > 0
      ? (() => {
          const titles = cmsSamples.map(
            (sample) =>
              (isNl ? sample.titleNl : sample.titleEn)?.trim() ||
              sample.titleEn?.trim() ||
              sample.titleNl?.trim() ||
              t("worksTitle"),
          );
          const slugs = uniqueProjectSlugs(titles);
          return cmsSamples.map((sample, index) => {
            const url =
              resolveSanityFileUrl(sample.videoUrl) ??
              resolveSanityFileUrl(sample.video) ??
              resolveSanityFileUrl(sample.videoAssetRef);
            return {
              key: `cms-${index}`,
              slug: slugs[index] ?? `work-${index + 1}`,
              title: titles[index] ?? t("worksTitle"),
              videoUrl: isPlayableVideoUrl(url) ? url : null,
              imageUrl: resolveSanityImageUrl(sample.image),
            };
          });
        })()
      : fallbackWorks;

  return {
    heading,
    videoUrl,
    works,
    placeholderLabel: t("videoPlaceholder"),
    ctaTitle: t("ctaTitle"),
    ctaBody: t("ctaBody"),
    cta: t("cta"),
  };
}
