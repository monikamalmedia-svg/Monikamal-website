"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function NotFoundView() {
  const t = useTranslations("NotFound");

  return (
    <main className="relative z-20 flex flex-1 items-center justify-center bg-[linear-gradient(160deg,#1E040C_0%,#0F0206_50%,#2D0915_100%)] px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs tracking-[0.28em] text-gold uppercase">{t("kicker")}</p>
        <h1 className="font-display mt-4 text-[clamp(4rem,12vw,7rem)] leading-none font-medium text-foreground">
          404
        </h1>
        <p className="mt-4 text-lg text-foreground-muted md:text-xl">{t("body")}</p>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-[#7A2A42] px-7 py-3.5 text-xs font-semibold tracking-wide text-gold uppercase transition-all duration-300 hover:bg-gold hover:text-graphite hover:shadow-gold-glow"
        >
          {t("cta")}
        </Link>
      </div>
    </main>
  );
}
