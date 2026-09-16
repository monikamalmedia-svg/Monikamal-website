"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";

const heroCopyContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const heroCopyItem = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
    },
  },
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

type HeroProps = {
  kicker: string;
  headline: string;
  subheadline: string;
  videoUrl: string | null;
};

export function Hero({ kicker, headline, subheadline, videoUrl }: HeroProps) {
  const t = useTranslations("Hero");
  const showreel = useTranslations("Showreel");
  const reduceMotion = useReducedMotion();
  const mediaSrc = videoUrl?.trim() || null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const copyOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const copyY = useTransform(scrollY, [0, 300], [0, 28]);
  const [copyInteractive, setCopyInteractive] = useState(true);

  useMotionValueEvent(copyOpacity, "change", (value) => {
    setCopyInteractive(value > 0.08);
  });

  useEffect(() => {
    if (!mediaSrc) return;

    const unlockAutoplay = () => {
      void videoRef.current?.play()?.catch(() => {});
      window.removeEventListener("touchstart", unlockAutoplay);
      window.removeEventListener("click", unlockAutoplay);
    };

    window.addEventListener("touchstart", unlockAutoplay, { passive: true });
    window.addEventListener("click", unlockAutoplay);

    return () => {
      window.removeEventListener("touchstart", unlockAutoplay);
      window.removeEventListener("click", unlockAutoplay);
    };
  }, [mediaSrc]);

  return (
    <section className="relative z-20 h-screen min-h-[650px] w-full max-h-[1080px] overflow-hidden bg-[#0d0509]">
      <div className="pointer-events-none absolute inset-0 z-[2]">
        {mediaSrc ? (
          <ProtectedVideo
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={mediaSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={showreel("ariaLabel")}
          />
        ) : (
          <ProtectedImage
            src="https://picsum.photos/1920/1080"
            alt={showreel("ariaLabel")}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#0d0509] via-[#0d0509]/50 to-black/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-1/2 z-10 h-[250px] w-[600px] max-w-[90vw] -translate-x-1/2 rounded-full bg-gold/15 blur-[140px]"
      />

      <p
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-4 z-[15] select-none pr-4 text-right font-sans text-[11px] leading-none font-medium tracking-widest text-white/15 uppercase sm:bottom-5 sm:pr-6 md:bottom-6"
      >
        {t("adWatermark")}
      </p>

      <div className="relative z-20 mx-auto flex h-full max-w-5xl flex-col items-center justify-end px-6 pb-24 text-center sm:pb-28 md:pb-32">
        <motion.div
          style={reduceMotion ? undefined : { opacity: copyOpacity, y: copyY }}
          className={`flex w-full flex-col items-center ${
            reduceMotion || copyInteractive ? "" : "pointer-events-none"
          }`}
        >
          <motion.div
            variants={heroCopyContainer}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col items-center"
          >
          <motion.p
            variants={heroCopyItem}
            className="mb-4 w-full max-w-[22rem] px-2 text-center font-mono text-base leading-snug tracking-[0.22em] text-gold uppercase drop-shadow-[0_0_16px_rgba(212,175,55,0.35)] sm:max-w-none sm:text-lg sm:tracking-[0.26em] md:text-xl md:tracking-[0.28em]"
          >
            {kicker}
          </motion.p>

          <motion.h1
            variants={heroCopyItem}
            className="font-display mb-4 max-w-[11.5ch] px-2 text-center text-[clamp(2.4rem,7.2vw,5.75rem)] leading-[0.95] font-medium tracking-tight text-balance text-white drop-shadow-lg md:max-w-none"
          >
            {headline}
          </motion.h1>

          <motion.p
            variants={heroCopyItem}
            className="mb-8 max-w-2xl text-base font-light text-neutral-300 drop-shadow sm:text-lg md:text-2xl"
          >
            {subheadline}
          </motion.p>

          <motion.div
            variants={heroCopyItem}
            className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
          >
            <button
              type="button"
              onClick={() => scrollToId("pricing")}
              className="cursor-pointer rounded-full border border-gold/40 bg-[#1a0f16]/40 px-8 py-3.5 text-center text-sm font-medium tracking-wide text-gold uppercase backdrop-blur-sm transition-[border-color,box-shadow,background-color,transform] duration-300 ease-out hover:scale-[1.02] hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_22px_rgba(212,175,55,0.28)] active:scale-[0.99] sm:px-9"
            >
              {t("cta")}
            </button>
            <button
              type="button"
              onClick={() => scrollToId("portfolio")}
              className="cursor-pointer rounded-full border border-gold/25 bg-transparent px-8 py-3.5 text-center text-sm font-medium tracking-wide text-stone-200 uppercase transition-[border-color,box-shadow,background-color,color,transform] duration-300 ease-out hover:scale-[1.02] hover:border-gold/70 hover:bg-gold/5 hover:text-gold hover:shadow-[0_0_18px_rgba(212,175,55,0.18)] active:scale-[0.99] sm:px-9"
            >
              {t("ctaSecondary")}
            </button>
          </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToId("brands")}
        aria-label={t("scrollHint")}
        animate={
          reduceMotion
            ? undefined
            : { y: [0, 6, 0], opacity: [0.5, 1, 0.5] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 cursor-pointer text-center"
      >
        <span className="block text-xs tracking-[0.4em] text-foreground-muted uppercase">
          {t("scrollHint")}
        </span>
      </motion.button>
    </section>
  );
}
