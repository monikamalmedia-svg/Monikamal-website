import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PortfolioGrid } from "@/components/CommercialPortfolio";
import { ContactSection } from "@/components/ContactSection";
import type { HomePortfolioItem } from "@/components/HomeMain";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { Link } from "@/i18n/navigation";
import { SERVICE_KEYS, SERVICES, pagePath, servicePath, type Locale } from "@/lib/services";

const BEST_FOR = ["one", "two", "three"] as const;
const EXAMPLES_PER_SERVICE = 3;

const sectionClass = "relative z-20 px-6 md:px-10 lg:px-12";
const kickerClass = "mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm";
const h2Class =
  "font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-tight text-balance text-foreground";
const textLinkClass =
  "inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";

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

  const curated = [...portfolioItems].sort(
    (a, b) => (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity),
  );

  return (
    <main className="relative z-20 flex-1">
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
          <h1 className="font-display max-w-4xl text-[clamp(2.5rem,6.5vw,5rem)] leading-[1] font-medium tracking-tight text-balance text-foreground">
            {keepEcommerce(t("title"))}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-xl">
            {t("intro")}
          </p>
          <div className="mt-9 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#gratis-demo"
              className="rounded-full border border-gold/40 bg-[#1a0f16]/40 px-8 py-3.5 text-center text-sm font-medium tracking-wide text-gold uppercase backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/10 sm:px-9"
            >
              {common("demoCta")}
            </a>
            <Link
              href="/portfolio"
              className="rounded-full border border-gold/25 px-8 py-3.5 text-center text-sm font-medium tracking-wide text-stone-200 uppercase transition-[border-color,color] duration-300 hover:border-gold/70 hover:text-gold sm:px-9"
            >
              {t("allWork")}
            </Link>
          </div>
        </div>
      </section>

      {SERVICE_KEYS.map((key, index) => {
        const examples = curated
          .filter((item) => item.contentType === SERVICES[key].contentType)
          .slice(0, EXAMPLES_PER_SERVICE);
        return (
          <section key={key} id={`dienst-${key}`} className={`${sectionClass} scroll-mt-24 py-12 md:py-16`}>
            <div className="mx-auto max-w-6xl border-t border-glass-border pt-12 md:pt-16">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                <div>
                  <p className={kickerClass}>
                    {String(index + 1).padStart(2, "0")} · {t(`sections.${key}.kicker`)}
                  </p>
                  <h2 className={h2Class}>{t(`sections.${key}.title`)}</h2>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
                    {t(`sections.${key}.body`)}
                  </p>
                  <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
                    <Link href={servicePath(key, locale)} className={textLinkClass}>
                      {t(`sections.${key}.link`)} <span aria-hidden>→</span>
                    </Link>
                    <a href="#gratis-demo" className={textLinkClass}>
                      {common("demoCta")} <span aria-hidden>→</span>
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs tracking-[0.2em] text-foreground-muted uppercase">{t("bestFor")}</h3>
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

      <div id="gratis-demo" className="scroll-mt-24">
        <ContactSection />
      </div>

      <section className={`${sectionClass} pb-24 md:pb-32`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-1 border-t border-glass-border pt-10 sm:flex-row sm:flex-wrap sm:gap-8">
          <Link href={pagePath("howItWorks", locale)} className={textLinkClass}>
            {t("links.process")} <span aria-hidden>→</span>
          </Link>
          <Link href="/portfolio" className={textLinkClass}>
            {t("allWork")} <span aria-hidden>→</span>
          </Link>
          <Link href="/about" className={textLinkClass}>
            {common("aboutLink")} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
