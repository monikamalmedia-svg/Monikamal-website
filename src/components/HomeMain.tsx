import { useTranslations } from "next-intl";
import { AIPipeline } from "@/components/AIPipeline";
import { CommercialPortfolio } from "@/components/CommercialPortfolio";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { HomeHashScroll } from "@/components/HomeHashScroll";
import { Faq } from "@/components/Faq";
import { MeetMonika } from "@/components/MeetMonika";
import { TrustBar } from "@/components/TrustBar";
import { PhotoPricing } from "@/components/PhotoPricing";
import { Positioning } from "@/components/Positioning";
import { Pricing } from "@/components/Pricing";
import { Services } from "@/components/Services";
import {
  type ContentType,
  type PortfolioType,
  type ProjectType,
} from "@/lib/portfolio";

export type HomePortfolioItem = {
  id: string;
  title: string;
  contentType: ContentType;
  projectType: ProjectType | null;
  format: string;
  /** Set only when a published case page exists. */
  caseSlug: string | null;
  /** Position in the mixed "Alles" view; null = after the numbered items. */
  featuredOrder: number | null;
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
}: {
  kicker: string;
  headline: string;
  subheadline: string;
  videoUrl: string | null;
  portfolioItems: HomePortfolioItem[];
}) {
  const t = useTranslations("Portfolio");

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
      <Positioning />
      <Services />
      <CommercialPortfolio
        items={portfolioItems}
        // Homepage shows a selection; the full archive lives on /portfolio.
        preview={{ limit: 6, label: t("selectedWork"), ctaLabel: t("viewAllWork") }}
      />
      <AIPipeline />
      <MeetMonika />
      <Pricing />
      <PhotoPricing />
      <Faq />
      {/* Demo CTA anchor; wraps the existing #contact section. */}
      <div id="gratis-demo" className="scroll-mt-24">
        <ContactSection />
      </div>
    </main>
  );
}
