"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  posterUrl?: string | null;
};

export function Hero({
  kicker,
  headline,
  subheadline,
  videoUrl,
  posterUrl,
}: HeroProps) {
  const t = useTranslations("Hero");
  const showreel = useTranslations("Showreel");
  const reduceMotion = useReducedMotion();
  const mediaSrc = videoUrl?.trim() || null;
  const cmsPoster = posterUrl?.trim() || undefined;
  const posterSrc = cmsPoster ?? "/og-image.jpg";
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaSrc) return;

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    if (posterSrc) video.setAttribute("poster", posterSrc);

    const tryPlay = () => {
      void videoRef.current?.play().catch(() => {});
    };

    const capturePoster = () => {
      const node = videoRef.current;
      if (!node || node.videoWidth === 0 || cmsPoster) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = node.videoWidth;
        canvas.height = node.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(node, 0, 0);
        node.setAttribute("poster", canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        /* CORS-tainted canvas — keep existing poster */
      }
    };

    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", capturePoster);
    tryPlay();

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", capturePoster);
    };
  }, [mediaSrc, posterSrc, cmsPoster]);

  useEffect(() => {
    if (!mediaSrc) return;

    const unlockAutoplay = () => {
      void videoRef.current?.play().catch(() => {});
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
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            aria-label={showreel("ariaLabel")}
            {...{ "webkit-playsinline": "true" }}
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

      <div className="relative z-20 mx-auto flex h-full max-w-5xl flex-col items-center justify-end px-6 pb-36 text-center md:justify-center md:pb-0">
        <motion.div
          variants={heroCopyContainer}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col items-center"
        >
          <motion.p
            variants={heroCopyItem}
            className="mb-3 font-mono text-xs tracking-[0.3em] text-gold uppercase sm:text-sm"
          >
            {kicker}
          </motion.p>

          <motion.h1
            variants={heroCopyItem}
            className="font-display mb-4 text-4xl font-medium tracking-tight text-white drop-shadow-lg sm:text-6xl md:text-8xl"
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
            className="flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center"
          >
            <button
              type="button"
              onClick={() => scrollToId("pricing")}
              className="cursor-pointer rounded-full border border-gold/50 bg-transparent px-8 py-3.5 text-center font-medium text-gold transition-all duration-300 hover:border-gold hover:bg-gold/8 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              {t("cta")}
            </button>
            <button
              type="button"
              onClick={() => scrollToId("portfolio")}
              className="cursor-pointer rounded-full border border-white/30 px-8 py-3.5 text-center text-white backdrop-blur-md transition-all hover:border-white/60"
            >
              {t("ctaSecondary")}
            </button>
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
