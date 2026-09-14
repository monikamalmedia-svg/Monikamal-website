"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { videoControlButtonClass } from "@/components/videoControlStyles";

type ShowreelPlayerProps = {
  src?: string | null;
  poster?: string;
  className?: string;
};

type TapHint = "play" | "pause";

type VideoWithWebkit = HTMLVideoElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitEnterFullscreen?: () => void;
};

const SINGLE_CLICK_DELAY_MS = 250;
const HINT_HOLD_MS = 500;
const TILT_SPRING = { stiffness: 120, damping: 20 };
const MAX_TILT = 6;

function enterFullscreen(video: HTMLVideoElement) {
  const el = video as VideoWithWebkit;
  if (typeof el.requestFullscreen === "function") {
    void el.requestFullscreen();
    return;
  }
  if (typeof el.webkitRequestFullscreen === "function") {
    void el.webkitRequestFullscreen();
    return;
  }
  if (typeof el.webkitEnterFullscreen === "function") {
    el.webkitEnterFullscreen();
  }
}

export function ShowreelPlayer({
  src,
  poster,
  className = "",
}: ShowreelPlayerProps) {
  const t = useTranslations("Showreel");
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canHoverRef = useRef(false);
  const clickTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [tapHint, setTapHint] = useState<TapHint | null>(null);
  const [hintKey, setHintKey] = useState(0);
  const videoSrc = src?.trim() || null;

  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const glareX = useSpring(50, TILT_SPRING);
  const glareY = useSpring(50, TILT_SPRING);
  const glareBackground = useMotionTemplate`radial-gradient(42% 55% at ${glareX}% ${glareY}%, rgba(237, 230, 232, 0.16) 0%, rgba(212, 175, 55, 0.07) 28%, transparent 68%)`;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    const sync = () => {
      canHoverRef.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const resetTilt = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [glareX, glareY, rotateX, rotateY]);

  const handleTiltMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!canHoverRef.current) return;
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      rotateY.set((px - 0.5) * (MAX_TILT * 2));
      rotateX.set((0.5 - py) * (MAX_TILT * 2));
      glareX.set(px * 100);
      glareY.set(py * 100);
    },
    [glareX, glareY, rotateX, rotateY],
  );

  const clearClickTimer = useCallback(() => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);

  const showTapHint = useCallback((hint: TapHint) => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
    }
    setTapHint(hint);
    setHintKey((key) => key + 1);
    hintTimerRef.current = window.setTimeout(() => {
      setTapHint(null);
      hintTimerRef.current = null;
    }, HINT_HOLD_MS);
  }, []);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      showTapHint("play");
      return;
    }

    video.pause();
    showTapHint("pause");
  }, [showTapHint]);

  const handlePlayerClick = useCallback(() => {
    if (clickTimerRef.current !== null) {
      clearClickTimer();
      return;
    }

    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      togglePlayback();
    }, SINGLE_CLICK_DELAY_MS);
  }, [clearClickTimer, togglePlayback]);

  const handlePlayerDoubleClick = useCallback(() => {
    clearClickTimer();
    const video = videoRef.current;
    if (!video) return;
    enterFullscreen(video);
  }, [clearClickTimer]);

  const toggleMute = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      const nextMuted = !video.muted;
      video.muted = nextMuted;
      setMuted(nextMuted);

      if (!nextMuted) {
        void video.play();
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      clearClickTimer();
      if (hintTimerRef.current !== null) {
        window.clearTimeout(hintTimerRef.current);
      }
    };
  }, [clearClickTimer]);

  return (
    <div className="w-full [perspective:1100px]">
      <motion.div
        ref={cardRef}
        className={`relative z-20 aspect-video w-full select-none rounded-[2rem] border border-white/10 shadow-[0_20px_80px_rgba(0,_0,_0,_0.9)] transition-all duration-300 will-change-transform ${className}`}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleTiltMove}
        onMouseLeave={resetTilt}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        {videoSrc ? (
          <>
            <div
              className="h-full w-full cursor-pointer"
              onClick={handlePlayerClick}
              onDoubleClick={handlePlayerDoubleClick}
            >
              <ProtectedVideo
                ref={videoRef}
                className="h-full w-full cursor-pointer object-cover"
                src={videoSrc}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={t("ariaLabel")}
              />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <AnimatePresence>
                {tapHint ? (
                  <motion.div
                    key={hintKey}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.45, delay: 0.05 },
                    }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={`p-5 ${videoControlButtonClass}`}
                  >
                    {tapHint === "pause" ? (
                      <Pause className="h-12 w-12" strokeWidth={1.5} />
                    ) : (
                      <Play className="h-12 w-12" strokeWidth={1.5} />
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={toggleMute}
              onDoubleClick={(event) => event.stopPropagation()}
              aria-label={muted ? t("unmute") : t("mute")}
              className={`absolute right-5 bottom-5 z-20 h-11 w-11 cursor-pointer ${videoControlButtonClass}`}
            >
              {muted ? (
                <VolumeX className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Volume2 className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </>
        ) : (
          <>
            <ProtectedImage
              src="https://picsum.photos/1920/1080"
              alt={t("ariaLabel")}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-background/40" />
          </>
        )}

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[15] hidden mix-blend-soft-light [@media(hover:hover)]:block"
          style={{ background: glareBackground }}
        />
        </div>
      </motion.div>
    </div>
  );
}
