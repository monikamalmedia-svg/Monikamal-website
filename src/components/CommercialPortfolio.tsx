"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type Ref } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
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

type PortfolioLayout = {
  sticky: boolean;
  groupSize: number;
};

const FILTERS: { id: PortfolioType; labelKey: "filterVideos" | "filterPhotos" }[] =
  [
    { id: "video", labelKey: "filterVideos" },
    { id: "photo", labelKey: "filterPhotos" },
  ];

const LG_MQ = "(min-width: 1024px)";
const MD_MQ = "(min-width: 768px)";
const GRID_STILL_TIME = 1.75;

function hasThumbnail(item: PortfolioItem) {
  return Boolean(item.imageUrl?.trim());
}

function previewStillTime(video: HTMLVideoElement) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return GRID_STILL_TIME;
  if (duration <= GRID_STILL_TIME) return Math.max(0, duration * 0.35);
  return GRID_STILL_TIME;
}

function showGridStillFrame(video: HTMLVideoElement, onReady?: () => void) {
  video.pause();
  video.muted = true;

  const finish = () => {
    video.pause();
    video.muted = true;
    onReady?.();
  };

  const seek = () => {
    const next = previewStillTime(video);
    if (!Number.isFinite(next)) {
      finish();
      return;
    }

    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      finish();
    };

    if (Math.abs(video.currentTime - next) < 0.05 && video.readyState >= 2) {
      finish();
      return;
    }

    video.addEventListener("seeked", onSeeked);
    video.currentTime = next;
  };

  if (video.readyState >= 1) {
    seek();
    return;
  }

  const onMeta = () => {
    video.removeEventListener("loadedmetadata", onMeta);
    seek();
  };
  video.addEventListener("loadedmetadata", onMeta);
}

function chunkItems<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

function usePortfolioLayout(): PortfolioLayout {
  const [layout, setLayout] = useState<PortfolioLayout>({
    sticky: false,
    groupSize: 1,
  });

  useLayoutEffect(() => {
    const lg = window.matchMedia(LG_MQ);
    const md = window.matchMedia(MD_MQ);
    const sync = () => {
      if (lg.matches) setLayout({ sticky: true, groupSize: 3 });
      else if (md.matches) setLayout({ sticky: true, groupSize: 2 });
      else setLayout({ sticky: false, groupSize: 1 });
    };
    sync();
    lg.addEventListener("change", sync);
    md.addEventListener("change", sync);
    return () => {
      lg.removeEventListener("change", sync);
      md.removeEventListener("change", sync);
    };
  }, []);

  return layout;
}

function PortfolioMedia({
  item,
  alt,
  className = "w-full h-full object-cover rounded-2xl",
  videoRef,
  isHovering = false,
  loop = true,
}: {
  item: PortfolioItem;
  alt: string;
  className?: string;
  videoRef?: Ref<HTMLVideoElement>;
  isHovering?: boolean;
  loop?: boolean;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const imageUrl = item.imageUrl?.trim() || "";
  const videoUrl = isPlayableVideoUrl(item.videoUrl) ? item.videoUrl : null;
  const showVideo =
    item.mediaType === "video" && Boolean(videoUrl) && !videoFailed;
  const showStillOverlay = showVideo && Boolean(imageUrl);

  if (showVideo && videoUrl) {
    return (
      <div className="relative h-full w-full">
        <ProtectedVideo
          ref={videoRef}
          src={videoUrl}
          poster={imageUrl || undefined}
          crossOrigin="anonymous"
          preload={imageUrl ? "metadata" : "auto"}
          playsInline
          muted
          loop={loop}
          controls={false}
          className={className}
          onLoadedData={(event) => {
            event.currentTarget.muted = true;
            if (!isHovering) {
              event.currentTarget.pause();
              if (!imageUrl) showGridStillFrame(event.currentTarget);
            }
          }}
          onError={(event) => {
            console.error("Video load error:", event);
            setVideoFailed(true);
          }}
        />
        {showStillOverlay ? (
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
  const hideTimerRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const videoUrl = isPlayableVideoUrl(item.videoUrl) ? item.videoUrl : null;
  const imageUrl = item.imageUrl?.trim() || "";
  const isVideo = item.mediaType === "video" && Boolean(videoUrl);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (isPausedRef.current) return;
    hideTimerRef.current = window.setTimeout(() => {
      if (!isPausedRef.current) setControlsVisible(false);
    }, 2800);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    revealControls();

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [onClose, revealControls]);

  const setPausedState = (paused: boolean) => {
    isPausedRef.current = paused;
    setIsPaused(paused);
    if (paused) {
      setControlsVisible(true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      return;
    }
    revealControls();
  };

  const togglePlay = (event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        void video.play().catch(() => setPausedState(true));
      });
      return;
    }

    video.pause();
  };

  const toggleMute = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    revealControls();
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
  };

  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!isVideo) return;
    togglePlay();
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
      onMouseMove={isVideo ? revealControls : undefined}
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
            ? `aspect-[9/16] h-[min(85vh,720px)] w-auto max-w-[min(100%,420px)] ${
                !controlsVisible && !isPaused ? "cursor-none" : "cursor-pointer"
              }`
            : "flex max-h-[90vh] w-auto max-w-[min(100%,1100px)] cursor-default items-center justify-center bg-[#0d0509]"
        }`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={onStageClick}
        onDragStart={(event) => event.preventDefault()}
        onMouseMove={isVideo ? revealControls : undefined}
      >
        {isVideo && videoUrl ? (
          <ProtectedVideo
            ref={videoRef}
            src={videoUrl}
            poster={imageUrl || undefined}
            autoPlay
            muted
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            controls={false}
            className="pointer-events-none h-full w-full rounded-2xl object-cover"
            onLoadedData={(event) => {
              event.currentTarget.muted = true;
              setIsMuted(true);
              void event.currentTarget.play().catch(() => setPausedState(true));
            }}
            onPlay={() => setPausedState(false)}
            onPause={() => setPausedState(true)}
          />
        ) : (
          <PortfolioMedia
            item={item}
            alt={title}
            className="max-h-[90vh] w-auto max-w-full object-contain"
          />
        )}

        {isVideo ? (
          <motion.div
            className={`absolute inset-0 z-20 ${
              controlsVisible || isPaused ? "pointer-events-auto" : "pointer-events-none"
            }`}
            initial={false}
            animate={{ opacity: controlsVisible || isPaused ? 1 : 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <button
              type="button"
              onClick={togglePlay}
              onMouseEnter={revealControls}
              aria-label={isPaused ? t("play") : t("pause")}
              className={`absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 ${videoControlButtonClass}`}
            >
              {isPaused ? (
                <Play className="ml-0.5 h-6 w-6 fill-current" strokeWidth={1.25} />
              ) : (
                <Pause className="h-6 w-6 fill-current" strokeWidth={1.25} />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              onMouseEnter={revealControls}
              aria-pressed={!isMuted}
              aria-label={isMuted ? t("unmute") : t("mute")}
              className={`absolute right-3 bottom-3 h-11 w-11 md:right-4 md:bottom-4 ${videoControlButtonClass}`}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Volume2 className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </motion.div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

function PortfolioCard({
  item,
  sticky,
  onOpen,
}: {
  item: PortfolioItem;
  sticky: boolean;
  onOpen: (item: PortfolioItem) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoveringRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const isVideo = item.mediaType === "video";
  const isPhoto = item.mediaType === "photo";
  const usesThumbnail = isVideo && hasThumbnail(item);
  const [stillReady, setStillReady] = useState(!isVideo || usesThumbnail);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    hoveringRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    video.muted = true;
    video.loop = true;
    video.pause();

    if (usesThumbnail) {
      setStillReady(true);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setStillReady(true);
    }, 2500);

    const applyStill = () => {
      if (cancelled || hoveringRef.current) return;
      showGridStillFrame(video, () => {
        if (!cancelled) setStillReady(true);
      });
    };

    video.addEventListener("loadedmetadata", applyStill);
    video.addEventListener("loadeddata", applyStill);
    if (video.readyState >= 1) applyStill();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", applyStill);
      video.removeEventListener("loadeddata", applyStill);
    };
  }, [item.id, isVideo, usesThumbnail]);

  const onMouseEnter = () => {
    setHovered(true);
    hoveringRef.current = true;
    if (!canHover) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.loop = true;
    video.currentTime = 0;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  };

  const onMouseLeave = () => {
    setHovered(false);
    hoveringRef.current = false;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.muted = true;
    if (!usesThumbnail) showGridStillFrame(video);
  };

  return (
    <article
      className={`group mx-auto flex w-full shrink-0 flex-col gap-3 md:mx-0 md:w-[280px] md:max-w-none lg:w-[320px] ${
        isVideo ? "max-w-[16.5rem] sm:max-w-[17.5rem]" : "max-w-sm"
      }`}
    >
      <motion.button
        type="button"
        onClick={() => {
          const video = videoRef.current;
          if (video) {
            video.pause();
            video.muted = true;
            if (!usesThumbnail) showGridStillFrame(video);
          }
          onOpen(item);
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDragStart={(event) => event.preventDefault()}
        whileHover={canHover && !sticky ? { scale: 1.05 } : undefined}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`relative aspect-[9/16] w-full origin-center select-none overflow-hidden rounded-2xl border border-glass-border bg-glass/10 text-left shadow-none transition-[border-color] duration-500 hover:border-gold/30 focus-visible:outline-none ${
          isPhoto ? "cursor-zoom-in" : ""
        }`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[#0d0509]">
          <div
            className={`h-full w-full ${
              isPhoto
                ? "opacity-100"
                : `transition-opacity duration-300 ${
                    stillReady || hovered || usesThumbnail
                      ? "opacity-100"
                      : "opacity-0"
                  }`
            }`}
          >
            <PortfolioMedia
              item={item}
              alt={item.title}
              videoRef={videoRef}
              isHovering={hovered}
              loop
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>

          {isVideo ? (
            <>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(15,2,6,0.28)_100%)] md:bg-[linear-gradient(180deg,transparent_45%,rgba(15,2,6,0.45)_100%)]" />
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-opacity duration-300 ${
                  hovered ? "opacity-100" : "opacity-0"
                }`}
              />
            </>
          ) : null}

          {isVideo ? (
            <motion.span
              className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
              initial={false}
              animate={{
                opacity: hovered ? 0 : 0.85,
                scale: hovered ? 0.85 : 1,
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className={`h-10 w-10 shrink-0 md:h-14 md:w-14 ${videoControlButtonClass}`}
              >
                <Play
                  className="ml-px h-3.5 w-3.5 fill-current md:ml-0.5 md:h-5 md:w-5"
                  strokeWidth={1.25}
                />
              </span>
            </motion.span>
          ) : null}
        </div>
      </motion.button>

      <div className="px-1 text-center md:text-left">
        <h3
          className={`font-display font-medium tracking-tight text-foreground md:text-2xl ${
            isVideo ? "text-lg" : "text-xl"
          }`}
        >
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          {item.category}
          <span className="mx-2 text-foreground-muted/50">·</span>
          {item.year}
        </p>
      </div>
    </article>
  );
}

function PortfolioGroup({
  items,
  index,
  isLast,
  sticky,
  onOpen,
}: {
  items: PortfolioItem[];
  index: number;
  isLast: boolean;
  sticky: boolean;
  onOpen: (item: PortfolioItem) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    isLast ? [0, 1] : [0, 0.55, 1],
    isLast ? [1, 1] : [1, 1, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    isLast ? [0, 0.12, 1] : [0, 0.12, 0.55, 1],
    isLast ? [0.92, 1, 1] : [0.92, 1, 1, 0.92],
  );

  const entered = useInView(groupRef, { once: true, amount: 0.3 });

  return (
    <div ref={sectionRef} className={`relative ${sticky ? "md:min-h-[100vh]" : ""}`}>
      <motion.div
        ref={groupRef}
        className={`relative z-20 flex w-full justify-center will-change-transform ${
          sticky
            ? "md:sticky md:top-[20vh]"
            : ""
        }`}
        style={
          sticky
            ? {
                opacity,
                scale,
                transformOrigin: "center top",
                zIndex: 20 + index,
              }
            : { zIndex: 20 + index }
        }
        initial={false}
        animate={
          sticky
            ? { y: 0 }
            : entered
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 28 }
        }
        transition={
          sticky
            ? { duration: 0 }
            : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div className="grid w-full grid-cols-1 justify-items-center gap-10 md:flex md:flex-row md:flex-wrap md:items-start md:justify-center md:gap-6 lg:gap-8">
          {items.map((item) => (
            <PortfolioCard
              key={item.id}
              item={item}
              sticky={sticky}
              onOpen={onOpen}
            />
          ))}
        </div>
      </motion.div>
    </div>
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
  const layout = usePortfolioLayout();
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
  const groups = chunkItems(visibleItems, layout.groupSize);

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
        className="relative z-20 scroll-mt-24 bg-transparent px-6 py-24 md:px-10 md:py-32 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <header className="relative z-20 mb-12 flex flex-col items-center gap-8 rounded-xl text-center backdrop-blur-sm md:mb-20 md:flex-row md:items-end md:justify-between md:gap-10 md:text-left">
            <div className="w-full max-w-2xl md:text-left">
              <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
                {t("label")}
              </p>
              <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
                {t("title")}
              </h2>
            </div>

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
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filter}-${layout.groupSize}`}
                className={`flex flex-col ${layout.sticky ? "gap-10 md:gap-0" : "gap-10"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.22 } }}
                transition={{ duration: 0.35 }}
              >
                {groups.map((group, index) => (
                  <PortfolioGroup
                    key={group.map((item) => item.id).join("-")}
                    items={group}
                    index={index}
                    isLast={index === groups.length - 1}
                    sticky={layout.sticky}
                    onOpen={openItem}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
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
