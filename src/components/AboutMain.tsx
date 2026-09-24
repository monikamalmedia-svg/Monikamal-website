import { AboutMeVideoPlayer } from "@/components/AboutMeVideoPlayer";
import { AboutWorkGrid, type AboutWorkItem } from "@/components/AboutWorkGrid";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function AboutMain({
  heading,
  videoUrl,
  works,
  placeholderLabel,
  ctaTitle,
  ctaBody,
  cta,
  initialWorkSlug,
}: {
  heading: string;
  videoUrl: string | null;
  works: AboutWorkItem[];
  placeholderLabel: string;
  ctaTitle: string;
  ctaBody: string;
  cta: string;
  initialWorkSlug?: string;
}) {
  const t = await getTranslations("About");

  return (
    <main className="relative z-20 flex-1 pt-20 md:pt-24">
      <section className="relative z-20 px-6 pt-8 pb-16 md:px-10 md:pt-10 md:pb-24 lg:px-12">
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
                  {placeholderLabel}
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
          <header className="relative z-20 mb-10 md:mb-12">
            <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
              {t("worksTitle")}
            </h2>
          </header>
          <AboutWorkGrid
            items={works}
            placeholderLabel={placeholderLabel}
            initialWorkSlug={initialWorkSlug}
          />
        </div>
      </section>

      <section className="relative z-20 px-6 pb-28 md:px-10 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-2xl border border-glass-border bg-glass/10 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              {ctaTitle}
            </h2>
            <p className="mt-3 max-w-md text-foreground-muted">{ctaBody}</p>
          </div>
          <Link
            href="/#contact"
            className="rounded-full border-[1.5px] border-gold bg-glass px-6 py-3 text-xs font-medium tracking-wide text-gold uppercase transition-all duration-300 hover:bg-gold/10 hover:shadow-gold-glow"
          >
            {cta}
          </Link>
        </div>
      </section>
    </main>
  );
}
