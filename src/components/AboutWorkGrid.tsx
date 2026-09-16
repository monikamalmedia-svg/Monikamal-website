"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Pause, Play, Maximize2, Volume2, VolumeX, X } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { isPlayableVideoUrl } from "@/lib/sanity-media";
import { videoControlButtonClass } from "@/components/videoControlStyles";
import {
  enterVideoFullscreen,
  useAutoHideVideoControls,
} from "@/hooks/useAutoHideVideoControls";

export type AboutWorkItem = {
  key: string;
  title: string;
  videoUrl: string | null;
  imageUrl: string | null;
};

function AboutWorkModal({
  item,
  onClose,
}: {
  item: AboutWorkItem;
  onClose: () => void;
}) {
  const t = useTranslations("About");
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = isPlayableVideoUrl(item.videoUrl) ? item.videoUrl : null;
  const imageUrl = item.imageUrl?.trim() || "";
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { visible: controlsVisible, canHover, reveal, onMouseEnter, onMouseLeave } =
    useAutoHideVideoControls();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
      videoRef.current?.pause();
    };
  }, [mounted, onClose]);

  useEffect(() => {
    if (!mounted || !videoUrl) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    setIsMuted(true);
    void video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      void video.play().catch(() => setIsPaused(true));
    });
  }, [mounted, videoUrl]);

  const togglePlay = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = isMuted;
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        void video.play().catch(() => setIsPaused(true));
      });
      return;
    }
    video.pause();
  };

  const toggleMute = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
  };

  const goFullscreen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    enterVideoFullscreen(video);
  };

  const overlay = (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,2,6,0.95)] p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-glass/10 text-blush backdrop-blur transition-colors hover:border-blush/50 hover:text-gold md:top-8 md:right-8"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <motion.div
        className="relative aspect-video w-[min(100%,1100px)] overflow-hidden rounded-2xl border border-glass-border bg-[#0d0509]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => {
          event.stopPropagation();
          if (!videoUrl) return;
          if (!canHover && !controlsVisible) {
            reveal();
            return;
          }
          togglePlay(event);
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="absolute inset-0">
          {videoUrl ? (
            <>
              <ProtectedVideo
                ref={videoRef}
                src={videoUrl}
                poster={imageUrl || undefined}
                muted={isMuted}
                loop
                playsInline
                allowFullscreen
                preload="auto"
                controls={false}
                className="h-full w-full rounded-2xl object-contain"
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
              />

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPaused ? t("play") : t("pause")}
                className={`absolute top-1/2 left-1/2 z-20 h-16 w-16 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${videoControlButtonClass} ${
                  controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {isPaused ? (
                  <Play className="ml-0.5 h-6 w-6 fill-current" strokeWidth={1.25} />
                ) : (
                  <Pause className="h-6 w-6 fill-current" strokeWidth={1.25} />
                )}
              </button>

              <button
                type="button"
                onClick={goFullscreen}
                aria-label={t("fullscreen")}
                className={`absolute right-14 bottom-3 z-20 h-11 w-11 md:hidden transition-opacity duration-300 ${videoControlButtonClass} ${
                  controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <Maximize2 className="h-5 w-5" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-pressed={!isMuted}
                aria-label={isMuted ? t("unmute") : t("mute")}
                className={`absolute right-3 bottom-3 z-20 h-11 w-11 transition-opacity duration-300 ${videoControlButtonClass} ${
                  controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="h-5 w-5" strokeWidth={1.5} />
                )}
              </button>
            </>
          ) : imageUrl ? (
            <ProtectedImage
              src={imageUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}

function getCardVideo(target: EventTarget & HTMLElement) {
  return target.closest("article")?.querySelector("video") ?? target.querySelector("video");
}

function AboutWorkCard({
  item,
  placeholderLabel,
  onOpen,
}: {
  item: AboutWorkItem;
  placeholderLabel: string;
  onOpen: (item: AboutWorkItem) => void;
}) {
  const t = useTranslations("About");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { visible: controlsVisible, onMouseEnter, onMouseLeave } =
    useAutoHideVideoControls();
  const videoUrl = isPlayableVideoUrl(item.videoUrl) ? item.videoUrl : null;
  const imageUrl = item.imageUrl?.trim() || "";

  const playPreview = (event: PointerEvent<HTMLElement>) => {
    if (!videoUrl) return;
    setHovered(true);
    const video = getCardVideo(event.currentTarget) ?? videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.loop = true;
    void video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      void video.play().catch(() => undefined);
    });
  };

  const stopPreview = (event?: PointerEvent<HTMLElement>) => {
    setHovered(false);
    const video =
      (event ? getCardVideo(event.currentTarget) : null) ?? videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const togglePlay = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!videoUrl) return;
    const video = getCardVideo(event.currentTarget) ?? videoRef.current;
    if (!video) return;
    if (video.paused) {
      setHovered(true);
      video.muted = isMuted;
      video.loop = true;
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        void video.play().catch(() => undefined);
      });
      return;
    }
    video.pause();
  };

  const toggleMute = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const video = getCardVideo(event.currentTarget) ?? videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
  };

  const onClick = () => {
    stopPreview();
    onOpen(item);
  };

  return (
    <article className="relative aspect-video overflow-hidden rounded-2xl border border-glass-border bg-glass/10">
      {videoUrl || imageUrl ? (
        <div
          onPointerEnter={playPreview}
          onPointerLeave={stopPreview}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="absolute inset-0"
        >
          <button
            type="button"
            onClick={onClick}
            className="absolute inset-0 z-[1] cursor-pointer text-left focus-visible:outline-none"
            aria-label={item.title}
          >
            {videoUrl ? (
              <div className="absolute inset-0">
                <ProtectedVideo
                  ref={videoRef}
                  src={videoUrl}
                  poster={imageUrl || undefined}
                  muted={isMuted}
                  loop
                  playsInline
                  allowFullscreen
                  preload="auto"
                  controls={false}
                  className="pointer-events-none h-full w-full rounded-xl object-cover"
                  onPlay={() => setIsPaused(false)}
                  onPause={() => setIsPaused(true)}
                />
              </div>
            ) : null}

            {imageUrl ? (
              <ProtectedImage
                src={imageUrl}
                alt=""
                className={`pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-300 ${
                  videoUrl && hovered ? "opacity-0" : "opacity-100"
                }`}
              />
            ) : null}
          </button>

          {videoUrl ? (
            <>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPaused ? t("play") : t("pause")}
                className={`absolute top-1/2 left-1/2 z-20 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${videoControlButtonClass} ${
                  controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {isPaused ? (
                  <Play className="ml-0.5 h-5 w-5 fill-current" strokeWidth={1.25} />
                ) : (
                  <Pause className="h-5 w-5 fill-current" strokeWidth={1.25} />
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-pressed={!isMuted}
                aria-label={isMuted ? t("unmute") : t("mute")}
                className={`absolute right-3 bottom-3 z-20 h-10 w-10 transition-opacity duration-300 ${videoControlButtonClass} ${
                  controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="h-4 w-4" strokeWidth={1.5} />
                )}
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0509]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 bottom-8 h-24 rounded-full bg-amber-500/15 blur-[60px]"
          />
          <p className="relative z-10 font-mono text-[10px] tracking-[0.22em] text-white/50 uppercase">
            {placeholderLabel}
          </p>
        </div>
      )}
    </article>
  );
}

export function AboutWorkGrid({
  items,
  placeholderLabel,
}: {
  items: AboutWorkItem[];
  placeholderLabel: string;
}) {
  const [active, setActive] = useState<AboutWorkItem | null>(null);

  const openItem = useCallback((item: AboutWorkItem) => {
    setActive(item);
  }, []);

  const closeItem = useCallback(() => {
    setActive(null);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item) => (
          <AboutWorkCard
            key={item.key}
            item={item}
            placeholderLabel={placeholderLabel}
            onOpen={openItem}
          />
        ))}
      </div>

      <AnimatePresence>
        {active ? <AboutWorkModal item={active} onClose={closeItem} /> : null}
      </AnimatePresence>
    </>
  );
}
