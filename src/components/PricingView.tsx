"use client";

import { Check } from "lucide-react";
import { PackageBadge } from "@/components/PackageBadge";
import { useSelectedPackage } from "@/context/SelectedPackageContext";
import type { DisplayPackage } from "@/lib/cms-pricing";

type Props = {
  heading: string;
  intro: string;
  kicker: string;
  badge: string;
  introLabel: string;
  regularPriceLabel: string;
  defaultCta: string;
  packages: DisplayPackage[];
};

export function PricingView({
  heading,
  intro,
  kicker,
  badge,
  introLabel,
  regularPriceLabel,
  defaultCta,
  packages,
}: Props) {
  const { selectPackage } = useSelectedPackage();

  return (
    <section
      id="pricing"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 pt-24 pb-8 md:px-10 md:pt-32 md:pb-10 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative z-20 mb-12 max-w-2xl rounded-xl text-left backdrop-blur-sm md:mb-16">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {kicker}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {intro}
          </p>
        </header>

        {/* Desktop: each card spans 4 subgrid rows (intro, price, features, CTA) so rows line up across cards. */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0">
          {packages.map((pack) => (
            <article
              key={`${pack.key}-${pack.name}`}
              className="relative z-20 flex flex-col rounded-2xl border border-glass-border bg-graphite p-6 backdrop-blur-sm md:p-8 lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-0"
            >
              <div>
                {pack.featured ? <PackageBadge>{badge}</PackageBadge> : null}

                <h3 className="font-display pr-28 text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem]">
                  {pack.name}
                </h3>
                {pack.tagline ? (
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    {pack.tagline}
                  </p>
                ) : null}
              </div>

              <div className="mt-6">
                {pack.oldPrice ? (
                  <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-gold/80 uppercase">
                    {introLabel}
                    {pack.discount ? (
                      <span className="rounded-full bg-gold/10 px-2 py-0.5 font-medium tracking-[0.08em] text-gold">
                        {pack.discount}
                      </span>
                    ) : null}
                  </p>
                ) : null}

                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                    {pack.price}
                  </span>
                  {pack.period ? (
                    <span className="text-sm text-foreground-muted">{pack.period}</span>
                  ) : null}
                  {pack.oldPrice ? (
                    <span className="text-base text-foreground-muted/80">
                      <span className="sr-only">{regularPriceLabel} </span>
                      <s className="decoration-foreground-muted/60 decoration-1">
                        {pack.oldPrice}
                      </s>
                    </span>
                  ) : null}
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
                      className="mt-[3px] h-4 w-4 shrink-0 text-gold"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="min-w-0">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col justify-end">
                {pack.valueNote ? (
                  <p className="mb-4 border-t border-glass-border pt-4 text-xs leading-relaxed text-foreground-muted">
                    {pack.valueNote}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => selectPackage(pack.key)}
                  className="w-full rounded-full border border-gold/50 bg-transparent px-5 py-3 text-xs font-medium tracking-wide text-gold uppercase [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] transition-all duration-300 hover:border-gold hover:bg-gold/8 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  {pack.cta ?? defaultCta}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
