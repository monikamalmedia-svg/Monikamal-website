"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Play, Volume2, VolumeX, X } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { isPlayableVideoUrl } from "@/lib/sanity-media";
import { type PortfolioType } from "@/lib/portfolio";
import { videoControlButtonClass } from "@/components/videoControlStyles";

type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  year: string;
  mediaType: PortfolioType;
  imageUrl: string | null;
  videoUrl?: string | null;
  isPlaceholder?: boolean;
};

const PHOTO_PLACEHOLDERS: PortfolioItem[] = [
  {
    id: "photo-placeholder-1",
    title: "Cybernetic Luxury I",
    category: "Cyber-Luxury",
    year: "2026",
    mediaType: "photo",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    isPlaceholder: true,
  },
  {
    id: "photo-placeholder-2",
    title: "Neon Elegance II",
    category: "Cyber-Luxury",
    year: "2026",
    mediaType: "photo",
    imageUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop",
    isPlaceholder: true,
  },
  {
    id: "photo-placeholder-3",
    title: "Gold & Dark Abstract",
    category: "Cyber-Luxury",
    year: "2026",
    mediaType: "photo",
    imageUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1000&auto=format&fit=crop",
    isPlaceholder: true,
  },
];

const FILTERS: { id: PortfolioType; labelKey: "filterVideos" | "filterPhotos" }[] =
  [
    { id: "video", labelKey: "filterVideos" },
    { id: "photo", labelKey: "filterPhotos" },
  ];

const videoHiddenNativeControls =
  "[&::-webkit-media-controls]:hidden [&::-webkit-media-controls-enclosure]:hidden [&::-webkit-media-controls-panel]:hidden [&::-webkit-media-controls-timeline]:hidden [&::-webkit-media-controls-current-time-display]:hidden [&::-webkit-media-controls-time-remaining-display]:hidden";

function PortfolioMedia({
  item,
  alt,
  className = "w-full h-full object-cover rounded-2xl",
  videoRef,
  isHovering = false,
  onPlay,
  onPause,
}: {
  item: PortfolioItem;
  alt: string;
  className?: string;
  videoRef?: Ref<HTMLVideoElement>;
  isHovering?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const imageUrl = item.imageUrl?.trim() || "";
  const videoUrl = isPlayableVideoUrl(item.videoUrl) ? item.videoUrl : null;
  const showVideo =
    item.mediaType === "video" && Boolean(videoUrl) && !videoFailed;

  if (showVideo && videoUrl) {
    return (
      <div className="relative h-full w-full">
        <ProtectedVideo
          ref={videoRef}
          src={videoUrl}
          poster={imageUrl || undefined}
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          className={`pointer-events-none ${className} ${videoHiddenNativeControls}`}
          onPlay={onPlay}
          onPause={onPause}
          onError={(event) => {
            console.error("Video load error:", event);
            setVideoFailed(true);
          }}
        />
        {imageUrl ? (
          <ProtectedImage
            src={imageUrl}
            alt={alt}
            className={`pointer-events-none absolute inset-0 z-[1] h-full w-full rounded-2xl object-cover transition-opacity duration-300 ${
              isHovering ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : null}
      </div>
    );
  }

  if (imageUrl) {
    return (
      <ProtectedImage src={imageUrl} alt={alt} className={className} />
    );
  }

  return <div className={`bg-[#0d0509] ${className}`} aria-hidden />;
}

function PortfolioModal({
  item,
  title,
  onClose,
  closeLabel,
}: {
  item: PortfolioItem;
  title: string;
  onClose: () => void;
  closeLabel: string;
}) {
  const t = useTranslations("Portfolio");
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = isPlayableVideoUrl(item.videoUrl) ? item.videoUrl : null;
  const imageUrl = item.imageUrl?.trim() || "";
  const isVideo = item.mediaType === "video" && Boolean(videoUrl);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
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
  }, [onClose]);

  useEffect(() => {
    if (!isVideo) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    setIsMuted(true);
    const attempt = video.play();
    if (!attempt) return;
    void attempt.catch(() => {
      video.muted = true;
      void video.play().catch(() => setIsPaused(true));
    });
  }, [isVideo, videoUrl]);

  const togglePlay = (event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
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

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
        aria-label={closeLabel}
        className="absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-glass/10 text-blush backdrop-blur transition-colors hover:border-blush/50 hover:text-gold md:top-8 md:right-8"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>

      <motion.div
        className={`relative select-none overflow-hidden rounded-2xl border border-glass-border ${
          isVideo
            ? "aspect-[9/16] h-[min(85vh,720px)] w-auto max-w-[min(100%,420px)] cursor-pointer bg-[#0d0509]"
            : "flex max-h-[90vh] w-auto max-w-[min(100%,1100px)] cursor-default items-center justify-center bg-[#0d0509]"
        }`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={isVideo ? togglePlay : (event) => event.stopPropagation()}
        onDragStart={(event) => event.preventDefault()}
      >
        {isVideo && videoUrl ? (
          <>
            <ProtectedVideo
              ref={videoRef}
              src={videoUrl}
              poster={imageUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              className={`pointer-events-none h-full w-full rounded-2xl object-cover ${videoHiddenNativeControls}`}
              onPlay={() => setIsPaused(false)}
              onPause={() => setIsPaused(true)}
            />

            {isPaused ? (
              <span className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                <span className={`h-16 w-16 ${videoControlButtonClass}`}>
                  <Play className="ml-0.5 h-6 w-6 fill-current" strokeWidth={1.25} />
                </span>
              </span>
            ) : null}

            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={!isMuted}
              aria-label={isMuted ? t("unmute") : t("mute")}
              className={`absolute right-3 bottom-3 z-20 h-11 w-11 ${videoControlButtonClass}`}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Volume2 className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </>
        ) : (
          <PortfolioMedia
            item={item}
            alt={title}
            className="max-h-[90vh] w-auto max-w-full object-contain"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function PortfolioCard({
  item,
  onOpen,
}: {
  item: PortfolioItem;
  onOpen: (item: PortfolioItem) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canHover, setCanHover] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const isVideo = item.mediaType === "video" && isPlayableVideoUrl(item.videoUrl);
  const isPhoto = item.mediaType === "photo";
  const category = item.category.trim();
  const year = item.year.trim();
  const meta = [item.title, year].filter(Boolean).join(" · ");

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const onMouseEnter = () => {
    if (!canHover || !isVideo) return;
    setHovered(true);
    const video = videoRef.current;
    if (!video) return;
    video.loop = true;
    video.muted = true;
    void video.play().catch(() => undefined);
  };

  const onMouseLeave = () => {
    setHovered(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <article className="group mx-auto flex w-full max-w-[20rem] flex-col items-center lg:max-w-[22rem]">
      <div className="flex w-max max-w-full flex-col items-center">
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`relative mx-auto aspect-[9/16] h-[min(70svh,31.25rem)] w-auto max-w-full overflow-hidden rounded-2xl border border-glass-border bg-glass/10 transition-[border-color] duration-500 hover:border-gold/30 sm:h-[500px] lg:h-[550px] ${
          isPhoto ? "cursor-zoom-in" : "cursor-pointer"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            const video = videoRef.current;
            if (video) {
              video.pause();
              video.currentTime = 0;
            }
            setHovered(false);
            onOpen(item);
          }}
          onDragStart={(event) => event.preventDefault()}
          className="absolute inset-0 z-[1] text-left focus-visible:outline-none"
          aria-label={item.title}
        >
          <PortfolioMedia
            item={item}
            alt={item.title}
            videoRef={videoRef}
            isHovering={hovered || !isPaused}
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
            className="h-full w-full rounded-2xl object-cover"
          />
        </button>

        {isVideo && isPaused ? (
          <span className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
            <span className={`h-14 w-14 ${videoControlButtonClass}`}>
              <Play className="ml-0.5 h-5 w-5 fill-current" strokeWidth={1.25} />
            </span>
          </span>
        ) : null}
      </div>

      <div className="mt-3 w-full shrink-0 text-center">
        {category ? (
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-300 uppercase">
            {category}
          </p>
        ) : null}
        {meta ? (
          <p className={`text-sm font-medium tracking-wide text-white ${category ? "mt-1" : ""}`}>
            {meta}
          </p>
        ) : null}
      </div>
      </div>
    </article>
  );
}

export function CommercialPortfolio({
  items,
  sanityDocs,
}: {
  items: PortfolioItem[];
  sanityDocs?: unknown;
}) {
  const t = useTranslations("Portfolio");
  const [filter, setFilter] = useState<PortfolioType>("video");
  const [active, setActive] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    console.log("[Portfolio GROQ] caseStudy", sanityDocs);
  }, [sanityDocs]);

  const visibleItems = (() => {
    const matched = (items ?? []).filter((item) => item.mediaType === filter);
    if (filter === "photo" && matched.length === 0) {
      return PHOTO_PLACEHOLDERS;
    }
    return matched;
  })();

  const openItem = useCallback((item: PortfolioItem) => {
    setActive(item);
  }, []);

  const closeItem = useCallback(() => {
    setActive(null);
  }, []);

  const selectFilter = useCallback((next: PortfolioType) => {
    setFilter(next);
    setActive(null);
  }, []);

  return (
    <>
      <section
        id="portfolio"
        className="relative z-20 scroll-mt-24 bg-transparent px-6 py-16 md:px-10 md:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <header className="relative z-20 mb-8 flex flex-col items-center gap-6 rounded-xl text-center backdrop-blur-sm md:mb-10 md:flex-row md:items-center md:justify-between md:text-left">
            <p className="text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
              {t("label")}
            </p>

            <div
              role="tablist"
              aria-label={t("filterLabel")}
              className="grid w-full max-w-[19.5rem] shrink-0 grid-cols-2 rounded-full border border-glass-border bg-graphite p-1 sm:max-w-none sm:inline-flex sm:w-auto"
            >
              {FILTERS.map((tab) => {
                const selected = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="portfolio-grid"
                    id={`portfolio-tab-${tab.id}`}
                    onClick={() => selectFilter(tab.id)}
                    className={`relative cursor-pointer rounded-full px-3 py-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors duration-300 sm:px-4 sm:text-xs md:px-5 ${
                      selected
                        ? "text-gold"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="portfolio-filter-pill"
                        className="absolute inset-0 rounded-full border border-gold bg-gold/10 shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span className="relative z-10">{t(tab.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </header>

          <div id="portfolio-grid" role="tabpanel" aria-labelledby={`portfolio-tab-${filter}`}>
            <div className="grid grid-cols-1 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-6">
              {visibleItems.map((item) => (
                <PortfolioCard key={item.id} item={item} onOpen={openItem} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {active ? (
          <PortfolioModal
            item={active}
            title={active.title}
            closeLabel={t("close")}
            onClose={closeItem}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
