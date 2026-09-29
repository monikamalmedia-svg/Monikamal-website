import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProtectedImage } from "@/components/ProtectedImage";
import { Link } from "@/i18n/navigation";
import { client } from "@/lib/sanity";
import { resolveSanityImageUrl } from "@/lib/sanity-media";

const EXPECTATIONS = [
  "contact",
  "price",
  "concept",
  "personal",
  "delivery",
  "revisions",
] as const;

const PORTRAIT_QUERY = `*[_type == "aboutPage"][0]{ portrait }`;

async function fetchPortraitUrl(): Promise<string | null> {
  try {
    const doc = await client.fetch<{ portrait?: unknown } | null>(PORTRAIT_QUERY);
    return resolveSanityImageUrl(doc?.portrait);
  } catch {
    return null;
  }
}

export async function MeetMonika() {
  const t = await getTranslations("MeetMonika");
  const portraitUrl = await fetchPortraitUrl();

  return (
    <section
      id="over-mij"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 py-20 md:px-10 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={
            portraitUrl
              ? "grid gap-10 md:grid-cols-[minmax(0,0.8fr)_1.2fr] md:items-center lg:gap-16"
              : "max-w-3xl"
          }
        >
          {portraitUrl ? (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm select-none overflow-hidden rounded-2xl border border-glass-border bg-[#0d0509] md:max-w-none">
              <ProtectedImage
                src={portraitUrl}
                alt={t("portraitAlt")}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="relative z-20 rounded-xl backdrop-blur-sm">
            <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
              {t("kicker")}
            </p>
            <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-foreground">
              {t("title")}
            </h2>
            <div className="mt-5 max-w-xl space-y-4 text-base leading-relaxed text-foreground-muted md:text-lg">
              <p>{t("body1")}</p>
              <p>{t("body2")}</p>
            </div>
            <Link
              href="/about"
              className="mt-4 inline-flex items-center gap-2 py-3 text-xs font-medium tracking-[0.16em] text-gold uppercase underline-offset-[6px] transition-colors duration-300 hover:text-foreground hover:underline"
            >
              {t("cta")}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <h3 className="font-display text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem]">
            {t("expectTitle")}
          </h3>
          <ul className="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {EXPECTATIONS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border-t border-glass-border py-4 text-sm leading-relaxed text-foreground md:text-base"
              >
                <Check
                  className="mt-[3px] h-4 w-4 shrink-0 text-gold"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0">{t(`expect.${item}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
