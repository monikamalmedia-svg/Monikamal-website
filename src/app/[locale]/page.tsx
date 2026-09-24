import { HomeMain } from "@/components/HomeMain";
import { loadHomePageData } from "@/lib/home-page";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const data = await loadHomePageData(locale);

  return (
    <HomeMain
      kicker={data.kicker}
      headline={data.headline}
      subheadline={data.subheadline}
      videoUrl={data.videoUrl}
      portfolioItems={data.portfolioItems}
      sanityDocs={data.caseStudies}
    />
  );
}
