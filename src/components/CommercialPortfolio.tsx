"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type Ref } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { isPlayableVideoUrl, sizedImageUrl } from "@/lib/sanity-media";
import {
  conceptLabelKey,
  type ContentType,
  type PortfolioType,
  type ProjectType,
} from "@/lib/portfolio";
import { videoControlButtonClass } from "@/components/videoControlStyles";
import { Link } from "@/i18n/navigation";

export type PortfolioItem = {
  id: string;
  title: string;
  contentType: ContentType;
  projectType: ProjectType | null;
  format: string;
  caseSlug?: string | null;
  projectSlug?: string;
  year: string;
  mediaType: PortfolioType;
  imageUrl: string | null;
  videoUrl?: string | null;
};

type FilterId = "all" | ContentType;

/** UGC and AI videos get their own URL (/projects/[slug]) while open, like the About works. */
function hasDeepLink(item: PortfolioItem): item is PortfolioItem & { projectSlug: string } {
  return (
    item.mediaType === "video" &&
    isPlayableVideoUrl(item.videoUrl) &&
    (item.contentType === "ugc" || item.contentType === "aiCommercial") &&
    Boolean(item.projectSlug)
  );
}

const projectSlugFromPath = (path: string) => {
  const slug = path.match(/\/projects\/([^/?#]+)/)?.[1];
  return slug ? decodeURIComponent(slug) : null;
};

const FILTERS: { id: FilterId; labelKey: "filterAll" | "filterUgc" | "filterAi" | "filterProduct" }[] =
  [
    { id: "all", labelKey: "filterAll" },
    { id: "ugc", labelKey: "filterUgc" },
    { id: "aiCommercial", labelKey: "filterAi" },
    { id: "productContent", labelKey: "filterProduct" },
  ];

export const TYPE_LABEL_KEYS: Record<ContentType, "typeUgc" | "typeAiCommercial" | "typeProductContent"> = {
  ugc: "typeUgc",
  aiCommercial: "typeAiCommercial",
  productContent: "typeProductContent",
};

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
  imageWidth = 720,
}: {
  item: PortfolioItem;
  alt: string;
  className?: string;
  videoRef?: Ref<HTMLVideoElement>;
  isHovering?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  /** Requested image width: ~2× the card width; the lightbox asks for more. */
  imageWidth?: number;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const imageUrl = sizedImageUrl(item.imageUrl?.trim(), imageWidth);
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
          // Cards show the poster until hover/tap; loading 20+ MB per card upfront stalls the page.
          preload="none"
          controls={false}
          className={`pointer-events-none ${className} ${videoHiddenNativeControls}`}
          onPlaying={onPlay}
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
            loading="lazy"
            decoding="async"
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
      <ProtectedImage
        src={imageUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }

  return <div className={`bg-[#0d0509] ${className}`} aria-hidden />;
}

const subscribeNever = () => () => {};

export function PortfolioModal({
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
  const [failed, setFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Keyboard users land on "Close"; the opener gets focus back when the player closes.
    closeRef.current?.focus({ preventScroll: true });

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

  // Portalled to <body>: inside a section it would sit in that section's stacking context, and the
  // sections after it (also z-20) would paint over the lower part of the player and its controls.
  if (!isClient) return null;
  return createPortal(
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
        ref={closeRef}
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
        {isVideo && videoUrl && failed ? (
          // Clear message instead of an empty player when the file cannot be loaded.
          <div role="alert" className="flex h-full w-full items-center justify-center p-8 text-center text-base text-ivory">
            {t("videoError")}
          </div>
        ) : isVideo && videoUrl ? (
          <>
            <ProtectedVideo
              ref={videoRef}
              src={videoUrl}
              poster={sizedImageUrl(imageUrl, 900) || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              className={`pointer-events-none h-full w-full rounded-2xl object-cover ${videoHiddenNativeControls}`}
              onPlay={() => setIsPaused(false)}
              onPause={() => setIsPaused(true)}
              onError={() => setFailed(true)}
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
              onClick={(event) => togglePlay(event)}
              aria-label={isPaused ? t("play") : t("pause")}
              className={`absolute bottom-3 left-3 z-20 h-11 w-11 ${videoControlButtonClass}`}
            >
              {isPaused ? (
                <Play className="ml-0.5 h-5 w-5 fill-current" strokeWidth={1.25} />
              ) : (
                <Pause className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
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
            imageWidth={1600}
          />
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function PortfolioCard({
  item,
  onOpen,
}: {
  item: PortfolioItem;
  onOpen: (item: PortfolioItem) => void;
}) {
  const t = useTranslations("Portfolio");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canHover, setCanHover] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const isVideo = item.mediaType === "video" && isPlayableVideoUrl(item.videoUrl);
  const isPhoto = item.mediaType === "photo";
  const year = item.year.trim();
  const meta = [item.title, year].filter(Boolean).join(" · ");
  const details = [
    item.format,
    item.projectType === "concept" ? t(conceptLabelKey(item.contentType)) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const onMouseEnter = () => {
    if (!canHover || !isVideo) return;
    const video = videoRef.current;
    if (!video) return;
    video.loop = true;
    video.muted = true;
    void video.play().catch(() => undefined);
  };

  const onMouseLeave = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <article className="group mx-auto flex w-[85vw] max-w-[340px] flex-col items-center sm:w-full sm:max-w-[20rem] lg:max-w-[22rem]">
      <div className="flex w-full flex-col items-center">
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-2xl border border-glass-border bg-glass/10 transition-[border-color] duration-500 hover:border-gold/30 sm:h-[500px] sm:w-auto sm:max-w-full lg:h-[550px] ${
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
            onOpen(item);
          }}
          onDragStart={(event) => event.preventDefault()}
          className="absolute inset-0 z-[1] rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-inset"
          aria-label={item.title}
        >
          <PortfolioMedia
            item={item}
            alt={item.title}
            videoRef={videoRef}
            // Keep the poster until frames play, so a buffering video never flashes black.
            isHovering={!isPaused}
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
        <p className="text-xs tracking-[0.04em] text-gray-300">
          {t(TYPE_LABEL_KEYS[item.contentType])}
        </p>
        {meta ? (
          <p className="mt-1 text-sm font-medium tracking-wide text-white">
            {meta}
          </p>
        ) : null}
        {details ? (
          <p className="mt-1 text-xs tracking-wide text-foreground-muted">
            {details}
          </p>
        ) : null}
        {item.caseSlug ? (
          <Link
            href={`/portfolio/${item.caseSlug}`}
            // 44px touch target; the negative margins keep the text where the 17px-high link sat before.
            className="-mt-1.5 -mb-3 inline-flex min-h-11 items-center gap-1.5 px-3 text-sm text-gold underline-offset-[5px] hover:underline"
          >
            {t("viewCase")} <span aria-hidden>→</span>
          </Link>
        ) : null}
      </div>
      </div>
    </article>
  );
}

/** Full portfolio page (/portfolio, /projects/[slug]): filters, grid and per-video deep links. */
export function CommercialPortfolio({
  items,
  initialProjectSlug,
}: {
  items: PortfolioItem[];
  /** /projects/[slug] deep link: open this video on load. */
  initialProjectSlug?: string;
}) {
  const t = useTranslations("Portfolio");
  const locale = useLocale();
  const [filter, setFilter] = useState<FilterId>("all");
  const findBySlug = useCallback(
    (slug: string | null | undefined) =>
      (slug && items.find((item) => item.projectSlug === slug && hasDeepLink(item))) || null,
    [items],
  );
  const [active, setActive] = useState<PortfolioItem | null>(() => findBySlug(initialProjectSlug));
  // One close can fire twice (button + backdrop); only step back in history once.
  const steppingBack = useRef(false);

  // Back / Forward between /portfolio and /projects/[slug] closes or reopens the video.
  useEffect(() => {
    const onPopState = () => {
      steppingBack.current = false;
      setActive(findBySlug(projectSlugFromPath(window.location.pathname)));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [findBySlug]);

  // Hide filters without projects (e.g. UGC until real UGC work is added) instead of showing an empty state.
  const visibleFilters = FILTERS.filter(
    (tab) => tab.id === "all" || (items ?? []).some((item) => item.contentType === tab.id),
  );

  // Items arrive newest first (PORTFOLIO_ORDER); "All" and every category keep that order.
  const visibleItems =
    filter === "all" ? (items ?? []) : (items ?? []).filter((item) => item.contentType === filter);

  const openItem = useCallback(
    (item: PortfolioItem) => {
      setActive(item);
      if (hasDeepLink(item)) {
        window.history.pushState({ portfolioWork: item.projectSlug }, "", `/${locale}/projects/${item.projectSlug}`);
      }
    },
    [locale],
  );

  const closeItem = useCallback(() => {
    setActive(null);
    if (!projectSlugFromPath(window.location.pathname)) return;
    // Opened from this page: step back to /portfolio, so Forward reopens the video.
    if (window.history.state?.portfolioWork) {
      if (steppingBack.current) return;
      steppingBack.current = true;
      window.history.back();
      return;
    }
    // Arrived directly on /projects/[slug]: show the portfolio URL in place of the deep link.
    window.history.replaceState(null, "", `/${locale}/portfolio`);
  }, [locale]);

  const selectFilter = useCallback((next: FilterId) => {
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
            <p className="text-sm tracking-[0.04em] text-gold">
              {t("label")}
            </p>

            <div
              role="tablist"
              aria-label={t("filterLabel")}
              className="grid w-full max-w-[20rem] shrink-0 grid-cols-2 gap-1 rounded-2xl border border-white/12 bg-white/[0.04] p-1 sm:inline-flex sm:w-auto sm:max-w-none sm:gap-0 sm:rounded-full"
            >
              {visibleFilters.map((tab) => {
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
                    className={`relative cursor-pointer whitespace-nowrap rounded-full px-3 py-2 odd:last:col-span-2 text-sm tracking-[0.02em] transition-colors duration-300 sm:px-4 md:px-5 ${
                      selected
                        ? "text-ivory-strong"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="portfolio-filter-pill"
                        className="absolute inset-0 rounded-full border border-white/20 bg-white/[0.09]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                    <span className="relative z-10">{t(tab.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </header>

          <div
            id="portfolio-grid"
            role="tabpanel"
            aria-labelledby={`portfolio-tab-${filter}`}
          >
            <div className="grid grid-cols-1 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-6">
              {visibleItems.map((item) => (
                <PortfolioCard key={item.id} item={item} onOpen={openItem} />
              ))}
            </div>
            {visibleItems.length === 0 ? (
              <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
                <p className="text-base leading-relaxed text-foreground-muted">
                  {t("empty")}
                </p>
                <a
                  href="#kennismaking"
                  onClick={(event) => {
                    const target = document.getElementById("kennismaking");
                    if (!target) return;
                    event.preventDefault();
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="mt-5 text-base text-gold underline-offset-[6px] transition-colors duration-300 hover:text-ivory-strong hover:underline"
                >
                  {t("emptyCta")} <span aria-hidden>→</span>
                </a>
              </div>
            ) : null}
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

/** Cards + lightbox without the section chrome or filters (used on service pages). */
export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const t = useTranslations("Portfolio");
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const closeItem = useCallback(() => setActive(null), []);

  return (
    <>
      <div className="grid grid-cols-1 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-6">
        {items.map((item) => (
          <PortfolioCard key={item.id} item={item} onOpen={setActive} />
        ))}
      </div>
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
