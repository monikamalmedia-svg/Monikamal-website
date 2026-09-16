"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Play, RotateCcw, Maximize2, Volume2, VolumeX } from "lucide-react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { videoControlButtonClass } from "@/components/videoControlStyles";
import {
  enterVideoFullscreen,
  useAutoHideVideoControls,
} from "@/hooks/useAutoHideVideoControls";

type AboutMeVideoPlayerProps = {
  src: string;
  label: string;
};

const aboutGhostControlClass =
  "appearance-none !border-0 !bg-transparent shadow-none ring-0 outline-none backdrop-blur-none hover:!bg-transparent hover:shadow-none focus-visible:!bg-transparent";

function preventBrowserChrome(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

export function AboutMeVideoPlayer({ src, label }: AboutMeVideoPlayerProps) {
  const t = useTranslations("About");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasEndedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [allowAutoPlay, setAllowAutoPlay] = useState(true);
  const { visible: controlsVisible, canHover, reveal, onMouseEnter, onMouseLeave } =
    useAutoHideVideoControls();

  const disableNativeRestart = useCallback((video: HTMLVideoElement) => {
    video.loop = false;
    video.autoplay = false;
    video.removeAttribute("loop");
    video.removeAttribute("autoplay");
  }, []);

  const finishPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasEndedRef.current) return;

    hasEndedRef.current = true;
    disableNativeRestart(video);
    video.pause();
    setHasEnded(true);
    setIsPaused(true);
  }, [disableNativeRestart]);

  const playOnce = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    disableNativeRestart(video);
    video.muted = isMuted;
    const attempt = video.play();
    if (!attempt) return;

    void attempt.catch(() => {
      setIsMuted(true);
      video.muted = true;
      void video.play().catch(() => {
        setIsPaused(true);
      });
    });
  }, [disableNativeRestart, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    hasEndedRef.current = false;
    setHasEnded(false);
    setIsPaused(false);
    setIsMuted(true);
    setAllowAutoPlay(true);
    video.loop = false;
    video.removeAttribute("loop");
    video.muted = true;
    video.autoplay = true;

    let cancelled = false;
    const attempt = video.play();
    if (attempt) {
      void attempt.catch(() => {
        if (cancelled) return;
        video.muted = true;
        void video.play().catch(() => {
          if (!cancelled) setIsPaused(true);
        });
      });
    }

    return () => {
      cancelled = true;
      video.pause();
    };
  }, [src]);

  const toggleMute = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsMuted((prev) => {
      const next = !prev;
      const video = videoRef.current;
      if (video) video.muted = next;
      return next;
    });
  }, []);

  const togglePlay = useCallback(
    (event?: MouseEvent<HTMLElement>) => {
      event?.stopPropagation();
      const video = videoRef.current;
      if (!video) return;
      if (hasEndedRef.current || video.ended) return;

      if (!video.paused) {
        video.pause();
        return;
      }

      playOnce();
    },
    [playOnce],
  );

  const goFullscreen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    enterVideoFullscreen(video);
  }, []);

  const replay = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      hasEndedRef.current = false;
      setHasEnded(false);
      setIsPaused(false);
      disableNativeRestart(video);
      video.currentTime = 0;
      playOnce();
    },
    [disableNativeRestart, playOnce],
  );

  return (
    <div
      className="relative h-full w-full cursor-pointer overflow-hidden rounded-2xl select-none"
      onClick={(event) => {
        if (!canHover && !controlsVisible) {
          reveal();
          return;
        }
        togglePlay(event);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={preventBrowserChrome}
    >
      <ProtectedVideo
        ref={videoRef}
        src={src}
        className="pointer-events-none h-full w-full rounded-2xl border border-white/10 object-cover shadow-[0_20px_50px_rgba(0,_0,_0,_0.8)] [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-enclosure]:hidden [&::-webkit-media-controls-panel]:hidden [&::-webkit-media-controls-mute-button]:hidden"
        autoPlay={allowAutoPlay}
        muted={isMuted}
        playsInline
        allowFullscreen
        controls={false}
        disablePictureInPicture
        preload="auto"
        aria-label={label}
        onContextMenu={preventBrowserChrome}
        onLoadedMetadata={(event) => {
          event.currentTarget.loop = false;
          event.currentTarget.removeAttribute("loop");
        }}
        onPlaying={(event) => {
          if (hasEndedRef.current) {
            event.currentTarget.pause();
            return;
          }
          disableNativeRestart(event.currentTarget);
          setAllowAutoPlay(false);
          setIsPaused(false);
        }}
        onPlay={(event) => {
          if (hasEndedRef.current) {
            event.currentTarget.pause();
            return;
          }
          event.currentTarget.loop = false;
          setIsPaused(false);
        }}
        onPause={() => {
          if (hasEndedRef.current || videoRef.current?.ended) return;
          setIsPaused(true);
        }}
        onEnded={finishPlayback}
      />

      {isPaused && !hasEnded ? (
        <span
          className={`pointer-events-none absolute inset-0 z-[3] flex items-center justify-center transition-opacity duration-300 ${
            controlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className={`h-14 w-14 ${videoControlButtonClass}`}>
            <Play className="ml-0.5 h-5 w-5 fill-current" strokeWidth={1.25} />
          </span>
        </span>
      ) : null}

      <button
        type="button"
        onClick={goFullscreen}
        aria-label={t("fullscreen")}
        style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
        className={`absolute right-14 bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-full md:hidden ${aboutGhostControlClass} text-white/85 transition-opacity duration-300 hover:text-white ${
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Maximize2
          className="h-5 w-5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
          strokeWidth={1.5}
        />
      </button>

      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={!isMuted}
        aria-label={isMuted ? t("unmute") : t("mute")}
        style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
        className={`absolute right-3 bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-full ${aboutGhostControlClass} text-white/85 transition-opacity duration-300 hover:text-white md:right-4 md:bottom-4 md:h-11 md:w-11 ${
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {isMuted ? (
          <VolumeX
            className="h-5 w-5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
            strokeWidth={1.5}
          />
        ) : (
          <Volume2
            className="h-5 w-5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
            strokeWidth={1.5}
          />
        )}
      </button>

      <AnimatePresence>
        {hasEnded ? (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={replay}
              aria-label={t("replay")}
              style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
              className={`inline-flex items-center gap-2 px-1 py-1 ${aboutGhostControlClass} text-xs font-medium tracking-[0.2em] text-white/80 uppercase transition-colors duration-300 hover:text-white`}
            >
              <RotateCcw
                className="h-3.5 w-3.5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
                strokeWidth={1.5}
              />
              {t("replay")}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <span className="sr-only">{isPaused ? t("play") : t("pause")}</span>
    </div>
  );
}
