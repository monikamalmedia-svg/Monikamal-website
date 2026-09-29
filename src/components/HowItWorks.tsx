import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/ContactSection";
import { Link } from "@/i18n/navigation";
import { pagePath, type Locale } from "@/lib/services";

// Same four steps as the homepage process (Pipeline) and the service pages.
const STEPS = ["intro", "concept", "production", "delivery"] as const;
const TIMELINE = ["starter", "growth", "partnership"] as const;
const NEEDS = ["product", "audience", "platform", "brand", "deadline"] as const;
const FAQ = ["ads", "payment", "product"] as const;

const sectionClass = "relative z-20 px-6 md:px-10 lg:px-12";
const kickerClass = "mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm";
const h2Class =
  "font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-tight text-balance text-foreground";
const textLinkClass =
  "inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";

/** "How it works" (/nl/werkwijze, /en/how-it-works). */
export async function HowItWorks({ locale }: { locale: Locale }) {
  const t = await getTranslations("HowItWorks");
  const common = await getTranslations("ServicePages.common");
  const pricing = await getTranslations("Pricing");
  const faq = await getTranslations("Faq");

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
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-xl">
            {t("intro")}
          </p>
          <div className="mt-9">
            <a
              href="#gratis-demo"
              className="inline-block rounded-full border border-gold/40 bg-[#1a0f16]/40 px-8 py-3.5 text-center text-sm font-medium tracking-wide text-gold uppercase backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-gold hover:bg-gold/10 sm:px-9"
            >
              {common("demoCta")}
            </a>
          </div>
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

      {/* Timelines + revisions */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto grid max-w-6xl gap-10 rounded-2xl border border-glass-border bg-graphite p-6 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 className={h2Class}>{t("timeline.title")}</h2>
            <ul className="mt-6 border-b border-glass-border">
              {TIMELINE.map((key) => (
                <li key={key} className="grid gap-1 border-t border-glass-border py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <span className="font-display text-xl text-foreground">{pricing(`packages.${key}.name`)}</span>
                  <span className="text-sm leading-relaxed text-foreground-muted md:text-base">
                    {t(`timeline.items.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-foreground-muted">{t("timeline.note")}</p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              {t("revisions.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground-muted">{t("revisions.body")}</p>
            <div className="mt-6">
              <Link href="/#pricing" className={textLinkClass}>
                {common("allPackages")} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What I need + formats */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className={h2Class}>{t("needs.title")}</h2>
            <ul className="mt-6 border-b border-glass-border">
              {NEEDS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t border-glass-border py-4 text-sm leading-relaxed text-foreground md:text-base"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0">{t(`needs.items.${item}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={h2Class}>{t("formats.title")}</h2>
            <p className="mt-5 text-base leading-relaxed text-foreground-muted md:text-lg">{t("formats.body1")}</p>
            <p className="mt-4 text-base leading-relaxed text-foreground-muted md:text-lg">{t("formats.body2")}</p>
          </div>
        </div>
      </section>

      {/* FAQ subset — same answers as the homepage FAQ */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-3xl">
          <h2 className={h2Class}>{common("faqTitle")}</h2>
          <div className="mt-8 border-b border-glass-border">
            {FAQ.map((item) => (
              <details key={item} className="group border-t border-glass-border">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-base font-medium text-foreground transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none md:text-lg [&::-webkit-details-marker]:hidden">
                  {faq(`items.${item}.question`)}
                  <span aria-hidden className="mt-1 text-gold transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-6 text-sm leading-relaxed text-foreground-muted md:text-base">
                  {faq.rich(`items.${item}.answer`, {
                    hl: (chunks) => <span className="text-foreground">{chunks}</span>,
                  })}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div id="gratis-demo" className="scroll-mt-24">
        <ContactSection />
      </div>

      <section className={`${sectionClass} pb-24 md:pb-32`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-1 border-t border-glass-border pt-10 sm:flex-row sm:flex-wrap sm:gap-8">
          <Link href={pagePath("hub", locale)} className={textLinkClass}>
            {t("links.services")} <span aria-hidden>→</span>
          </Link>
          <Link href="/portfolio" className={textLinkClass}>
            {t("links.work")} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
