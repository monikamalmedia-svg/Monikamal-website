"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SitePicture } from "@/components/SitePicture";

/**
 * Over mij card: one container with a thin border and 24px radius — the 4:5 portrait of Monika
 * (public/images/visuals/monika-portrait-*, from assets/visual-originals/Monika.jpeg) and a
 * two-line caption below it in normal flow. The portrait drifts at most ±7px inside its frame
 * (static with reduced motion).
 */
export function PortraitFrame({
  alt,
  name,
  role,
}: {
  alt: string;
  name: string;
  role: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [7, -7]);

  return (
    <figure
      ref={ref}
      className="mx-auto w-full max-w-[26rem] overflow-hidden rounded-[24px] border border-white/12 bg-[#140c11] lg:mt-10 lg:max-w-none"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <motion.div
          className="absolute -inset-y-2 inset-x-0 motion-reduce:![transform:none]"
          style={reduceMotion ? undefined : { y }}
        >
          {/* 3:4 photo in a 4:5 frame: the small vertical crop is taken mostly below the head. */}
          <SitePicture
            name="monika-portrait"
            alt={alt}
            sizes="(min-width: 1024px) 480px, (min-width: 640px) 416px, 92vw"
            className="h-full w-full object-cover object-[50%_32%]"
          />
        </motion.div>
      </div>
      <figcaption className="border-t border-white/12 px-5 py-5 md:px-6 md:py-6">
        <span className="font-display block text-xl leading-tight text-ivory-strong">{name}</span>
        <span className="mt-1.5 block text-sm text-foreground-muted">{role}</span>
      </figcaption>
    </figure>
  );
}
