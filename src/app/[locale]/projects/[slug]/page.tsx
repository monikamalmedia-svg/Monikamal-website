import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutMain } from "@/components/AboutMain";
import { PortfolioPageView } from "@/components/PortfolioPageView";
import { loadAboutPageData } from "@/lib/about-page";
import { loadPortfolioItems } from "@/lib/home-page";
import { isPlayableVideoUrl } from "@/lib/sanity-media";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/services";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * Deep link that opens one video. About works open on the About page (as before); otherwise a
 * UGC / AI Commercials video from the portfolio opens on the Portfolio page.
 */
async function resolveProject(locale: string, slug: string) {
  const about = await loadAboutPageData(locale);
  if (about.works.some((work) => work.slug === slug)) return { kind: "about" as const, about };

  const items = await loadPortfolioItems();
  const video = items.find(
    (item) =>
      item.projectSlug === slug &&
      item.mediaType === "video" &&
      isPlayableVideoUrl(item.videoUrl) &&
      (item.contentType === "ugc" || item.contentType === "aiCommercial"),
  );
  return video ? { kind: "portfolio" as const, items } : { kind: "about" as const, about };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await resolveProject(locale, slug);

  if (project.kind === "portfolio") {
    const t = await getTranslations({ locale, namespace: "PortfolioPage" });
    return pageMetadata({
      locale: locale as Locale,
      paths: { en: `/projects/${slug}`, nl: `/projects/${slug}` },
      title: t("meta.title"),
      description: t("meta.description"),
      canonicalPaths: { en: "/portfolio", nl: "/portfolio" },
    });
  }

  // About work: the About page is the canonical.
  const t = await getTranslations({ locale, namespace: "Metadata.about" });
  return pageMetadata({
    locale: locale as Locale,
    paths: { en: `/projects/${slug}`, nl: `/projects/${slug}` },
    title: t("title"),
    description: t("description"),
    canonicalPaths: { en: "/about", nl: "/about" },
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = await resolveProject(locale, slug);

  if (project.kind === "portfolio") {
    return <PortfolioPageView locale={locale as Locale} items={project.items} initialProjectSlug={slug} />;
  }

  const data = project.about;
  return (
    <AboutMain
      heading={data.heading}
      videoUrl={data.videoUrl}
      works={data.works}
      placeholderLabel={data.placeholderLabel}
      ctaTitle={data.ctaTitle}
      ctaBody={data.ctaBody}
      cta={data.cta}
      initialWorkSlug={slug}
    />
  );
}
