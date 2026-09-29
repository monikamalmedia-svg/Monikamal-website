import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PortfolioGrid } from "@/components/CommercialPortfolio";
import { ContactSection } from "@/components/ContactSection";
import type { HomePortfolioItem } from "@/components/HomeMain";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { Link } from "@/i18n/navigation";
import {
  SERVICE_KEYS,
  SERVICES,
  pagePath,
  servicePath,
  type Locale,
  type ServiceKey,
} from "@/lib/services";

const AUDIENCE = ["one", "two", "three", "four"] as const;
const STEPS = ["one", "two", "three", "four"] as const;
const FAQ = ["one", "two", "three"] as const;
const VIDEO_PACKAGES = ["starter", "growth", "partnership"] as const;
const PHOTO_PACKAGES = ["five", "ten"] as const;
const MAX_EXAMPLES = 6;

const sectionClass = "relative z-20 px-6 md:px-10 lg:px-12";
const kickerClass = "mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm";
const h2Class =
  "font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-tight text-balance text-foreground";
const textLinkClass =
  "inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";

export async function ServicePage({
  service,
  locale,
  portfolioItems,
  socialUrl,
}: {
  service: ServiceKey;
  locale: Locale;
  portfolioItems: HomePortfolioItem[];
  /** Where Monika shares UGC (TikTok) — used when the portfolio has no items of this type. */
  socialUrl: string;
}) {
  const t = await getTranslations(`ServicePages.${service}`);
  const common = await getTranslations("ServicePages.common");
  const pricing = await getTranslations("Pricing");
  const photo = await getTranslations("Photography");
  const all = await getTranslations("ServicePages");
  const hub = await getTranslations("Hub");

  const examples = portfolioItems
    .filter((item) => item.contentType === SERVICES[service].contentType)
    .slice(0, MAX_EXAMPLES);
  const cases = portfolioItems.filter(
    (item) => item.caseSlug && item.contentType === SERVICES[service].contentType,
  );
  const related = SERVICE_KEYS.filter((key) => key !== service);

  return (
    <main className="relative z-20 flex-1">
      {/* Hero */}
      <section className={`${sectionClass} pt-28 pb-16 md:pt-36 md:pb-24`}>
        <div className="mx-auto max-w-6xl">
          <nav aria-label={common("breadcrumbLabel")} className="mb-10 text-xs text-foreground-muted">
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
          <p className={kickerClass}>{t("hero.kicker")}</p>
          <h1 className="font-display max-w-4xl text-[clamp(2.5rem,6.5vw,5rem)] leading-[1] font-medium tracking-tight text-balance text-foreground">
            {keepEcommerce(t("hero.title"))}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-xl">
            {t("hero.intro")}
          </p>
          <div className="mt-9 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#gratis-demo"
              className="rounded-full border border-gold/40 bg-[#1a0f16]/40 px-8 py-3.5 text-center text-sm font-medium tracking-wide text-gold uppercase backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/10 sm:px-9"
            >
              {common("demoCta")}
            </a>
            <a
              href="#voorbeelden"
              className="rounded-full border border-gold/25 px-8 py-3.5 text-center text-sm font-medium tracking-wide text-stone-200 uppercase transition-[border-color,color] duration-300 hover:border-gold/70 hover:text-gold sm:px-9"
            >
              {common("examplesCta")}
            </a>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto grid max-w-6xl gap-8 border-t border-glass-border pt-12 md:pt-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <h2 className={h2Class}>{t("context.title")}</h2>
          <div className="space-y-4 text-base leading-relaxed text-foreground-muted md:text-lg">
            <p>{t("context.body1")}</p>
            <p>{t("context.body2")}</p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-6xl">
          <h2 className={h2Class}>{t("audience.title")}</h2>
          <ul className="mt-8 grid grid-cols-1 gap-x-10 md:grid-cols-2">
            {AUDIENCE.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border-t border-glass-border py-5 text-base leading-relaxed text-foreground"
              >
                <Check className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0">{t(`audience.items.${item}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-6xl">
          <h2 className={h2Class}>{t("benefits.title")}</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {STEPS.map((item) => (
              <article
                key={item}
                className="rounded-2xl border border-glass-border bg-graphite p-6 md:p-8"
              >
                <h3 className="font-display text-2xl font-medium tracking-tight text-foreground">
                  {t(`benefits.items.${item}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted md:text-base">
                  {t(`benefits.items.${item}.body`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="voorbeelden" className={`${sectionClass} scroll-mt-24 py-12 md:py-16`}>
        <div className="mx-auto max-w-6xl">
          <h2 className={h2Class}>{t("examples.title")}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-lg">
            {t("examples.intro")}
          </p>
          {examples.length > 0 ? (
            <div className="mt-10">
              <PortfolioGrid items={examples} />
              {cases.length > 0 ? (
                <div className="mt-12">
                  <h3 className="font-display text-2xl font-medium tracking-tight text-foreground">
                    {common("casesTitle")}
                  </h3>
                  <ul className="mt-4 grid grid-cols-1 gap-x-8 md:grid-cols-2">
                    {cases.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/portfolio/${item.caseSlug}`}
                          className="flex items-baseline justify-between gap-4 border-t border-glass-border py-4 text-foreground transition-colors hover:text-gold"
                        >
                          <span className="font-display text-xl">{item.title}</span>
                          <span aria-hidden>→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
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
          ) : (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <a href={socialUrl} target="_blank" rel="noopener noreferrer" className={textLinkClass}>
                {t("examples.social")} <span aria-hidden>↗</span>
              </a>
              <a href="#gratis-demo" className={textLinkClass}>
                {common("demoCta")} <span aria-hidden>→</span>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-6xl">
          <h2 className={h2Class}>{t("process.title")}</h2>
          <ol className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step} className="border-t border-glass-border py-6">
                <span aria-hidden className="font-display text-2xl leading-none font-medium text-gold/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-3 text-xl font-medium tracking-tight text-foreground">
                  {t(`process.steps.${step}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {t(`process.steps.${step}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing reference */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto grid max-w-6xl gap-8 rounded-2xl border border-glass-border bg-graphite p-6 md:p-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className={h2Class}>{t("pricing.title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-foreground-muted md:text-lg">
              {t("pricing.body")}
            </p>
            <div className="mt-6">
              <Link href="/#pricing" className={textLinkClass}>
                {common("allPackages")} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <div className="space-y-8">
            <ul>
              {VIDEO_PACKAGES.map((key) => {
                const period = pricing.has(`packages.${key}.period`)
                  ? ` ${pricing(`packages.${key}.period`)}`
                  : "";
                return (
                  <li
                    key={key}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-glass-border py-4"
                  >
                    <span className="font-display text-xl text-foreground">
                      {pricing(`packages.${key}.name`)}
                    </span>
                    <span className="text-sm text-foreground-muted">
                      <span className="font-display text-2xl text-foreground">
                        {pricing(`packages.${key}.price`)}
                      </span>
                      {period}
                      <span className="ml-2 text-xs">
                        ({common("introPrice")}, {common("regularPrice")}{" "}
                        <s>{pricing(`packages.${key}.oldPrice`)}</s>)
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {service === "product" ? (
              <div>
                <p className="mb-2 text-xs tracking-[0.2em] text-gold/80 uppercase">
                  {t("pricing.photoTitle")}
                </p>
                <ul>
                  {PHOTO_PACKAGES.map((key) => (
                    <li
                      key={key}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-glass-border py-4"
                    >
                      <span className="font-display text-xl text-foreground">
                        {photo(`packages.${key}.name`)}
                      </span>
                      <span className="text-sm text-foreground-muted">
                        <span className="font-display text-2xl text-foreground">
                          {photo(`packages.${key}.price`)}
                        </span>{" "}
                        · {photo(`packages.${key}.perPhoto`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* FAQ — visible to users; no FAQPage markup (Google limits those results to gov/health sites). */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-3xl">
          <h2 className={h2Class}>{common("faqTitle")}</h2>
          <div className="mt-8 border-b border-glass-border">
            {FAQ.map((item) => (
              <details key={item} className="group border-t border-glass-border">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-base font-medium text-foreground transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none md:text-lg [&::-webkit-details-marker]:hidden">
                  {t(`faq.${item}.q`)}
                  <span
                    aria-hidden
                    className="mt-1 text-gold transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-6 text-sm leading-relaxed text-foreground-muted md:text-base">
                  {t(`faq.${item}.a`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Demo form (same component and backend as the homepage) */}
      <div id="gratis-demo" className="scroll-mt-24">
        <ContactSection defaultContentType={SERVICES[service].demoContentType} />
      </div>

      {/* Internal links */}
      <section className={`${sectionClass} pb-24 md:pb-32`}>
        <div className="mx-auto max-w-6xl border-t border-glass-border pt-12">
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {common("relatedTitle")}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {related.map((key) => (
              <Link
                key={key}
                href={servicePath(key, locale)}
                className="group rounded-2xl border border-glass-border bg-graphite p-6 transition-colors duration-300 hover:border-gold/40 md:p-8"
              >
                <span className="font-display text-2xl font-medium tracking-tight text-foreground">
                  {all(`${key}.breadcrumb`)}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-foreground-muted">
                  {all(`${key}.meta.description`)}
                </span>
                <span className={`${textLinkClass} mt-5`}>
                  {common("more")} <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/about" className={textLinkClass}>
              {common("aboutLink")} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
