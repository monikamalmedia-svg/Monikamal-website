"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";

/**
 * Entrance of the hero copy runs in CSS (.hero-reveal in globals.css), so the text shows at first
 * paint instead of waiting for hydration. Same timing as before: 0.2s start, 0.3s stagger.
 */
const revealDelay = (index: number) => ({ animationDelay: `${0.2 + index * 0.3}s` });

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
  // Attach the video source only after window load, so the large file doesn't compete with JS/fonts.
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaSrc) return;
    const attach = () => setVideoSrc(mediaSrc);
    if (document.readyState === "complete") {
      // Timeout, not rAF: rAF never fires in a background tab, which would leave the hero empty.
      const timer = window.setTimeout(attach, 0);
      return () => window.clearTimeout(timer);
    }
    window.addEventListener("load", attach, { once: true });
    return () => window.removeEventListener("load", attach);
  }, [mediaSrc]);

  useMotionValueEvent(copyOpacity, "change", (value) => {
    setCopyInteractive(value > 0.08);
  });

  useEffect(() => {
    if (!mediaSrc) return;
    // Reduced motion: keep the first frame instead of a looping background video.
    if (reduceMotion) {
      videoRef.current?.pause();
      return;
    }

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
  }, [mediaSrc, reduceMotion]);

  return (
    <section
      data-nav-caption="hero"
      data-hero-section
      // Grows with its content; the extra --hero-dissolve below the fold is where the video fades out.
      className="hero relative z-20 flex min-h-[calc(100svh+var(--hero-dissolve))] w-full flex-col justify-end overflow-hidden bg-background pt-28 pb-[calc(var(--hero-dissolve)+3.5rem+env(safe-area-inset-bottom))] md:pb-[calc(var(--hero-dissolve)+clamp(4rem,9svh,5.5rem))]"
    >
      {/* Not the full hero height: the bottom 30% of the dissolve zone is plain background. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[var(--hero-video-cut)] z-[2]">
        {mediaSrc ? (
          <ProtectedVideo
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc ?? undefined}
            autoPlay={!reduceMotion}
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

      {/* Light overall tint, a local shade behind the bottom copy, then the dissolve into the page. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      <div aria-hidden className="hero-shade pointer-events-none absolute inset-0 z-10" />
      <div aria-hidden className="hero-dissolve pointer-events-none absolute inset-x-0 bottom-0 z-10" />

      <motion.div
        style={reduceMotion ? undefined : { opacity: copyOpacity, y: copyY }}
        className={`relative z-20 grid w-full gap-8 px-5 sm:px-6 md:px-[3.5vw] lg:grid-cols-[minmax(0,60%)_minmax(0,clamp(360px,34vw,500px))] lg:items-end lg:justify-between lg:gap-x-0 lg:gap-y-6 ${
          reduceMotion || copyInteractive ? "" : "pointer-events-none"
        }`}
      >
        {/* Left: eyebrow + headline */}
        <div>
          <p
            style={revealDelay(0)}
            className="hero-reveal mb-4 text-sm tracking-[0.12em] text-gold uppercase drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)] md:text-base"
          >
            {kicker}
          </p>
          <h1
            style={revealDelay(1)}
            className="hero-reveal font-display text-[clamp(2.5rem,4.9vw,5.25rem)] leading-[1.02] font-light tracking-tight text-pretty text-ivory-strong drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
          >
            {headline}
          </h1>
        </div>

        {/* Right: description, buttons, note */}
        <div style={revealDelay(2)} className="hero-reveal">
          <p className="max-w-[30rem] text-lg leading-relaxed text-ivory drop-shadow-[0_1px_12px_rgba(0,0,0,0.55)]">
            {keepEcommerce(subheadline)}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-contact-open
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-gold/70 bg-[#1a0f16]/55 px-6 text-center text-base text-gold backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/15 focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none"
            >
              {t("cta")}
            </button>
            <button
              type="button"
              onClick={() => scrollToId("portfolio")}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/20 px-6 text-center text-base text-ivory-strong backdrop-blur-sm transition-[border-color,color,background-color] duration-300 hover:border-gold/70 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none"
            >
              {t("ctaSecondary")}
            </button>
          </div>
          <p className="mt-4 text-sm text-ivory/90 italic drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">{t("ctaNote")}</p>
        </div>

        {/* Label for the background video: under the CTA note on mobile, bottom right on desktop. */}
        <p className="text-xs text-ivory/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] lg:col-span-2 lg:text-right">
          {t("adWatermark")}
        </p>
      </motion.div>
    </section>
  );
}
