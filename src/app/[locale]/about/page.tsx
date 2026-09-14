import { getTranslations, setRequestLocale } from "next-intl/server";
import type { SanityImageSource } from "@sanity/image-url";
import { AboutMeVideoPlayer } from "@/components/AboutMeVideoPlayer";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { Link } from "@/i18n/navigation";
import { client, urlFor } from "@/lib/sanity";

type Props = {
  params: Promise<{ locale: string }>;
};

type AboutWorkSample = {
  videoUrl?: string | null;
  image?: SanityImageSource | null;
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
    titleEn,
    titleNl,
    "videoUrl": video.asset->url
  }
}`;

function imageUrl(source: SanityImageSource | null | undefined) {
  if (!source || typeof source !== "object") return null;
  if (!("asset" in source) || !source.asset) return null;
  return urlFor(source).width(1400).url();
}

async function fetchAboutPage(): Promise<AboutPageDoc | null> {
  try {
    return await client.fetch<AboutPageDoc | null>(ABOUT_PAGE_QUERY);
  } catch {
    return null;
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const isNl = locale === "nl";
  const about = await fetchAboutPage();

  const heading =
    (isNl ? about?.headingNl : about?.headingEn)?.trim() || t("title");
  const videoUrl = about?.videoUrl?.trim() || null;

  const cmsSamples = (about?.workSamples ?? []).filter(
    (sample) =>
      sample &&
      (sample.videoUrl || sample.image || sample.titleEn || sample.titleNl),
  );

  const fallbackWorks = [
    {
      key: "one" as const,
      title: t("works.one"),
      videoUrl: null as string | null,
      imageUrl: null as string | null,
    },
    {
      key: "two" as const,
      title: t("works.two"),
      videoUrl: null as string | null,
      imageUrl: null as string | null,
    },
    {
      key: "three" as const,
      title: t("works.three"),
      videoUrl: null as string | null,
      imageUrl: null as string | null,
    },
  ];

  const works =
    cmsSamples.length > 0
      ? cmsSamples.map((sample, index) => ({
          key: `cms-${index}`,
          title:
            (isNl ? sample.titleNl : sample.titleEn)?.trim() ||
            sample.titleEn?.trim() ||
            sample.titleNl?.trim() ||
            t("worksTitle"),
          videoUrl: sample.videoUrl?.trim() || null,
          imageUrl: imageUrl(sample.image),
        }))
      : fallbackWorks;

  return (
    <main className="relative z-20 flex-1 pt-24 md:pt-28">
      <section className="relative z-20 px-6 py-16 md:px-10 md:py-24 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_1.1fr] lg:items-start lg:gap-16">
          <div className="relative aspect-[3/4] select-none">
            {videoUrl ? (
              <AboutMeVideoPlayer src={videoUrl} label={heading} />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0d0509] shadow-[0_20px_50px_rgba(0,_0,_0,_0.8)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 bottom-10 h-40 rounded-full bg-amber-500/15 blur-[80px]"
                />
                <p className="relative z-10 font-mono text-xs tracking-[0.22em] text-white/50 uppercase">
                  {t("videoPlaceholder")}
                </p>
              </div>
            )}
          </div>

          <div className="relative z-20 rounded-xl backdrop-blur-sm">
            <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] font-medium tracking-tight text-foreground">
              {heading}
            </h1>
            <div className="mt-6 max-w-xl">
              <p className="mb-6 text-xl leading-snug font-normal text-white md:text-2xl">
                {t.rich("lead", {
                  specialist: (chunks) => (
                    <span className="font-medium text-amber-400">{chunks}</span>
                  ),
                })}
              </p>
              <div className="space-y-4 text-base leading-relaxed text-zinc-300/90 transition-colors hover:text-white">
                <p>
                  {t.rich("body1", {
                    customers: (chunks) => (
                      <span className="font-medium text-amber-400">{chunks}</span>
                    ),
                  })}
                </p>
                <p>
                  {t.rich("body2", {
                    fiveYears: (chunks) => (
                      <span className="font-medium text-white">{chunks}</span>
                    ),
                    ugc: (chunks) => (
                      <span className="font-medium text-white">{chunks}</span>
                    ),
                  })}
                </p>
                <p>
                  {t.rich("body3", {
                    twoYears: (chunks) => (
                      <span className="font-medium text-amber-400/90">
                        {chunks}
                      </span>
                    ),
                    aiCreation: (chunks) => (
                      <span className="font-medium text-amber-400/90">
                        {chunks}
                      </span>
                    ),
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 px-6 pb-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display relative z-20 mb-10 rounded-xl text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight text-foreground backdrop-blur-sm">
            {t("worksTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {works.map((item) => {
              const hasMedia = Boolean(item.videoUrl || item.imageUrl);

              return (
                <article
                  key={item.key}
                  className="relative flex aspect-video items-end overflow-hidden rounded-2xl border border-glass-border bg-glass/10"
                >
                  {item.videoUrl ? (
                    <ProtectedVideo
                      src={item.videoUrl}
                      className="absolute inset-0 h-full w-full rounded-xl object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={item.title}
                    />
                  ) : item.imageUrl ? (
                    <ProtectedImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0d0509]">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-6 bottom-8 h-24 rounded-full bg-amber-500/15 blur-[60px]"
                      />
                      <p className="relative z-10 font-mono text-[10px] tracking-[0.22em] text-white/50 uppercase">
                        {t("videoPlaceholder")}
                      </p>
                    </div>
                  )}
                  <div
                    className={`relative z-10 w-full p-5 ${hasMedia ? "bg-gradient-to-t from-graphite/90 to-transparent" : ""}`}
                  >
                    <p className="text-sm text-foreground-muted">{item.title}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-20 px-6 pb-28 md:px-10 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-2xl border border-glass-border bg-glass/10 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 max-w-md text-foreground-muted">{t("ctaBody")}</p>
          </div>
          <Link
            href="/#contact"
            className="rounded-full border-[1.5px] border-gold bg-glass px-6 py-3 text-xs font-medium tracking-wide text-gold uppercase transition-all duration-300 hover:bg-gold/10 hover:shadow-gold-glow"
          >
            {t("cta")}
          </Link>
        </div>
      </section>
    </main>
  );
}
