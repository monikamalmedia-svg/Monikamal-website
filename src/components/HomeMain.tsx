import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { HomeHashScroll } from "@/components/HomeHashScroll";
import { MeetMonika } from "@/components/MeetMonika";
import { PortfolioWall } from "@/components/PortfolioWall";
import { ProcessSteps } from "@/components/ProcessSteps";
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
  /** Deep-link slug (/projects/[slug]): the Sanity slug, or a unique slug from the title. */
  projectSlug: string;
  /** "Featured on homepage" in Studio; false keeps a work off the homepage wall only. */
  featured: boolean;
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
  return (
    <main data-page="home" className="relative z-20 flex-1">
      <HomeHashScroll />
      <Hero
        kicker={kicker}
        headline={headline}
        subheadline={subheadline}
        videoUrl={videoUrl}
      />
      {/* Hero → phrase + living portfolio wall → compact services → process → about → contact. */}
      <PortfolioWall items={portfolioItems.filter((item) => item.featured)} />
      <Services />
      <ProcessSteps variant="home" />
      <MeetMonika />
      {/* Intro-call anchor; wraps the #contact section. */}
      <div id="kennismaking" className="scroll-mt-24">
        <ContactSection toneFrom="#1a1117" />
      </div>
    </main>
  );
}
