"use client";

import { useCallback, type SVGProps } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { CookieSettingsButton } from "@/components/CookieBanner";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 8.5H4.06V20h2.88V8.5ZM5.5 4A1.67 1.67 0 1 0 5.5 7.34 1.67 1.67 0 0 0 5.5 4ZM20 20h-2.88v-6.16c0-1.83-.66-2.84-2.02-2.84-1.1 0-1.76.74-2.05 1.46-.1.25-.08.6-.08.95V20h-2.88s.04-10.18 0-11.5h2.88v1.83c.38-.59 1.07-1.43 2.6-1.43 1.9 0 3.43 1.24 3.43 4.04V20Z" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.6 3h-2.7v11.16a2.66 2.66 0 1 1-2.66-2.66c.17 0 .34.02.5.05V8.8a5.4 5.4 0 0 0-.5-.02 5.36 5.36 0 1 0 5.36 5.36V9.74A7.1 7.1 0 0 0 18.7 11.2V8.46a4.5 4.5 0 0 1-4.1-5.46Z" />
    </svg>
  );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2.5A9.5 9.5 0 0 0 3.2 16.3L2.5 21.5l5.3-.7A9.5 9.5 0 1 0 12.04 2.5Zm0 17.4a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-3.15.42.43-3.07-.18-.3a7.9 7.9 0 1 1 7.21 4.22Zm4.33-5.92c-.24-.12-1.4-.69-1.62-.77s-.37-.12-.53.12-.61.77-.75.93-.28.18-.52.06a6.5 6.5 0 0 1-1.9-1.17 7.1 7.1 0 0 1-1.3-1.62c-.14-.24 0-.37.1-.49s.24-.28.35-.43.12-.24.18-.4.03-.3-.01-.43-.53-1.27-.72-1.74c-.19-.46-.38-.4-.53-.4h-.45c-.16 0-.4.06-.62.3s-.81.79-.81 1.93.83 2.24.95 2.4c.12.16 1.63 2.49 3.95 3.49 1.47.63 1.85.69 2.51.58.38-.06 1.4-.57 1.6-1.12s.2-1.02.14-1.12-.22-.18-.46-.3Z" />
    </svg>
  );
}

type Props = {
  tagline: string;
  contactEmail: string | null;
  instagramUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
};

export function FooterView({
  tagline,
  contactEmail,
  instagramUrl,
  linkedinUrl,
  tiktokUrl,
  whatsappUrl,
}: Props) {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const socials = [
    { key: "instagram" as const, href: instagramUrl, Icon: InstagramIcon },
    { key: "linkedin" as const, href: linkedinUrl, Icon: LinkedInIcon },
    { key: "tiktok" as const, href: tiktokUrl, Icon: TikTokIcon },
    { key: "whatsapp" as const, href: whatsappUrl, Icon: WhatsAppIcon },
  ];

  const goHome = useCallback(() => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [isHome, router]);

  const legalLinkClass =
    "text-foreground-muted transition-colors hover:text-gold";

  return (
    <footer className="relative z-20 mt-auto border-t border-glass-border bg-graphite">
      <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-8 md:px-10 md:pt-10 md:pb-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col items-start">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-2.5 text-left"
            >
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                className="h-7 w-auto object-contain opacity-95"
              />
              <span className="font-display text-lg tracking-wide text-foreground md:text-xl">
                {t("brand")}
              </span>
            </button>
            <p className="mt-3 max-w-xs text-sm text-foreground-muted">
              {tagline}
            </p>
            <p className="mt-2 max-w-xs text-xs text-white/40">
              {t("location")}
            </p>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="mt-4 text-sm text-foreground-muted transition-colors duration-200 hover:text-gold"
              >
                {contactEmail}
              </a>
            ) : null}
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-3">
              {socials.map(({ key, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(key)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-glass-border text-foreground-muted transition-colors duration-200 hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-glass-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-2 px-6 py-4 text-center text-xs md:px-10 lg:px-12">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link href="/privacy-policy" className={legalLinkClass}>
              {t("privacy")}
            </Link>
            <CookieSettingsButton className={legalLinkClass} />
          </nav>
          <p className="mx-auto leading-relaxed text-neutral-500">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
