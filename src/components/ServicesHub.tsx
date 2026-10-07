import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PortfolioGrid } from "@/components/CommercialPortfolio";
import { ContactSection } from "@/components/ContactSection";
import { PageLinks } from "@/components/PageLinks";
import type { HomePortfolioItem } from "@/components/HomeMain";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { Link } from "@/i18n/navigation";
import { SERVICE_KEYS, SERVICES, servicePath, type Locale } from "@/lib/services";

const BEST_FOR = ["one", "two", "three"] as const;
const EXAMPLES_PER_SERVICE = 3;

const sectionClass = "relative z-20 px-6 md:px-10 lg:px-12";
const kickerClass = "mb-3 text-sm tracking-[0.04em] text-gold";
const h2Class =
  "font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-light tracking-tight text-balance text-foreground";
const textLinkClass =
  "inline-flex items-center gap-2 py-2 text-base text-gold underline-offset-[6px] transition-colors duration-300 hover:text-ivory-strong hover:underline";

/** Services hub (/nl/diensten, /en/services): the overall offer, one section per service. */
export async function ServicesHub({
  locale,
  portfolioItems,
}: {
  locale: Locale;
  portfolioItems: HomePortfolioItem[];
}) {
  const t = await getTranslations("Hub");
  const common = await getTranslations("ServicePages.common");

  return (
    <main data-page="services" data-nav-caption="hub" className="relative z-20 flex-1">
      <section className={`${sectionClass} pt-28 pb-12 md:pt-36 md:pb-16`}>
        <div className="mx-auto max-w-6xl">
          <nav aria-label={common("breadcrumbLabel")} className="mb-10 text-xs text-foreground-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="inline-block py-1 transition-colors hover:text-gold">
                  {common("home")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground">
                {t("breadcrumb")}
              </li>
            </ol>
          </nav>
          <p className={kickerClass}>{t("kicker")}</p>
          <h1 className="font-display max-w-4xl text-[clamp(2.5rem,6.5vw,5rem)] leading-[1] font-light tracking-tight text-balance text-foreground">
            {keepEcommerce(t("title"))}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-xl">
            {t("intro")}
          </p>
          <div className="mt-9 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#kennismaking"
              className="rounded-full border border-gold/40 bg-white/[0.03] inline-flex h-12 items-center justify-center px-7 text-center text-base text-gold backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/10 sm:px-9"
            >
              {common("contactCta")}
            </a>
            <Link
              href="/portfolio"
              className="rounded-full border border-gold/25 inline-flex h-12 items-center justify-center px-7 text-center text-base text-ivory transition-[border-color,color] duration-300 hover:border-gold/70 hover:text-gold sm:px-9"
            >
              {t("allWork")}
            </Link>
          </div>
        </div>
      </section>

      {SERVICE_KEYS.map((key, index) => {
        const examples = portfolioItems
          .filter((item) => item.contentType === SERVICES[key].contentType)
          .slice(0, EXAMPLES_PER_SERVICE);
        return (
          <section key={key} id={`dienst-${key}`} className={`${sectionClass} band ${index % 2 === 0 ? "band-plum" : "band-pine"} scroll-mt-24 py-12 md:py-16`}>
            <div className="mx-auto max-w-6xl pt-6 md:pt-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                <div>
                  <p className={kickerClass}>
                    {t(`sections.${key}.kicker`)}
                  </p>
                  <h2 className={h2Class}>{t(`sections.${key}.title`)}</h2>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
                    {t(`sections.${key}.body`)}
                  </p>
                  <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
                    <Link href={servicePath(key, locale)} className={textLinkClass}>
                      {t(`sections.${key}.link`)} <span aria-hidden>→</span>
                    </Link>
                    <a href="#kennismaking" data-contact-service={SERVICES[key].formContentType} className={textLinkClass}>
                      {common("contactCta")} <span aria-hidden>→</span>
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm tracking-[0.04em] text-foreground-muted">{t("bestFor")}</h3>
                  <ul className="mt-3 border-b border-glass-border">
                    {BEST_FOR.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 border-t border-glass-border py-4 text-sm leading-relaxed text-foreground md:text-base"
                      >
                        <Check className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                        <span className="min-w-0">{t(`sections.${key}.bestFor.${item}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {examples.length > 0 ? (
                <div className="mt-10">
                  <PortfolioGrid items={examples} />
                </div>
              ) : null}
            </div>
          </section>
        );
      })}

      <PageLinks items={["process", "work", "about"]} />

      <div id="kennismaking" className="scroll-mt-24">
        <ContactSection />
      </div>

    </main>
  );
}
