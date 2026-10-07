import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PortfolioGrid } from "@/components/CommercialPortfolio";
import { ContactSection } from "@/components/ContactSection";
import { Pricing } from "@/components/Pricing";
import type { HomePortfolioItem } from "@/components/HomeMain";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { Link } from "@/i18n/navigation";
import { SERVICES, pagePath, type Locale, type ServiceKey } from "@/lib/services";

const USES = ["one", "two", "three"] as const;
const MAX_EXAMPLES = 6;

const sectionClass = "relative z-20 px-6 md:px-10 lg:px-12";
const h2Class =
  "font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-light tracking-tight text-balance text-foreground";
const textLinkClass =
  "inline-flex items-center gap-2 py-3 text-base text-gold underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";
const primaryButtonClass =
  "rounded-full border border-gold/45 bg-white/[0.03] px-8 py-3.5 text-center text-base text-gold backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none";

/**
 * Service page: a short hero, the relevant work first, one block on what you get and where you
 * use it, the packages (UGC, AI) or a tailored-proposal note (product photography), and a CTA.
 */
export async function ServicePage({
  service,
  locale,
  portfolioItems,
  socialUrl,
}: {
  service: ServiceKey;
  locale: Locale;
  portfolioItems: HomePortfolioItem[];
  /** Where Monika shares UGC (TikTok). */
  socialUrl: string;
}) {
  const t = await getTranslations(`ServicePages.${service}`);
  const common = await getTranslations("ServicePages.common");
  const hub = await getTranslations("Hub");

  const examples = portfolioItems
    .filter((item) => item.contentType === SERVICES[service].contentType)
    .slice(0, MAX_EXAMPLES);
  const contactLabel = service === "product" ? t("cta.button") : common("contactCta");

  return (
    <main data-page="service" data-nav-caption={service} className="relative z-20 flex-1">
      {/* Hero */}
      <section className={`${sectionClass} pt-28 pb-10 md:pt-36 md:pb-14`}>
        <div className="mx-auto max-w-6xl">
          <nav aria-label={common("breadcrumbLabel")} className="mb-8 text-sm text-foreground-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="inline-block py-1 transition-colors hover:text-gold">
                  {common("home")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={pagePath("hub", locale)} className="inline-block py-1 transition-colors hover:text-gold">
                  {hub("breadcrumb")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground">
                {t("breadcrumb")}
              </li>
            </ol>
          </nav>
          <p className="mb-3 text-sm tracking-[0.04em] text-gold">{t("hero.kicker")}</p>
          <h1 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-light tracking-tight text-balance text-foreground">
            {keepEcommerce(t("hero.title"))}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-foreground-muted md:text-xl">{t("hero.intro")}</p>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-6">
            <a href="#kennismaking" data-contact-service={SERVICES[service].formContentType} className={primaryButtonClass}>
              {contactLabel}
            </a>
            {examples.length > 0 ? (
              <a href="#voorbeelden" className={textLinkClass}>
                {common("examplesCta")} <span aria-hidden>↓</span>
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Work first */}
      <section id="voorbeelden" className={`${sectionClass} scroll-mt-24 py-8 md:py-12`}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
            <h2 className={h2Class}>{t("examples.title")}</h2>
            <p className="max-w-md text-base text-foreground-muted">{t("examples.intro")}</p>
          </div>
          {examples.length > 0 ? <PortfolioGrid items={examples} /> : null}
          <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/portfolio" className={textLinkClass}>
              {common("fullPortfolio")} <span aria-hidden>→</span>
            </Link>
            {service === "ugc" ? (
              <a href={socialUrl} target="_blank" rel="noopener noreferrer" className={textLinkClass}>
                {t("examples.social")} <span aria-hidden>↗</span>
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* What you get and where you use it */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto grid max-w-6xl gap-8 border-t border-glass-border pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <h2 className={h2Class}>{t("use.title")}</h2>
            {t.has("use.body") ? (
              <p className="mt-5 max-w-xl text-lg text-foreground-muted">{t("use.body")}</p>
            ) : null}
          </div>
          <div>
            {t.has("use.itemsTitle") ? (
              <p className="mb-2 text-sm tracking-[0.04em] text-gold">{t("use.itemsTitle")}</p>
            ) : null}
            <ul className="border-b border-glass-border">
              {USES.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t border-glass-border py-4 text-lg text-foreground"
                >
                  <Check className="mt-1.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0">{t(`use.items.${item}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Packages (UGC, AI) or a tailored proposal (product photography) */}
      {service === "ugc" ? <Pricing variant="ugc" /> : null}
      {service === "ai" ? <Pricing variant="video" heading={t("pricing.title")} intro={t("pricing.body")} /> : null}
      {service === "product" ? <Pricing variant="photo" /> : null}

      {/* Closing CTA */}
      <section className={`${sectionClass} pt-6 pb-2`}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 border-t border-glass-border pt-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-light tracking-tight text-foreground md:text-4xl">{t("cta.title")}</h2>
            <p className="mt-2 text-base text-foreground-muted">{common("contactNote")}</p>
          </div>
          <a href="#kennismaking" data-contact-service={SERVICES[service].formContentType} className={`${primaryButtonClass} shrink-0`}>
            {t("cta.button")}
          </a>
        </div>
      </section>

      {/* Intro-call form (same component and backend as the homepage) */}
      <div id="kennismaking" className="scroll-mt-24">
        <ContactSection defaultContentType={SERVICES[service].formContentType} />
      </div>
    </main>
  );
}
