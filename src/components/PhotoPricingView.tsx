"use client";

import { Check } from "lucide-react";
import { useSelectedPackage } from "@/context/SelectedPackageContext";
import type { DisplayPackage } from "@/lib/cms-pricing";

type Props = {
  heading: string;
  kicker: string;
  intro: string;
  badge: string;
  cta: string;
  packages: DisplayPackage[];
};

export function PhotoPricingView({
  heading,
  kicker,
  intro,
  badge,
  cta,
  packages,
}: Props) {
  const { selectPackage } = useSelectedPackage();

  return (
    <section
      id="photography"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 py-20 md:px-10 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-4xl">
        <header className="relative z-20 mb-10 max-w-2xl rounded-xl text-left backdrop-blur-sm md:mb-14">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {kicker}
          </p>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {intro}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {packages.map((pack) => (
            <div
              key={`${pack.key}-${pack.name}`}
              className={
                pack.featured
                  ? "glow-border-card relative z-20 h-full"
                  : "relative z-20 h-full"
              }
            >
              <article
                className={
                  pack.featured
                    ? "relative flex h-full flex-col rounded-2xl bg-graphite p-6 backdrop-blur-sm md:p-8"
                    : "relative flex h-full flex-col rounded-2xl border border-glass-border bg-graphite p-6 backdrop-blur-sm md:p-8"
                }
              >
                {pack.featured ? (
                  <span className="absolute top-5 right-5 rounded-full border border-gold px-2.5 py-1 text-[10px] tracking-[0.16em] text-gold uppercase">
                    {badge}
                  </span>
                ) : null}

                <h3 className="font-display pr-20 text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem]">
                  {pack.name}
                </h3>

                <div className="mt-4">
                  <p className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                    {pack.price}
                  </p>
                  {pack.pricePerUnit ? (
                    <p className="mt-1 text-sm text-foreground-muted">
                      {pack.pricePerUnit}
                    </p>
                  ) : null}
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-3">
                  {pack.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-relaxed text-foreground-muted"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => selectPackage(pack.key)}
                  className="mt-8 w-full rounded-full border border-gold/50 bg-transparent px-5 py-3 text-xs font-medium tracking-wide text-gold uppercase [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] transition-all duration-300 hover:border-gold hover:bg-gold/8 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  {cta}
                </button>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
