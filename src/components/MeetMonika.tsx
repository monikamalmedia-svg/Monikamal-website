import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PortraitFrame } from "@/components/PortraitFrame";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";

const EXPECTATIONS = ["contact", "price", "concept", "personal", "delivery", "revisions"] as const;

/**
 * Over mij (burgundy-charcoal, faint plum glow): text left, portrait right (55/45, slightly offset). Mobile order:
 * heading → portrait → short story → link. Portrait = the local photo of Monika (SitePicture).
 */
export async function MeetMonika() {
  const t = await getTranslations("MeetMonika");

  return (
    <section
      data-nav-caption="about"
      id="over-mij"
      style={{ "--tone-from": "#101412" } as CSSProperties}
      className="tone tone-about z-20 scroll-mt-24 px-6 pt-[calc(var(--blend)+1rem)] pb-16 md:px-10 md:pt-[calc(var(--blend)+1.25rem)] md:pb-22 lg:px-12"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] lg:gap-x-20 lg:gap-y-0">
        <Reveal className="lg:col-start-1 lg:row-start-1">
          <p className="mb-3 text-sm tracking-[0.04em] text-gold">{t("kicker")}</p>
          <h2 className="font-display text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.02] font-light tracking-tight text-ivory-strong">
            {t("title")}
          </h2>
        </Reveal>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <PortraitFrame
            alt={t("portraitAlt")}
            name={t("portraitName")}
            role={t("portraitRole")}
          />
        </div>

        <Reveal className="lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-8">
          <div className="max-w-xl space-y-4 text-base leading-[1.7] text-ivory md:text-lg">
            <p>{t("body1")}</p>
            <p>{t("body2")}</p>
          </div>
          <Link
            href="/about"
            className="mt-5 inline-flex items-center gap-2 py-2 text-base text-gold underline-offset-[6px] hover:text-ivory-strong hover:underline focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none"
          >
            {t("cta")} <span aria-hidden>→</span>
          </Link>

          <h3 className="mt-12 text-sm tracking-[0.04em] text-gold">{t("expectTitle")}</h3>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {EXPECTATIONS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border-t border-white/12 py-3 text-base text-ivory"
              >
                <Check className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0">{t(`expect.${item}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
