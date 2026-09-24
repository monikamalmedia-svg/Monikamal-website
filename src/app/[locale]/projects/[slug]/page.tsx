import { AboutMain } from "@/components/AboutMain";
import { loadAboutPageData } from "@/lib/about-page";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

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
