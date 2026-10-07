"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { SitePicture } from "@/components/SitePicture";
import { Link } from "@/i18n/navigation";
import { PROCESS_STEPS } from "@/lib/process";
import { pagePath, type Locale } from "@/lib/services";

/** A step becomes current once its top passes this line (fraction of the viewport height). */
const ACTIVE_LINE = 0.5;

/**
 * The process (three steps, no numbers) with one sticky 4:5 visual that crossfades to the current
 * step and drifts ~16px. "home": compact, with heading and a link to the Werkwijze page.
 * "page": the same steps with one extra sentence each (Werkwijze page). Mobile: text → image per
 * step, no sticky. Reduced motion: static (first visual, no drift or fades).
 */
export function ProcessSteps({ variant }: { variant: "home" | "page" }) {
  const t = useTranslations("Process");
  const home = useTranslations("Pipeline");
  const locale = useLocale() as Locale;
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [8, -8]);
  const isHome = variant === "home";

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = window.innerHeight * ACTIVE_LINE;
        let current = 0;
        stepRefs.current.forEach((node, index) => {
          if (node && node.getBoundingClientRect().top <= line) current = index;
        });
        setActive(current);
      });
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [reduceMotion]);

  const current = reduceMotion ? 0 : active;

  return (
    <section
      ref={sectionRef}
      data-nav-caption={isHome ? "process" : undefined}
      id={isHome ? "pipeline" : undefined}
      aria-label={isHome ? undefined : t("stepsLabel")}
      // Homepage: near-black scene after the burgundy-black services.
      style={isHome ? ({ "--tone-from": "#160f14" } as CSSProperties) : undefined}
      className={
        isHome
          ? "tone tone-process z-20 scroll-mt-24 px-6 pt-[calc(var(--blend)+1rem)] pb-16 md:px-10 md:pt-[calc(var(--blend)+1.25rem)] md:pb-20 lg:px-12"
          : "process-glow relative z-20 px-6 pb-16 md:px-10 md:pb-20 lg:px-12"
      }
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20">
        <div>
          {isHome ? (
            <Reveal>
              <p className="mb-3 text-sm tracking-[0.04em] text-gold">{home("kicker")}</p>
              <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] font-light text-balance text-ivory-strong">
                {home("title")}
              </h2>
            </Reveal>
          ) : null}

          <ol className={isHome ? "mt-8 lg:mt-12" : ""}>
            {PROCESS_STEPS.map((step, index) => {
              const isActive = index === current;
              return (
                <li
                  key={step.key}
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  aria-current={isActive && !reduceMotion ? "step" : undefined}
                  className="border-t border-white/12 py-6 last:border-b lg:flex lg:min-h-[34vh] lg:flex-col lg:justify-center lg:py-10"
                >
                  <Reveal>
                    {/* Thin warm accent on the current step; text stays fully readable. */}
                    <div
                      className={`border-l-2 pl-5 transition-colors duration-500 motion-reduce:transition-none ${
                        isActive ? "border-gold" : "border-transparent"
                      }`}
                    >
                      <h3
                        className={`font-display text-2xl font-normal transition-colors duration-500 md:text-[1.75rem] ${
                          isActive ? "text-ivory-strong" : "text-ivory/80"
                        }`}
                      >
                        {t(`steps.${step.key}.title`)}
                      </h3>
                      <p className="mt-2 max-w-md text-base text-ivory/90 md:text-lg">{t(`steps.${step.key}.body`)}</p>
                      {isHome ? null : (
                        <p className="mt-2 max-w-md text-base text-foreground-muted">{t(`steps.${step.key}.detail`)}</p>
                      )}
                    </div>
                  </Reveal>
                  {/* Mobile / tablet: the image right under its step. */}
                  <div className="mt-5 overflow-hidden rounded-xl border border-white/10 lg:hidden">
                    <SitePicture
                      name={step.image}
                      alt={t(`steps.${step.key}.imageAlt`)}
                      sizes="(min-width: 768px) 60vw, 92vw"
                      className="aspect-[4/5] h-auto w-full object-contain"
                    />
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            {isHome ? (
              <Link
                href={pagePath("howItWorks", locale)}
                className="inline-flex items-center gap-2 py-2 text-base text-gold underline-offset-[6px] transition-colors duration-300 hover:text-ivory-strong hover:underline focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none"
              >
                {home("moreLink")} <span aria-hidden>→</span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* Desktop: one sticky visual, crossfading between the three frames. */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e0d]">
              <motion.div
                className="absolute -inset-y-3 inset-x-0 motion-reduce:![transform:none]"
                style={reduceMotion ? undefined : { y: drift }}
              >
                {PROCESS_STEPS.map((step, index) => (
                  <div
                    key={step.key}
                    aria-hidden={index !== current}
                    className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                      index === current ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <SitePicture
                      name={step.image}
                      alt={t(`steps.${step.key}.imageAlt`)}
                      sizes="(min-width: 1152px) 520px, 42vw"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
