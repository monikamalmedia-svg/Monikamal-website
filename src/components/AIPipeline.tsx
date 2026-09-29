"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, type MotionValue } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pagePath, type Locale } from "@/lib/services";

const STEPS = ["brief", "concept", "production", "delivery"] as const;
/** A step becomes current once its card top passes this line (fraction of the viewport height). */
const ACTIVE_LINE = 0.55;

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-10 bottom-10 left-[5px] md:top-[45px] lg:top-[49px] z-0 w-[2px] lg:left-[7px]"
    >
      <div className="absolute inset-0 rounded-full bg-glass-border" />
      <motion.div
        className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-blush via-gold to-gold"
        style={{ scaleY: progress }}
      />
    </div>
  );
}

function PipelineStep({
  step,
  index,
  isActive,
  cardRef,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
  cardRef: (node: HTMLDivElement | null) => void;
}) {
  const t = useTranslations("Pipeline");

  return (
    <li className="relative pl-8 lg:pl-12">
      {/* Marker sits on the rail, level with the card title. */}
      <span
        aria-hidden
        className={`absolute top-10 left-[6px] md:top-[45px] lg:top-[49px] z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-500 lg:left-[8px] ${
          isActive ? "border-gold bg-gold" : "border-gold/60 bg-graphite"
        }`}
      />
      <div
        ref={cardRef}
        className={`relative flex flex-col overflow-hidden rounded-2xl border bg-glass/10 p-6 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 ease-out md:p-7 lg:px-9 lg:py-8 ${
          isActive
            ? "border-gold shadow-[0_0_18px_rgba(212,175,55,0.18)]"
            : "border-glass-border shadow-none hover:border-gold/40"
        }`}
      >
        <span
          aria-hidden
          className="font-display pointer-events-none absolute top-3 right-4 text-5xl leading-none font-medium tracking-tight text-gold/40 md:text-6xl lg:top-4 lg:right-6"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-display relative pr-16 text-2xl font-medium tracking-tight text-foreground">
          {t(`steps.${step}.title`)}
        </h3>
        <p className="relative mt-3 max-w-xl pr-2 text-sm leading-relaxed text-foreground-muted md:text-[15px]">
          {t(`steps.${step}.body`)}
        </p>
      </div>
    </li>
  );
}

export function AIPipeline() {
  const t = useTranslations("Pipeline");
  const locale = useLocale() as Locale;
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Rail fill follows the reading line; the current step is the last card whose top has passed it.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: [`start ${ACTIVE_LINE * 100}%`, `end ${ACTIVE_LINE * 100}%`],
  });

  useMotionValueEvent(scrollYProgress, "change", () => {
    const line = window.innerHeight * ACTIVE_LINE;
    let next = -1;
    cardRefs.current.forEach((card, index) => {
      if (card && card.getBoundingClientRect().top <= line) next = index;
    });
    setActiveIndex(next);
  });

  return (
    <section
      id="pipeline"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 py-20 md:px-10 md:py-28 lg:px-12"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:gap-12 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-16">
        {/* Sticky only on desktop, below the fixed header; it stays inside the section's grid row. */}
        <header className="relative z-20 max-w-2xl self-start rounded-xl text-left backdrop-blur-sm lg:sticky lg:top-32">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {t("kicker")}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground lg:text-[clamp(2.5rem,3.8vw,3.5rem)]">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {t("intro")}
          </p>
          <Link
            href={pagePath("howItWorks", locale)}
            className="mt-6 inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline lg:mt-8"
          >
            {t("moreLink")} <span aria-hidden>→</span>
          </Link>
        </header>

        <div ref={trackRef} className="relative">
          <ProgressRail progress={scrollYProgress} />
          <ol className="relative z-10 flex flex-col gap-4 lg:gap-5">
            {STEPS.map((step, index) => (
              <PipelineStep
                key={step}
                step={step}
                index={index}
                isActive={index === activeIndex}
                cardRef={(node) => {
                  cardRefs.current[index] = node;
                }}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
