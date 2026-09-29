import { getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/ContactSection";
import type { HomePortfolioItem } from "@/components/HomeMain";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { Link } from "@/i18n/navigation";
import { sizedImageUrl } from "@/lib/sanity-media";
import type { LocalizedCase } from "@/lib/cases";
import { conceptLabelKey } from "@/lib/portfolio";
import {
  SERVICES,
  serviceForContentType,
  servicePath,
  type Locale,
} from "@/lib/services";

const TYPE_LABEL_KEYS = {
  ugc: "typeUgc",
  aiCommercial: "typeAiCommercial",
  productContent: "typeProductContent",
} as const;

const sectionClass = "relative z-20 px-6 md:px-10 lg:px-12";
const h2Class =
  "font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] font-medium tracking-tight text-foreground";
const textLinkClass =
  "inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline";

/** H1 fallback when no descriptive title is set in the CMS: "<brand> — <content type>". */
export async function caseHeading(item: HomePortfolioItem, data: LocalizedCase) {
  const portfolio = await getTranslations("Portfolio");
  return data.caseTitle ?? `${item.title} — ${portfolio(TYPE_LABEL_KEYS[item.contentType])}`;
}

export async function CasePage({
  item,
  data,
  locale,
  otherCases,
}: {
  item: HomePortfolioItem;
  data: LocalizedCase;
  locale: Locale;
  /** Other published cases, for internal links. */
  otherCases: HomePortfolioItem[];
}) {
  const t = await getTranslations("CasePage");
  const portfolio = await getTranslations("Portfolio");
  const services = await getTranslations("ServicePages");
  const serviceKey = serviceForContentType(item.contentType);
  const heading = await caseHeading(item, data);
  const isConcept = item.projectType === "concept";
  const conceptLabel = portfolio(conceptLabelKey(item.contentType));
  const isVideo = item.mediaType === "video" && Boolean(item.videoUrl);

  const facts = [
    { label: t("facts.contentType"), value: portfolio(TYPE_LABEL_KEYS[item.contentType]) },
    { label: t("facts.industry"), value: data.industry },
    { label: t("facts.format"), value: item.format || null },
    {
      label: t("facts.platform"),
      value: data.platforms.map((key) => t(`platforms.${key}`)).join(", ") || null,
    },
    { label: t("facts.year"), value: item.year || null },
    {
      label: t("facts.project"),
      value: isConcept ? t("independentProject") : item.projectType === "client" ? t("clientWork") : null,
    },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  return (
    <main className="relative z-20 flex-1">
      {/* Hero */}
      <section className={`${sectionClass} pt-28 pb-12 md:pt-36 md:pb-20`}>
        <div className="mx-auto max-w-6xl">
          <nav aria-label={services("common.breadcrumbLabel")} className="mb-10 text-xs text-foreground-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="inline-block py-1 transition-colors hover:text-gold">
                  {services("common.home")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/portfolio" className="inline-block py-1 transition-colors hover:text-gold">
                  {t("breadcrumbPortfolio")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground">
                {item.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <div>
              <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
                {data.eyebrow ?? portfolio(TYPE_LABEL_KEYS[item.contentType])}
              </p>
              <h1 className="font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.02] font-medium tracking-tight text-balance text-foreground">
                {heading}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-muted md:text-lg">
                {data.summary}
              </p>

              {isConcept ? (
                <div className="mt-6 max-w-xl rounded-xl border border-glass-border bg-graphite/70 px-5 py-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">
                    {conceptLabel}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{t("conceptNote")}</p>
                </div>
              ) : null}

              {facts.length > 0 ? (
                <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 border-t border-glass-border sm:grid-cols-3">
                  {facts.map((fact) => (
                    <div key={fact.label} className="border-b border-glass-border py-4">
                      <dt className="text-[10px] tracking-[0.18em] text-foreground-muted uppercase">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            <figure className="mx-auto w-full max-w-sm lg:max-w-none">
              <div
                className={`relative w-full overflow-hidden rounded-2xl border border-glass-border bg-[#0d0509] ${
                  isVideo ? "aspect-[9/16]" : ""
                }`}
              >
                {isVideo && item.videoUrl ? (
                  <ProtectedVideo
                    src={item.videoUrl}
                    poster={sizedImageUrl(item.imageUrl, 900) || undefined}
                    controls
                    allowFullscreen
                    playsInline
                    // Poster first; the file loads when the visitor presses play.
                    preload="none"
                    aria-label={heading}
                    className="h-full w-full object-cover"
                  />
                ) : item.imageUrl ? (
                  <ProtectedImage src={sizedImageUrl(item.imageUrl, 1200)} alt={heading} className="h-auto w-full" />
                ) : null}
              </div>
              <figcaption className="mt-3 text-xs text-foreground-muted">{t("sections.finalWork")}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-3xl space-y-12">
          <div>
            <h2 className={h2Class}>{t("sections.concept")}</h2>
            <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-foreground-muted md:text-lg">
              {data.concept}
            </p>
          </div>
          {data.visual ? (
            <div>
              <h2 className={h2Class}>{t("sections.visual")}</h2>
              <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-foreground-muted md:text-lg">
                {data.visual}
              </p>
            </div>
          ) : null}
          {data.objective ? (
            <div>
              <h2 className={h2Class}>{t("sections.objective")}</h2>
              <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-foreground-muted md:text-lg">
                {data.objective}
              </p>
            </div>
          ) : null}
          <div>
            <h2 className={h2Class}>{t("sections.approach")}</h2>
            <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-foreground-muted md:text-lg">
              {data.approach}
            </p>
          </div>
          {data.deliverables.length > 0 ? (
            <div>
              <h2 className={h2Class}>{t("sections.deliverables")}</h2>
              <ul className="mt-4 border-b border-glass-border">
                {data.deliverables.map((deliverable) => (
                  <li key={deliverable} className="border-t border-glass-border py-3 text-base text-foreground">
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* Relevant service */}
      <section className={`${sectionClass} py-12 md:py-16`}>
        <div className="mx-auto max-w-6xl">
          <Link
            href={servicePath(serviceKey, locale)}
            className="block rounded-2xl border border-glass-border bg-graphite p-6 transition-colors duration-300 hover:border-gold/40 md:p-10"
          >
            <span className="text-xs tracking-[0.28em] text-gold uppercase">{t("service.title")}</span>
            <span className="font-display mt-3 block text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              {services(`${serviceKey}.breadcrumb`)}
            </span>
            <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-foreground-muted md:text-base">
              {services(`${serviceKey}.meta.description`)}
            </span>
            <span className={`${textLinkClass} mt-5`}>
              {t("service.cta")} <span aria-hidden>→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={`${sectionClass} pb-4`}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 border-t border-glass-border pt-12 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {t("closing.title")}
          </h2>
          <a
            href="#gratis-demo"
            className="rounded-full border border-gold/50 px-7 py-3 text-xs font-medium tracking-widest text-gold uppercase transition-colors hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
          >
            {t("closing.cta")}
          </a>
        </div>
      </section>

      {/* Demo */}
      <div id="gratis-demo" className="scroll-mt-24">
        <ContactSection defaultContentType={SERVICES[serviceKey].demoContentType} />
      </div>

      {/* More cases */}
      <section className={`${sectionClass} pb-24 md:pb-32`}>
        <div className="mx-auto max-w-6xl border-t border-glass-border pt-12">
          {otherCases.length > 0 ? (
            <>
              <h2 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                {t("more.title")}
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {otherCases.map((other) => (
                  <li key={other.id}>
                    <Link
                      href={`/portfolio/${other.caseSlug}`}
                      className="flex items-baseline justify-between gap-4 border-t border-glass-border py-4 text-foreground transition-colors hover:text-gold"
                    >
                      <span className="font-display text-xl">{other.title}</span>
                      <span className="text-xs tracking-[0.16em] text-foreground-muted uppercase">
                        {portfolio(TYPE_LABEL_KEYS[other.contentType])}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="mt-8">
            <Link href="/portfolio" className={textLinkClass}>
              {t("more.portfolio")} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
