"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "next-intl";

const STEPS = ["brief", "concept", "production", "delivery"] as const;
const DESKTOP_MQ = "(min-width: 1024px)";
const STEP_SCROLL_OFFSET: [string, string] = ["start 48%", "end 28%"];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 bottom-0 left-[5px] z-0 w-[2px] lg:left-[7px]"
    >
      <div className="absolute inset-0 rounded-full bg-glass-border" />
      <motion.div
        className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-blush via-gold to-gold"
        style={{ scaleY }}
      />
      {STEPS.map((_, index) => (
        <span
          key={index}
          className="absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/60 bg-graphite"
          style={{
            top: `${STEPS.length <= 1 ? 0 : (index / (STEPS.length - 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

function PipelineStep({
  step,
  index,
  isLast,
  isDesktop,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isLast: boolean;
  isDesktop: boolean;
}) {
  const t = useTranslations("Pipeline");
  const stepRef = useRef<HTMLLIElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scrollActive, setScrollActive] = useState(index === 0);

  const { scrollYProgress } = useScroll({
    target: stepRef,
    // @ts-ignore
    offset: STEP_SCROLL_OFFSET,
  });

  const opacity = useTransform(
    scrollYProgress,
    isLast ? [0, 1] : [0, 0.82, 1],
    isLast ? [1, 1] : [1, 1, 0],
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setScrollActive(value >= 0 && value < (isLast ? 1 : 0.82));
  });

  const inView = useInView(cardRef, {
    amount: 0.2,
    margin: "0px 0px -12% 0px",
  });
  const isActive = isDesktop ? scrollActive : inView;

  return (
    <li
      ref={stepRef}
      className={`relative ${isLast ? "lg:min-h-[34vh]" : "lg:min-h-[24vh]"}`}
    >
      <motion.div
        ref={cardRef}
        className={`relative z-20 ml-8 flex flex-col overflow-hidden rounded-2xl border bg-glass/10 p-6 backdrop-blur-sm transition-[border-color,box-shadow,opacity] duration-500 ease-out md:p-7 lg:sticky lg:top-[20vh] lg:ml-12 lg:max-w-xl ${
          isActive
            ? "border-gold shadow-[0_0_18px_rgba(212,175,55,0.18)]"
            : "border-glass-border shadow-none"
        }`}
        style={
          isDesktop
            ? {
                opacity,
                transformOrigin: "center top",
                zIndex: 20 + index,
              }
            : { zIndex: 20 + index }
        }
      >
        <span
          aria-hidden
          className="font-display pointer-events-none absolute top-3 right-4 text-5xl leading-none font-medium tracking-tight text-gold/40 md:text-6xl"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-display relative pr-16 text-2xl font-medium tracking-tight text-foreground">
          {t(`steps.${step}.title`)}
        </h3>
        <p className="relative mt-3 text-sm leading-relaxed text-foreground-muted">
          {t(`steps.${step}.body`)}
        </p>
      </motion.div>
    </li>
  );
}

export function AIPipeline() {
  const t = useTranslations("Pipeline");
  const trackRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="pipeline"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 py-24 md:px-10 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative z-20 mb-10 max-w-2xl rounded-xl text-left backdrop-blur-sm md:mb-12">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {t("kicker")}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {t("intro")}
          </p>
        </header>

        <div ref={trackRef} className="relative">
          <ProgressRail progress={scrollYProgress} />

          <ol className="relative z-10 flex flex-col gap-3 lg:gap-1">
            {STEPS.map((step, index) => (
              <PipelineStep
                key={step}
                step={step}
                index={index}
                isLast={index === STEPS.length - 1}
                isDesktop={isDesktop}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
