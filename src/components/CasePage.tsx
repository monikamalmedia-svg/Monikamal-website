import { getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/ContactSection";
import type { HomePortfolioItem } from "@/components/HomeMain";
import { ProtectedImage } from "@/components/ProtectedImage";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { Reveal } from "@/components/Reveal";
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
/** Story rows: small section label left, readable text right (~60 characters per line). */
const rowClass =
  "grid gap-3 border-t border-glass-border py-8 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:gap-12 md:py-10";
const rowLabelClass = "text-sm tracking-[0.04em] text-gold md:pt-1.5";
const rowTextClass = "max-w-[60ch] text-base leading-[1.7] whitespace-pre-line text-ivory md:text-lg";
const textLinkClass =
  "inline-flex items-center gap-2 py-2 text-base text-gold underline-offset-[6px] transition-colors duration-300 hover:text-ivory-strong hover:underline";

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
  nextCase,
}: {
  item: HomePortfolioItem;
  data: LocalizedCase;
  locale: Locale;
  /** Other published cases, for internal links. */
  otherCases: HomePortfolioItem[];
  /** Next case in portfolio order. */
  nextCase: HomePortfolioItem | null;
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
    <main data-page="case" data-nav-caption-text={item.title} className="relative z-20 flex-1">
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
              <p className="mb-4 text-sm tracking-[0.06em] text-gold uppercase">
                {data.eyebrow ?? portfolio(TYPE_LABEL_KEYS[item.contentType])}
              </p>
              <h1 className="font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.02] font-light tracking-tight text-balance text-ivory-strong">
                {heading}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-[1.7] text-ivory md:text-lg">{data.summary}</p>

              {/* The one concept note on the page; a case-specific disclaimer replaces the generic line. */}
              {isConcept ? (
                <div className="mt-6 max-w-xl rounded-xl border border-glass-border bg-graphite/70 px-5 py-4">
                  <p className="text-sm text-gold">
                    {conceptLabel}
                  </p>
                  <p className="mt-1 text-base text-ivory">{data.disclaimer ?? t("conceptNote")}</p>
                </div>
              ) : null}

              {facts.length > 0 ? (
                <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 border-t border-glass-border sm:grid-cols-3">
                  {facts.map((fact) => (
                    <div key={fact.label} className="border-b border-glass-border py-4">
                      <dt className="text-xs tracking-[0.12em] text-foreground-muted uppercase">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-base text-ivory-strong">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            <figure className="mx-auto w-full max-w-sm lg:mr-0 lg:max-w-[440px]">
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

      {/* Stills: three columns on desktop, a swipeable strip on mobile (full 9:16 frames, no crop). */}
      {data.stills.length > 0 ? (
        <section className={`${sectionClass} pb-2`} aria-label={t("sections.stills")}>
          <Reveal className="mx-auto max-w-5xl">
            <ul className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
              {data.stills.map((still, index) => (
                <li
                  key={still.url}
                  className="w-[68vw] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-xl border border-glass-border bg-[#0d0509] md:w-auto md:max-w-none"
                >
                  <ProtectedImage
                    src={sizedImageUrl(still.url, 720)}
                    alt={still.alt ?? `${heading} — ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[9/16] h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}

      {data.pullQuote ? (
        <section className={`${sectionClass} pt-14 pb-4 md:pt-20`}>
          <Reveal className="mx-auto max-w-5xl">
            <p className="font-display max-w-4xl text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.15] font-light text-balance text-ivory-strong">
              {data.pullQuote}
            </p>
          </Reveal>
        </section>
      ) : null}

      {/* Story */}
      <section className={`${sectionClass} py-10 md:py-14`}>
        <div className="mx-auto max-w-5xl border-b border-glass-border">
          {[
            { key: "concept", label: data.headings.concept ?? t("sections.concept"), text: data.concept },
            { key: "visual", label: data.headings.visual ?? t("sections.visual"), text: data.visual },
            { key: "objective", label: t("sections.objective"), text: data.objective },
            { key: "approach", label: t("sections.approach"), text: data.approach },
            { key: "result", label: data.headings.result ?? t("sections.result"), text: data.result },
          ]
            .filter((row): row is { key: string; label: string; text: string } => Boolean(row.text))
            .map((row) => (
              <Reveal key={row.key} className={rowClass}>
                <h2 className={rowLabelClass}>{row.label}</h2>
                <p className={rowTextClass}>{row.text}</p>
              </Reveal>
            ))}

          {data.deliverables.length > 0 ? (
            <Reveal className={rowClass}>
              <h2 className={rowLabelClass}>{t("sections.deliverables")}</h2>
              <ul className="max-w-[60ch] space-y-2 text-base text-ivory md:text-lg">
                {data.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {data.details.length > 0 || data.applications ? (
            <Reveal className={rowClass}>
              <h2 className={rowLabelClass}>{t("sections.details")}</h2>
              <div className="max-w-[60ch]">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {data.details
                    .filter((detail) => detail.label)
                    .map((detail) => (
                      <div key={detail.label}>
                        <dt className="text-sm text-foreground-muted">{detail.label}</dt>
                        <dd className="mt-0.5 text-base text-ivory-strong md:text-lg">{detail.value}</dd>
                      </div>
                    ))}
                </dl>
                {data.details
                  .filter((detail) => !detail.label)
                  .map((detail) => (
                    <p key={detail.value} className="mt-5 text-base text-ivory">
                      {detail.value}
                    </p>
                  ))}
                {data.applications ? <p className="mt-6 text-base text-ivory">{data.applications}</p> : null}
              </div>
            </Reveal>
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
            <span className="text-sm tracking-[0.04em] text-gold">{t("service.title")}</span>
            <span className="font-display mt-3 block text-2xl font-normal tracking-tight text-ivory-strong md:text-3xl">
              {services(`${serviceKey}.breadcrumb`)}
            </span>
            <span className="mt-2 block max-w-2xl text-base leading-relaxed text-ivory">
              {services(`${serviceKey}.meta.description`)}
            </span>
            <span className={`${textLinkClass} mt-5`}>
              {t("service.cta")} <span aria-hidden>→</span>
            </span>
          </Link>
        </div>
      </section>

      {nextCase?.caseSlug ? (
        <section className={`${sectionClass} pb-12 md:pb-16`}>
          <div className="mx-auto max-w-6xl">
            <Link
              href={`/portfolio/${nextCase.caseSlug}`}
              className="group flex items-center gap-5 border-t border-glass-border pt-8 transition-colors md:gap-8"
            >
              {nextCase.imageUrl ? (
                <ProtectedImage
                  src={sizedImageUrl(nextCase.imageUrl, 240)}
                  alt=""
                  loading="lazy"
                  className="aspect-[9/16] w-16 shrink-0 rounded-lg border border-glass-border object-cover md:w-20"
                />
              ) : null}
              <span className="min-w-0">
                <span className="block text-sm text-foreground-muted">{t("next")}</span>
                <span className="font-display mt-1 block text-2xl text-foreground transition-colors group-hover:text-gold md:text-3xl">
                  {nextCase.title} <span aria-hidden>→</span>
                </span>
                <span className="mt-1 block text-sm text-foreground-muted">
                  {portfolio(TYPE_LABEL_KEYS[nextCase.contentType])}
                </span>
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {/* More cases */}
      <section className={`${sectionClass} pb-10 md:pb-12`}>
        <div className="mx-auto max-w-6xl border-t border-glass-border pt-12">
          {otherCases.length > 0 ? (
            <>
              <h2 className="font-display text-2xl font-normal tracking-tight text-ivory-strong md:text-3xl">
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
                      <span className="text-sm text-foreground-muted">
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
      {/* Closing CTA */}
      <section className={`${sectionClass} pb-4`}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 border-t border-glass-border pt-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-normal tracking-tight text-ivory-strong md:text-3xl">
              {t("closing.title")}
            </h2>
            <p className="mt-2 text-base text-ivory">{t("closing.body")}</p>
          </div>
          <a
            href="#kennismaking"
            data-contact-service={SERVICES[serviceKey].formContentType}
            className="shrink-0 rounded-full border border-gold/50 px-7 py-3 text-base text-gold transition-colors hover:border-gold hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"
          >
            {t("closing.cta")}
          </a>
        </div>
      </section>

      {/* Intro-call form */}
      <div id="kennismaking" className="scroll-mt-24">
        <ContactSection defaultContentType={SERVICES[serviceKey].formContentType} />
      </div>

    </main>
  );
}
