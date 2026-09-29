import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeMain } from "@/components/HomeMain";
import { JsonLd } from "@/components/JsonLd";
import { fetchSiteSettings } from "@/lib/cms-site-settings";
import { loadHomePageData } from "@/lib/home-page";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/services";
import { SITE_URL } from "@/lib/site";
import { personJsonLd, websiteJsonLd } from "@/lib/structured-data";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return pageMetadata({
    locale: locale as Locale,
    paths: { en: "/", nl: "/" },
    title: t("title"),
    description: t("description"),
    // The bare domain picks a language per visitor, which is what x-default is for.
    xDefault: new URL("/", SITE_URL).toString(),
  });
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const [data, settings] = await Promise.all([
    loadHomePageData(locale),
    fetchSiteSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd(),
          personJsonLd(
            [settings.instagramUrl, settings.tiktokUrl, settings.linkedinUrl],
            absoluteUrl(locale as Locale, "/about"),
          ),
        ]}
      />
      <HomeMain
        kicker={data.kicker}
        headline={data.headline}
        subheadline={data.subheadline}
        videoUrl={data.videoUrl}
        portfolioItems={data.portfolioItems}
      />
    </>
  );
}
