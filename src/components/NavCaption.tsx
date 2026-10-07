"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routeFromSlug } from "@/lib/services";

const CAPTION_KEYS = [
  "hero",
  "work",
  "services",
  "process",
  "about",
  "contact",
  "hub",
  "ugc",
  "ai",
  "product",
  "howItWorks",
  "aboutPage",
] as const;
type CaptionKey = (typeof CAPTION_KEYS)[number];
const isCaptionKey = (value: string | undefined): value is CaptionKey => (CAPTION_KEYS as readonly string[]).includes(value ?? "");

/** "k:<message key>" or "t:<literal text>" (e.g. a case title). */
type Token = `k:${CaptionKey}` | `t:${string}`;

/** A thin line at ~40% of the viewport height decides which section is "current". */
const ACTIVE_LINE = "-40% 0px -59% 0px";
/** The line must stay in a section this long before the caption changes (no flicker on edges). */
const SETTLE_MS = 140;
/** Half of the crossfade (out, then in): ~200ms in total. */
const FADE_MS = 100;

function tokenOf(node: HTMLElement): Token | null {
  const text = node.dataset.navCaptionText?.trim();
  if (text) return `t:${text}`;
  const key = node.dataset.navCaption;
  return isCaptionKey(key) ? `k:${key}` : null;
}

/** Best guess from the URL alone (first paint, before the page is observed). */
function tokenFromPath(pathname: string): Token {
  const [first = "", second] = pathname.replace(/^\//, "").split("/");
  if (first === "portfolio" && !second) return "k:work";
  if (first === "about") return "k:aboutPage";
  const route = second ? null : routeFromSlug(first);
  if (route?.kind === "service") return `k:${route.key}`;
  if (route?.kind === "page") return route.key === "hub" ? "k:hub" : "k:howItWorks";
  return "k:hero";
}

/**
 * The centre text of the floating header: names the section (homepage) or page that is in view.
 * Sections opt in with data-nav-caption / data-nav-caption-text; the innermost one crossing the
 * active line wins. Text swaps with a short crossfade (instant with reduced motion); no live
 * region, so scrolling does not announce every change.
 */
export function NavCaption({ className }: { className?: string }) {
  const t = useTranslations("Navbar.captions");
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState<Token>(() => tokenFromPath(pathname));
  const [visible, setVisible] = useState(true);
  const shownRef = useRef(shown);
  const reduceRef = useRef(reduceMotion);

  useEffect(() => {
    reduceRef.current = reduceMotion;
  }, [reduceMotion]);

  useEffect(() => {
    let settle = 0;
    let fade = 0;
    let observer: IntersectionObserver | null = null;

    const show = (next: Token) => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (next === shownRef.current) return;
        shownRef.current = next;
        window.clearTimeout(fade);
        if (reduceRef.current) {
          setShown(next);
          setVisible(true);
          return;
        }
        setVisible(false);
        fade = window.setTimeout(() => {
          setShown(next);
          setVisible(true);
        }, FADE_MS);
      }, SETTLE_MS);
    };

    // Wait a frame so the new page's sections are in the DOM after a route change.
    const frame = window.requestAnimationFrame(() => {
      const nodes = [...document.querySelectorAll<HTMLElement>("[data-nav-caption], [data-nav-caption-text]")].filter((node) => tokenOf(node));
      const page = nodes.find((node) => node.tagName === "MAIN");
      const hits = new Set<Element>();

      const pick = () => {
        const inside = nodes.filter((node) => hits.has(node));
        // Innermost section on the line (e.g. contact inside an inner page's <main>).
        const leaf = inside.filter((node) => !inside.some((other) => other !== node && node.contains(other))).pop();
        const next = (leaf && tokenOf(leaf)) || (page && tokenOf(page)) || null;
        if (next) show(next);
      };

      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) hits.add(entry.target);
          else hits.delete(entry.target);
        }
        pick();
      }, { rootMargin: ACTIVE_LINE });
      nodes.forEach((node) => observer?.observe(node));
      if (nodes.length === 0) show(tokenFromPath(pathname));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(fade);
      observer?.disconnect();
    };
  }, [pathname]);

  const text = shown.startsWith("t:") ? shown.slice(2) : t(shown.slice(2) as CaptionKey);

  return (
    <p
      className={`${className ?? ""} transition-opacity ease-out motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {text}
    </p>
  );
}
