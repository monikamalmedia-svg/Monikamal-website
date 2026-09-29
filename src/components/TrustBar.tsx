"use client";

import { useTranslations } from "next-intl";

// Real client brands only. Brands used in independent concepts (e.g. Rituals)
// are labelled as concepts in the portfolio and do not belong in this bar.
const LOGOS = [
  { src: "/logos/celsius.png", alt: "Celsius", height: 24 },
  { src: "/logos/clearly.svg", alt: "Clearly", height: 22 },
  { src: "/logos/trueseamoss.png", alt: "True Sea Moss", height: 26 },
] as const;

// Repeat the set so one marquee group is wider than the container.
const REPEAT = 3;

function LogoSet({ hidden = false }: { hidden?: boolean }) {
  const items = Array.from({ length: REPEAT }, () => LOGOS).flat();

  return (
    <div className="trust-marquee-group" aria-hidden={hidden || undefined}>
      {items.map((logo, index) => (
        <span
          key={`${hidden ? "dup" : "main"}-${logo.src}-${index}`}
          className="flex h-[26px] items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt={hidden || index >= LOGOS.length ? "" : logo.alt}
            className="m-0 block w-auto max-w-none shrink-0 border-0 bg-transparent object-contain p-0 align-middle"
            style={{
              height: logo.height,
              width: "auto",
              maxWidth: "none",
              filter: "brightness(0) invert(1)",
              opacity: 0.8,
              verticalAlign: "middle",
            }}
            draggable={false}
          />
        </span>
      ))}
    </div>
  );
}

export function TrustBar() {
  const t = useTranslations("TrustBar");

  return (
    <section
      id="brands"
      aria-label={t("title")}
      className="relative z-20 scroll-mt-16 bg-transparent px-6 pt-20 pb-6 md:px-10 md:pt-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-center text-[10px] tracking-[0.28em] text-foreground-muted uppercase md:mb-8 md:text-xs">
          {t("title")}
        </p>
        <div className="trust-marquee">
          <div className="trust-marquee-track">
            <LogoSet />
            <LogoSet hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
