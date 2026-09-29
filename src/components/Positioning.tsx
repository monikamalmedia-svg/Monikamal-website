import { useTranslations } from "next-intl";

const POINTS = ["human", "ai", "platform"] as const;

export function Positioning() {
  const t = useTranslations("Positioning");

  return (
    <section
      id="aanpak"
      className="relative z-20 scroll-mt-24 bg-transparent px-6 pt-20 pb-12 md:px-10 md:pt-28 md:pb-16 lg:px-12"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-20">
        <header className="relative z-20 max-w-xl rounded-xl text-left backdrop-blur-sm">
          <p className="mb-4 text-xs tracking-[0.28em] text-gold uppercase md:text-sm">
            {t("kicker")}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-medium tracking-tight text-balance text-foreground">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground-muted md:text-lg">
            {t("body1")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground md:text-lg">
            {t("body2")}
          </p>
        </header>

        <ol className="relative z-20 border-b border-glass-border lg:mt-2">
          {POINTS.map((point, index) => (
            <li
              key={point}
              className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-glass-border py-6 md:grid-cols-[3rem_1fr] md:py-7"
            >
              <span
                aria-hidden
                className="font-display pt-0.5 text-2xl leading-none font-medium tracking-tight text-gold/60"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-2xl leading-tight font-medium tracking-tight text-foreground">
                  {t(`points.${point}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted md:text-base">
                  {t(`points.${point}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
