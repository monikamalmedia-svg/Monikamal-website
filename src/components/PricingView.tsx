"use client";

import { Check } from "lucide-react";
import { useContactDialog } from "@/components/ContactDialog";
import type { DisplayPackage } from "@/lib/cms-pricing";

type Props = {
  heading: string;
  intro?: string | null;
  kicker: string;
  defaultCta: string;
  packages: DisplayPackage[];
  /** One line under the cards, e.g. how scope and usage rights are agreed. */
  note?: string | null;
};

/** Compact package cards: name, price, one line, the key points and a CTA to the intro-call form. */
export function PricingView({ heading, intro, kicker, defaultCta, packages, note }: Props) {
  const { openContact } = useContactDialog();

  return (
    <section
      id="pricing"
      className="band band-pine-soft relative z-20 scroll-mt-24 px-6 py-14 md:px-10 md:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 max-w-2xl md:mb-10">
          <p className="mb-3 text-sm tracking-[0.04em] text-gold">{kicker}</p>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-light tracking-tight text-foreground">
            {heading}
          </h2>
          {intro ? <p className="mt-4 max-w-xl text-base text-foreground-muted md:text-lg">{intro}</p> : null}
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {packages.map((pack) => (
            <article
              key={`${pack.key}-${pack.name}`}
              className="flex flex-col rounded-2xl border border-glass-border bg-graphite p-6 md:p-7"
            >
              <h3 className="font-display text-2xl font-normal tracking-tight text-foreground">{pack.name}</h3>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-4xl font-light tracking-tight text-foreground">{pack.price}</span>
                {pack.period ? <span className="text-sm text-foreground-muted">{pack.period}</span> : null}
              </p>
              {pack.pricePerUnit ? <p className="mt-1 text-sm text-foreground-muted">{pack.pricePerUnit}</p> : null}
              {pack.tagline ? <p className="mt-3 text-base text-foreground-muted">{pack.tagline}</p> : null}

              {pack.features.length > 0 ? (
                <ul className="mt-5 flex flex-col gap-2 border-t border-glass-border pt-5">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                      <Check className="mt-[3px] h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                      <span className="min-w-0">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={(event) => openContact({ packageId: pack.key, opener: event.currentTarget })}
                  className="w-full rounded-full border border-gold/50 px-5 py-3 text-base text-gold transition-colors duration-300 hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
                >
                  {pack.cta ?? defaultCta}
                </button>
              </div>
            </article>
          ))}
        </div>

        {note ? <p className="mt-6 max-w-2xl text-base text-foreground-muted">{note}</p> : null}
      </div>
    </section>
  );
}
