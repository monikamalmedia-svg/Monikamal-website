import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { fetchSiteSettings } from "@/lib/cms-site-settings";
import { INQUIRY_EMAIL } from "@/lib/site";

/**
 * Closing contact scene (near-black with a pine hint): a large question on the left; one line,
 * "Discuss your project" (contact dialog), "Call me" (tel:, the number itself is not shown) and
 * the email on the right. Wrapped by callers in #kennismaking.
 */
export async function ContactSection({
  defaultContentType,
  toneFrom,
}: {
  defaultContentType?: "ugc" | "ai" | "product";
  /** Colour of the section above, for the blend (defaults to the page background). */
  toneFrom?: string;
}) {
  const t = await getTranslations("ContactBlock");
  const settings = await fetchSiteSettings();
  const email = settings.contactEmail ?? INQUIRY_EMAIL;
  const phone = settings.whatsappNumber;

  return (
    <section
      id="contact"
      data-nav-caption="contact"
      style={toneFrom ? ({ "--tone-from": toneFrom } as CSSProperties) : undefined}
      className={`tone tone-contact contact-glow ${toneFrom ? "" : "tone-after-grid"} z-20 scroll-mt-24 px-6 pt-[calc(var(--blend)+1.75rem)] pb-20 md:px-10 md:pt-[calc(var(--blend)+2.5rem)] md:pb-26 lg:px-12`}
    >
      <Reveal className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
        <div>
          <p className="mb-3 text-sm tracking-[0.04em] text-gold">{t("kicker")}</p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-light tracking-tight text-balance text-ivory-strong">
            {t("title")}
          </h2>
        </div>

        <div>
          <p className="max-w-md text-lg text-ivory md:text-xl">{t("body")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              data-contact-open
              data-contact-service={defaultContentType}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ivory-strong px-6 text-base text-[#241018] transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1210] focus-visible:outline-none"
            >
              {t("primary")} <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </button>
            <a
              href={`tel:+${phone}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-base text-ivory transition-colors hover:border-gold/70 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1210] focus-visible:outline-none"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} aria-hidden /> {t("call")}
            </a>
          </div>
          <p className="mt-6 text-base text-ivory/75">
            {t("emailLabel")}{" "}
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1.5 text-ivory-strong underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
            >
              <Mail className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden />
              {email}
            </a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
