"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { SitePicture } from "@/components/SitePicture";
import { Link } from "@/i18n/navigation";
import { pagePath, servicePath, type Locale, type ServiceKey } from "@/lib/services";

/** Homepage: what each service is, linking to its own page (packages and prices live there). */
const SERVICES = [
  { key: "ugc", page: "ugc", image: "dienst-ugc" },
  { key: "ai", page: "ai", image: "dienst-ai" },
  { key: "product", page: "product", image: "dienst-product" },
] as const satisfies readonly { key: string; page: ServiceKey; image: string }[];

/** Burgundy-black section (#160F14): ivory text, small champagne accents; the page grid fades out before it. */
export function Services() {
  const t = useTranslations("Services");
  const locale = useLocale() as Locale;

  return (
    <section
      data-nav-caption="services"
      id="diensten"
      className="tone tone-services tone-after-grid z-20 scroll-mt-24 px-6 pt-[calc(var(--blend)+1rem)] pb-16 md:px-10 md:pt-[calc(var(--blend)+1.25rem)] md:pb-24 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 grid gap-4 md:mb-12 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="mb-3 text-sm tracking-[0.04em] text-gold">{t("kicker")}</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] font-light text-balance text-ivory-strong">
              {t("title")}
            </h2>
          </div>
          <p className="max-w-xl text-base text-foreground-muted md:text-lg">{t("intro")}</p>
        </Reveal>

        {/* Title → description → photo → link; on desktop the rows line up across the columns. */}
        <ul className="grid grid-cols-1 border-t border-white/12 md:grid-cols-3">
          {SERVICES.map(({ key, page, image }) => (
            <li
              key={key}
              className="group relative flex flex-col border-b border-white/12 py-7 md:row-span-4 md:grid md:grid-rows-subgrid md:gap-0 md:border-b-0 md:border-l md:border-white/12 md:px-7 md:py-8 md:first:border-l-0"
            >
              <h3 className="font-display text-2xl font-normal text-ivory-strong md:text-[1.75rem]">
                <Link
                  href={servicePath(page, locale)}
                  // The whole column is clickable; the title link stretches over it.
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                >
                  {t(`items.${key}.title`)}
                </Link>
              </h3>
              <p className="mt-3 text-base text-foreground-muted">{t(`items.${key}.body`)}</p>
              <div className="mt-5 aspect-[4/3] self-start overflow-hidden rounded-xl border border-white/10 bg-[#0d080b] group-focus-within:ring-2 group-focus-within:ring-gold/60">
                <SitePicture
                  name={image}
                  alt={t(`items.${key}.imageAlt`)}
                  sizes="(min-width: 1152px) 360px, (min-width: 768px) 30vw, 92vw"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
                />
              </div>
              <span
                className="mt-5 inline-flex items-center gap-2 text-base text-ivory underline-offset-[5px] group-hover:text-gold group-hover:underline"
                aria-hidden
              >
                {t(`items.${key}.cta`)}{" "}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            href={pagePath("hub", locale)}
            className="inline-flex items-center gap-2 py-2 text-base text-gold underline-offset-[6px] hover:text-ivory-strong hover:underline focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none"
          >
            {t("allServices")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
