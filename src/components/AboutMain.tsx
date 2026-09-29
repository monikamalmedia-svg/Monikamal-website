import type { ReactNode } from "react";
import { AboutMeVideoPlayer } from "@/components/AboutMeVideoPlayer";
import { AboutWorkGrid, type AboutWorkItem } from "@/components/AboutWorkGrid";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const ABOUT_CARDS = ["ugc", "ai", "product"] as const;

/** Accent for a few selected phrases (<hl> in the About copy). */
const highlight = (chunks: ReactNode) => <span className="text-gold">{chunks}</span>;

/** Keeps a hyphenated word such as "e-commerce" on one line (<nw> in the copy). */
const noWrap = (chunks: ReactNode) => <span className="whitespace-nowrap">{chunks}</span>;

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
            <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
              {t("kicker")}
            </p>
            <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] font-medium tracking-tight text-foreground">
              {heading}
            </h1>
            <div className="mt-7 max-w-xl">
              <p className="text-xl leading-snug font-normal text-white md:text-[1.6rem] md:leading-[1.35]">
                {t.rich("lead", { hl: highlight })}
              </p>
              <div className="mt-7 space-y-4 text-base leading-relaxed text-foreground-muted md:text-[1.05rem]">
                <p>{t.rich("body1", { hl: highlight, nw: noWrap })}</p>
                <p>{t.rich("body2", { hl: highlight })}</p>
              </div>
              <p className="font-display mt-8 border-l border-gold/50 pl-5 text-xl leading-snug text-foreground md:text-2xl">
                {t("closing")}
              </p>
            </div>

            {/* Three services at a glance */}
            <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {ABOUT_CARDS.map((card) => (
                <li
                  key={card}
                  className="rounded-xl border border-glass-border bg-graphite/60 p-4 backdrop-blur-sm md:p-5"
                >
                  <p className="text-[11px] tracking-[0.2em] text-gold uppercase">
                    {t(`cards.${card}.title`)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    {t(`cards.${card}.body`)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <p className="text-sm text-foreground-muted md:text-base">{t("ctaQuestion")}</p>
              <Link
                href="/#gratis-demo"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-gold/50 px-6 py-3 text-xs font-medium tracking-widest text-gold uppercase transition-colors hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
              >
                {t("ctaButton")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="mijn-werken"
        className="relative z-20 scroll-mt-24 px-6 pb-20 md:px-10 lg:px-12"
      >
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
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline"
            >
              {t("allWork")} <span aria-hidden>→</span>
            </Link>
            <Link
              href="/#gratis-demo"
              className="rounded-full border-[1.5px] border-gold bg-glass px-6 py-3 text-xs font-medium tracking-wide text-gold uppercase transition-all duration-300 hover:bg-gold/10 hover:shadow-gold-glow"
            >
              {cta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
