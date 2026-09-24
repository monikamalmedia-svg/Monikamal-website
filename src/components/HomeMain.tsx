import { AIPipeline } from "@/components/AIPipeline";
import { CommercialPortfolio } from "@/components/CommercialPortfolio";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { HomeHashScroll } from "@/components/HomeHashScroll";
import { Faq } from "@/components/Faq";
import { TrustBar } from "@/components/TrustBar";
import { PhotoPricing } from "@/components/PhotoPricing";
import { Pricing } from "@/components/Pricing";
import { type PortfolioType } from "@/lib/portfolio";

export type HomePortfolioItem = {
  id: string;
  title: string;
  category: string;
  year: string;
  mediaType: PortfolioType;
  imageUrl: string | null;
  videoUrl?: string | null;
};

export function HomeMain({
  kicker,
  headline,
  subheadline,
  videoUrl,
  portfolioItems,
  sanityDocs,
}: {
  kicker: string;
  headline: string;
  subheadline: string;
  videoUrl: string | null;
  portfolioItems: HomePortfolioItem[];
  sanityDocs?: unknown;
}) {
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
      <CommercialPortfolio items={portfolioItems} sanityDocs={sanityDocs} />
      <AIPipeline />
      <Pricing />
      <PhotoPricing />
      <Faq />
      <Contact />
    </main>
  );
}
