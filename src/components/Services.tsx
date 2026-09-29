"use client";

import type { MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pagePath, servicePath, type Locale, type ServiceKey } from "@/lib/services";

// Card titles link to the service pages. CTA `service` targets a service page;
// `anchor` targets live on the homepage.
const SERVICES = [
  { key: "ugc", page: "ugc", target: { service: "ugc" } },
  { key: "ai", page: "ai", target: { anchor: "portfolio" } },
  { key: "product", page: "product", target: { service: "product" } },
] as const satisfies readonly {
  key: string;
  page: ServiceKey;
  target: { service: ServiceKey } | { anchor: string };
}[];

const TAGS = ["one", "two", "three"] as const;

const ctaClass =
  "mt-5 inline-flex items-center gap-2 self-start py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";

function scrollToAnchor(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Services() {
  const t = useTranslations("Services");
  const locale = useLocale() as Locale;

  return (
    <section
      id="diensten"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 pt-12 pb-16 md:px-10 md:pt-16 md:pb-20 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative z-20 mb-10 max-w-2xl rounded-xl text-left backdrop-blur-sm md:mb-14">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {t("kicker")}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-balance text-foreground">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {t("intro")}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {SERVICES.map(({ key, page, target }) => {
            const cta = (
              <>
                {t(`items.${key}.cta`)}
                <span aria-hidden>→</span>
              </>
            );

            return (
              <article
                key={key}
                className="relative z-20 flex h-full flex-col rounded-2xl border border-glass-border bg-graphite p-6 backdrop-blur-sm transition-colors duration-300 hover:border-gold/40 md:p-8"
              >
                <h3 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem]">
                  <Link
                    href={servicePath(page, locale)}
                    className="underline-offset-[6px] transition-colors duration-300 hover:text-gold hover:underline"
                  >
                    {t(`items.${key}.title`)}
                  </Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground-muted">
                  {t(`items.${key}.body`)}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-glass-border px-2.5 py-1 text-[10px] tracking-[0.16em] text-foreground-muted uppercase"
                    >
                      {t(`items.${key}.tags.${tag}`)}
                    </li>
                  ))}
                </ul>

                {"service" in target ? (
                  <Link href={servicePath(target.service, locale)} className={ctaClass}>
                    {cta}
                  </Link>
                ) : (
                  <a
                    href={`#${target.anchor}`}
                    onClick={(event) => scrollToAnchor(event, target.anchor)}
                    className={ctaClass}
                  >
                    {cta}
                  </a>
                )}
              </article>
            );
          })}
        </div>
        <div className="mt-8">
          <Link href={pagePath("hub", locale)} className="inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline">
            {t("allServices")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
