import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutMain } from "@/components/AboutMain";
import { loadAboutPageData } from "@/lib/about-page";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/services";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ work?: string | string[] }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.about" });
  return pageMetadata({
    locale: locale as Locale,
    paths: { en: "/about", nl: "/about" },
    title: t("title"),
    description: t("description"),
  });
}

export default async function AboutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const data = await loadAboutPageData(locale);

  const workParam = query.work;
  const initialWorkSlug = Array.isArray(workParam) ? workParam[0] : workParam;

  return (
    <AboutMain
      heading={data.heading}
      videoUrl={data.videoUrl}
      works={data.works}
      placeholderLabel={data.placeholderLabel}
      ctaTitle={data.ctaTitle}
      ctaBody={data.ctaBody}
      cta={data.cta}
      initialWorkSlug={initialWorkSlug}
    />
  );
}
