"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { PortfolioModal, TYPE_LABEL_KEYS, type PortfolioItem } from "@/components/CommercialPortfolio";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { Link } from "@/i18n/navigation";
import { isPlayableVideoUrl, sizedImageUrl } from "@/lib/sanity-media";

/** Seconds a column needs to travel one card; columns differ slightly so the wall never moves in lockstep. */
const SECONDS_PER_CARD = 15;
const COLUMN_SPEED = [1, 1.18, 0.9, 1.08];
/** Where each column starts in its cycle (fraction of one loop). */
const COLUMN_OFFSET = [0, 0.38, 0.62, 0.18];
/** Height/width of the card: 9:16 for video; photos keep their own proportions (from the Sanity file name). */
function aspectRatio(item: PortfolioItem): string {
  if (item.mediaType === "video") return "9 / 16";
  const size = item.imageUrl?.match(/-(\d+)x(\d+)\.\w+(?:\?|$)/);
  return size ? `${size[1]} / ${size[2]}` : "4 / 5";
}

const canPlay = (item: PortfolioItem) => item.mediaType === "video" && isPlayableVideoUrl(item.videoUrl);

/** Unique works only (stable Sanity ID), videos and photos alternating so neighbours differ. */
export function wallOrder(items: PortfolioItem[]): PortfolioItem[] {
  const unique = [...new Map(items.map((item) => [item.id, item])).values()];
  const videos = unique.filter(canPlay);
  const stills = unique.filter((item) => !canPlay(item));
  const mixed: PortfolioItem[] = [];
  for (let index = 0; index < Math.max(videos.length, stills.length); index += 1) {
    if (videos[index]) mixed.push(videos[index]);
    if (stills[index]) mixed.push(stills[index]);
  }
  return mixed;
}

/**
 * Each work goes to exactly one column, row by row in "snake" order (left→right, then
 * right→left), so the alternating video/photo rhythm also alternates within every column.
 */
function toColumns(items: PortfolioItem[], count: number): PortfolioItem[][] {
  const columns = Array.from({ length: count }, () => [] as PortfolioItem[]);
  items.forEach((item, index) => {
    const row = Math.floor(index / count);
    const position = index % count;
    columns[row % 2 === 0 ? position : count - 1 - position].push(item);
  });
  return columns;
}

function WallCard({
  item,
  copy,
  onOpen,
  className = "",
}: {
  item: PortfolioItem;
  /**
   * The second set of a column only keeps the loop seamless: still clickable, but hidden from
   * assistive tech and the tab order (so every work is announced and focusable once).
   */
  copy?: boolean;
  onOpen: (item: PortfolioItem, opener: HTMLElement) => void;
  className?: string;
}) {
  const t = useTranslations("Portfolio");
  const [preview, setPreview] = useState(false);
  const [playing, setPlaying] = useState(false);
  const isVideo = canPlay(item);
  // Independent concepts say so on the card itself, so a brand name never reads as a commission.
  const type = [t(TYPE_LABEL_KEYS[item.contentType]), item.projectType === "concept" ? t("conceptShort") : ""]
    .filter(Boolean)
    .join(" · ");
  const poster = sizedImageUrl(item.imageUrl?.trim(), 640);
  const tabIndex = copy ? -1 : undefined;

  // A short muted preview of the hovered video card only (fine pointers); the full video opens on click.
  const startPreview = () => {
    if (isVideo && window.matchMedia("(hover: hover) and (pointer: fine)").matches) setPreview(true);
  };
  const stopPreview = () => {
    setPreview(false);
    setPlaying(false);
  };

  const image = poster ? (
    <ProtectedImage
      src={poster}
      alt={isVideo ? "" : item.title}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover object-[50%_30%] ${
        isVideo ? "transition-transform duration-700 ease-out group-hover/card:scale-[1.025]" : ""
      }`}
    />
  ) : null;

  return (
    <figure
      className={`group/card relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0509] ${
        isVideo ? "transition-[border-color] duration-500 hover:border-gold/35" : ""
      } ${className}`}
      style={{ aspectRatio: aspectRatio(item) }}
      data-work-id={item.id}
      aria-hidden={copy || undefined}
      onMouseEnter={isVideo ? startPreview : undefined}
      onMouseLeave={isVideo ? stopPreview : undefined}
    >
      {isVideo ? (
        <button
          type="button"
          tabIndex={tabIndex}
          onClick={(event) => {
            stopPreview();
            onOpen(item, event.currentTarget);
          }}
          aria-label={`${t("watchVideo")}: ${item.title} — ${type}`}
          className="absolute inset-0 block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-inset"
        >
          {image}
          {preview && item.videoUrl ? (
            <ProtectedVideo
              src={item.videoUrl}
              muted
              loop
              autoPlay
              playsInline
              preload="none"
              controls={false}
              aria-hidden
              onPlaying={() => setPlaying(true)}
              className={`pointer-events-none absolute inset-0 h-full w-full scale-[1.025] object-cover transition-opacity duration-500 ${
                playing ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null}
          {/* Small, consistent play mark */}
          <span
            aria-hidden
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition-colors group-hover/card:border-gold/70"
          >
            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" strokeWidth={1.25} />
          </span>
        </button>
      ) : (
        // Photos are visual only on the wall: no lightbox, no link, no tab stop.
        <div className="absolute inset-0">{image}</div>
      )}

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pt-12 pb-4">
        <p className="text-xs tracking-[0.04em] text-white/75">{type}</p>
        <p className="font-display mt-0.5 text-lg leading-snug text-white md:text-xl">{item.title}</p>
        {isVideo || item.caseSlug ? (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {isVideo ? (
              <span aria-hidden className="inline-flex items-center gap-1.5 text-white/90">
                <Play className="h-3 w-3 fill-current" strokeWidth={1.25} /> {t("watchVideo")}
              </span>
            ) : null}
            {item.caseSlug ? (
              <Link
                href={`/portfolio/${item.caseSlug}`}
                tabIndex={tabIndex}
                className="pointer-events-auto inline-flex min-h-8 items-center gap-1.5 text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/70"
              >
                {t("viewCase")} <span aria-hidden>→</span>
              </Link>
            ) : null}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}

function WallColumns({
  items,
  count,
  onOpen,
  className,
}: {
  items: PortfolioItem[];
  count: number;
  onOpen: (item: PortfolioItem, opener: HTMLElement) => void;
  className: string;
}) {
  const columns = toColumns(items, count);
  return (
    <div className={`h-full gap-3 md:gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {columns.map((column, index) => {
        const loop = column.length * SECONDS_PER_CARD * COLUMN_SPEED[index % COLUMN_SPEED.length];
        const style = {
          "--wall-duration": `${loop}s`,
          "--wall-delay": `${-loop * COLUMN_OFFSET[index % COLUMN_OFFSET.length]}s`,
          "--wall-reveal-delay": `${index * 110}ms`,
        } as CSSProperties;
        return (
          <div key={index} className="wall-column min-w-0" style={style}>
            {/* The full column twice: moving by -50% lands exactly on the copy (seamless loop). */}
            <div className={`wall-track ${index % 2 === 0 ? "wall-track-up" : "wall-track-down"}`}>
              {[0, 1].map((set) => (
                <div key={set} className={set === 1 ? "wall-set wall-set-copy" : "wall-set"}>
                  {column.map((item) => (
                    <div key={`${item.id}-${set}`} className="pb-3 md:pb-4">
                      <WallCard item={item} copy={set === 1} onOpen={onOpen} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Homepage portfolio: a slow, living wall of vertical columns (4 on wide screens, 3 in between)
 * that drift in opposite directions; a swipeable strip on mobile. Pauses on hover/focus, when
 * paused by the visitor, off-screen and in a background tab; static with reduced motion.
 */
export function PortfolioWall({ items }: { items: PortfolioItem[] }) {
  const t = useTranslations("Portfolio");
  const sectionRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wallItems = wallOrder(items);
  const openItem = useCallback((item: PortfolioItem, opener: HTMLElement) => {
    openerRef.current = opener;
    setActive(item);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const wall = wallRef.current;
    if (!section || !wall) return;
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          reveal.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    const visibility = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    reveal.observe(section);
    visibility.observe(wall);
    return () => {
      reveal.disconnect();
      visibility.disconnect();
    };
  }, []);

  useEffect(() => {
    const sync = () => setTabHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Faint light that follows the cursor inside the wall (CSS vars, written once per frame).
  const frame = useRef(0);
  const onPointerMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const wall = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const box = wall.getBoundingClientRect();
      wall.style.setProperty("--wall-x", `${clientX - box.left}px`);
      wall.style.setProperty("--wall-y", `${clientY - box.top}px`);
    });
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const closeItem = useCallback(() => {
    setActive(null);
    // Back to the card that opened the player (the copy's twin when a loop copy was clicked).
    window.setTimeout(() => openerRef.current?.focus({ preventScroll: true }), 0);
  }, []);
  const paused = userPaused || !onScreen || tabHidden || Boolean(active);

  return (
    <section
      data-nav-caption="work"
      ref={sectionRef}
      id="portfolio"
      data-revealed={revealed || undefined}
      className="portfolio-wall relative z-20 scroll-mt-20 pt-4 pb-8 md:pt-6 md:pb-10"
    >
      <header className="wall-intro mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.08] font-light text-balance text-foreground">
          {t("wall.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-foreground-muted md:text-lg">{t("wall.body")}</p>
      </header>

      {/* Desktop / tablet: the moving wall. */}
      <div
        ref={wallRef}
        data-paused={paused || undefined}
        onMouseMove={onPointerMove}
        className="wall-viewport relative mx-auto mt-10 hidden h-[1450px] max-w-[96rem] xl:h-[1780px] overflow-hidden px-4 md:mt-12 md:block lg:px-6"
      >
        <WallColumns items={wallItems} count={3} onOpen={openItem} className="grid xl:hidden" />
        <WallColumns items={wallItems} count={4} onOpen={openItem} className="hidden xl:grid" />
        <div aria-hidden className="wall-light pointer-events-none absolute inset-0" />
      </div>

      {/*
        Mobile: a native horizontal strip with scroll-snap (momentum, no JS gestures). Each card is
        ~83% wide so the next one peeks in; vertical page scrolling is untouched. A swipe never
        fires a click (the browser cancels it once the finger pans), so only a tap opens a video.
      */}
      <div className="mt-8 md:hidden">
        <ul
          aria-label={t("wall.stripLabel")}
          className="wall-strip flex snap-x snap-mandatory scroll-px-4 gap-3.5 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {wallItems.map((item) => (
            <li key={item.id} className="w-[83%] max-w-[360px] shrink-0 snap-start">
              <WallCard item={item} onOpen={openItem} className="!aspect-[3/4]" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 flex max-w-[96rem] flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 md:mt-10 md:justify-between">
        <button
          type="button"
          onClick={() => setUserPaused((value) => !value)}
          aria-pressed={userPaused}
          className="wall-motion-toggle hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none md:inline-flex"
        >
          {userPaused ? (
            <Play className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          ) : (
            <Pause className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          )}
          {userPaused ? t("wall.resume") : t("wall.pause")}
        </button>
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 rounded-full border border-gold/45 px-6 py-2.5 text-base text-gold transition-colors hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
        >
          {t("viewAllWork")} <span aria-hidden>→</span>
        </Link>
      </div>

      <AnimatePresence>
        {active ? (
          <PortfolioModal item={active} title={active.title} closeLabel={t("close")} onClose={closeItem} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
