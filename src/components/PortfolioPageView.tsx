import { getTranslations } from "next-intl/server";
import { CommercialPortfolio } from "@/components/CommercialPortfolio";
import { ContactSection } from "@/components/ContactSection";
import type { HomePortfolioItem } from "@/components/HomeMain";
import { JsonLd } from "@/components/JsonLd";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { Link } from "@/i18n/navigation";
import { absoluteUrl } from "@/lib/seo";
import { pagePath, type Locale } from "@/lib/services";
import { breadcrumbJsonLd } from "@/lib/structured-data";

const textLinkClass =
  "inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";

/**
 * Full portfolio archive with filters (/portfolio). Also rendered by /projects/[slug] for a
 * portfolio video without a case page, with that video opened on load.
 */
export async function PortfolioPageView({
  locale,
  items,
  initialProjectSlug,
}: {
  locale: Locale;
  items: HomePortfolioItem[];
  initialProjectSlug?: string;
}) {
  const [t, common] = await Promise.all([
    getTranslations("PortfolioPage"),
    getTranslations("ServicePages.common"),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: absoluteUrl(locale, "/") },
          { name: t("breadcrumb"), url: absoluteUrl(locale, "/portfolio") },
        ])}
      />
      <main data-page="portfolio" className="relative z-20 flex-1">
        <section className="relative z-20 px-6 pt-28 md:px-10 md:pt-36 lg:px-12">
          <div className="mx-auto max-w-7xl">
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
            <h1 className="font-display max-w-4xl text-[clamp(2.5rem,6.5vw,5rem)] leading-[1] font-medium tracking-tight text-balance text-foreground">
              {keepEcommerce(t("title"))}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-xl">
              {t("intro")}
            </p>
          </div>
        </section>

        <CommercialPortfolio items={items} initialProjectSlug={initialProjectSlug} />

        <section className="relative z-20 px-6 md:px-10 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 border-t border-glass-border pt-8 sm:flex-row sm:flex-wrap sm:gap-8">
            <Link href={pagePath("hub", locale)} className={textLinkClass}>
              {t("servicesLink")} <span aria-hidden>→</span>
            </Link>
            <Link href={pagePath("howItWorks", locale)} className={textLinkClass}>
              {t("processLink")} <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <div id="gratis-demo" className="scroll-mt-24">
          <ContactSection />
        </div>
      </main>
    </>
  );
}
