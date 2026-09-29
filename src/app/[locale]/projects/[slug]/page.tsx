import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutMain } from "@/components/AboutMain";
import { loadAboutPageData } from "@/lib/about-page";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/services";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Deep link that opens one work on the About page; the About page is the canonical.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
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
  const data = await loadAboutPageData(locale);

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
