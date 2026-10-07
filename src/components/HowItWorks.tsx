import { getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/ContactSection";
import { ProcessSteps } from "@/components/ProcessSteps";
import { Link } from "@/i18n/navigation";

const FAQ = ["turnaround", "product", "ads", "revisions", "payment"] as const;

const sectionClass = "relative z-20 px-6 md:px-10 lg:px-12";

/** Werkwijze / How I Work (/nl/werkwijze, /en/how-i-work): the process as an editorial story. */
export async function HowItWorks() {
  const t = await getTranslations("HowItWorks");
  const common = await getTranslations("ServicePages.common");
  const faq = await getTranslations("Faq");

  return (
    <main data-page="process" data-nav-caption="howItWorks" className="relative z-20 flex-1">
      {/* Hero */}
      <section className={`${sectionClass} pt-32 pb-10 md:pt-40 md:pb-14`}>
        <div className="mx-auto max-w-6xl">
          <nav aria-label={common("breadcrumbLabel")} className="mb-8 text-sm text-foreground-muted">
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
          <p className="mb-3 text-sm tracking-[0.04em] text-gold">{t("kicker")}</p>
          <h1 className="font-display max-w-3xl text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] font-light tracking-tight text-balance text-ivory-strong">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ivory">{t("intro")}</p>
        </div>
      </section>

      {/* The same three steps as on the homepage, with a little more detail. */}
      <ProcessSteps variant="page" />

      {/* FAQ */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-3xl border-t border-glass-border pt-12">
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] font-light text-foreground">
            {t("faqTitle")}
          </h2>
          <div className="mt-6 border-b border-glass-border">
            {FAQ.map((item) => (
              <details key={item} className="group border-t border-glass-border">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-lg text-foreground transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {faq(`items.${item}.question`)}
                  <span aria-hidden className="mt-1 text-gold transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-6 text-base text-foreground-muted">
                  {faq.rich(`items.${item}.answer`, {
                    hl: (chunks) => <span className="text-foreground">{chunks}</span>,
                  })}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={`${sectionClass} pt-6 pb-2`}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 border-t border-glass-border pt-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-light tracking-tight text-foreground md:text-4xl">
              {t("closing.title")}
            </h2>
            <p className="mt-2 text-base text-foreground-muted">{common("contactNote")}</p>
          </div>
          <a
            href="#kennismaking"
            className="shrink-0 rounded-full border border-gold/45 bg-white/[0.03] px-8 py-3.5 text-center text-base text-gold transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
          >
            {t("closing.cta")}
          </a>
        </div>
      </section>

      <div id="kennismaking" className="scroll-mt-24">
        <ContactSection />
      </div>
    </main>
  );
}
