import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CommercialPortfolio } from "@/components/CommercialPortfolio";
import { ContactSection } from "@/components/ContactSection";
import { JsonLd } from "@/components/JsonLd";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { loadPortfolioItems } from "@/lib/home-page";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { pagePath, type Locale } from "@/lib/services";
import { breadcrumbJsonLd } from "@/lib/structured-data";

type Props = {
  params: Promise<{ locale: string }>;
};

const textLinkClass =
  "inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "PortfolioPage" });
  return pageMetadata({
    locale,
    paths: { en: "/portfolio", nl: "/portfolio" },
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

/** Full portfolio archive with filters; the homepage only shows a selection. */
export default async function PortfolioIndexPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const [t, common, items] = await Promise.all([
    getTranslations("PortfolioPage"),
    getTranslations("ServicePages.common"),
    loadPortfolioItems(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: absoluteUrl(locale, "/") },
          { name: t("breadcrumb"), url: absoluteUrl(locale, "/portfolio") },
        ])}
      />
      <main className="relative z-20 flex-1">
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

        <CommercialPortfolio items={items} />

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
