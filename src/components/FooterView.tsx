"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { CookieSettingsButton } from "@/components/CookieBanner";
import { keepEcommerce } from "@/components/KeepEcommerce";
import { InstagramIcon, LinkedInIcon, TikTokIcon } from "@/components/SocialIcons";
import { SERVICE_KEYS, pagePath, servicePath, type Locale, type ServiceKey } from "@/lib/services";

const SERVICE_NAV_KEYS: Record<ServiceKey, "serviceUgc" | "serviceAi" | "serviceProduct"> = {
  ugc: "serviceUgc",
  ai: "serviceAi",
  product: "serviceProduct",
};

type Props = {
  tagline: string;
  contactEmail: string;
  instagramUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
};

/** Closing scene: muted green → forest → near-black (globals.css .footer-scene). */
export function FooterView({ tagline, contactEmail, instagramUrl, linkedinUrl, tiktokUrl }: Props) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navbar");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const socials = [
    { key: "instagram" as const, href: instagramUrl, Icon: InstagramIcon },
    { key: "linkedin" as const, href: linkedinUrl, Icon: LinkedInIcon },
    { key: "tiktok" as const, href: tiktokUrl, Icon: TikTokIcon },
  ];

  const goHome = useCallback(() => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [isHome, router]);

  const linkClass =
    "inline-block py-1 text-[#e8dfd8] underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-[#cfe0d5]/60 focus-visible:outline-none";
  const columnTitle = "mb-3 text-sm tracking-[0.04em] text-[#b9cdbf]";

  return (
    <footer data-nav-caption="contact" className="footer-scene relative z-20 mt-auto text-[#e8dfd8]">
      <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-8 md:px-10 md:pt-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-4 text-left focus-visible:ring-2 focus-visible:ring-[#cfe0d5]/60 focus-visible:outline-none"
            >
              <Image src="/logo.png" alt="" width={72} height={72} className="h-14 w-auto object-contain opacity-95 md:h-16" />
              <span className="font-display text-3xl font-light tracking-tight text-[#f5efe8] md:text-4xl">{t("brand")}</span>
            </button>
            <p className="mt-5 max-w-xs text-base text-[#e8dfd8]/85">{keepEcommerce(tagline)}</p>
            <p className="mt-2 max-w-xs text-sm text-[#e8dfd8]/70">{t("location")}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.5fr)]">
            <nav aria-label={t("columns.services")}>
              <p className={columnTitle}>{t("columns.services")}</p>
              <ul>
                <li>
                  <Link href={pagePath("hub", locale)} className={linkClass}>
                    {t("services")}
                  </Link>
                </li>
                {SERVICE_KEYS.map((key) => (
                  <li key={key}>
                    <Link href={servicePath(key, locale)} className={linkClass}>
                      {nav(SERVICE_NAV_KEYS[key])}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t("columns.pages")}>
              <p className={columnTitle}>{t("columns.pages")}</p>
              <ul>
                <li>
                  <Link href="/portfolio" className={linkClass}>{t("portfolio")}</Link>
                </li>
                <li>
                  <Link href={pagePath("howItWorks", locale)} className={linkClass}>{t("process")}</Link>
                </li>
                <li>
                  <Link href="/about" className={linkClass}>{t("about")}</Link>
                </li>
              </ul>
            </nav>
            <div className="col-span-2 sm:col-span-1">
              <p className={columnTitle}>{t("columns.contact")}</p>
              <a href={`mailto:${contactEmail}`} className={`${linkClass} [overflow-wrap:anywhere] sm:[overflow-wrap:normal]`}>
                {contactEmail}
              </a>
              <div className="mt-4 flex items-center gap-3">
                {socials.map(({ key, href, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(key)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e8dfd8]/25 text-[#e8dfd8] transition-colors duration-200 hover:border-[#e8dfd8]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#cfe0d5]/60 focus-visible:outline-none"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[#e8dfd8]/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[#e8dfd8]/75">{t("copyright", { year: new Date().getFullYear() })}</p>
          <nav aria-label={t("navLabel")} className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/privacy-policy" className={linkClass}>
              {t("privacy")}
            </Link>
            <CookieSettingsButton className={linkClass} />
          </nav>
        </div>
      </div>
    </footer>
  );
}
