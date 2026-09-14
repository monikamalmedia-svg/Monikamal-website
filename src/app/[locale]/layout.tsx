import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { ConsentScripts } from "@/components/ConsentScripts";
import { CursorSpotlightGrid } from "@/components/CursorSpotlightGrid";
import { DisableRightClick } from "@/components/DisableRightClick";
import { FilmGrainOverlay } from "@/components/FilmGrainOverlay";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ScrollRoot } from "@/components/ScrollRoot";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SelectedPackageProvider } from "@/context/SelectedPackageContext";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const url = new URL(path, SITE_URL).toString();
  const keywords = t.raw("keywords") as string[];

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    keywords,
    icons: {
      icon: [
        { url: "/favicon.ico?v=4" },
        { url: "/favicon-32x32.png?v=4", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png?v=4", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        {
          url: "/apple-touch-icon.png?v=4",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    manifest: "/site.webmanifest",
    alternates: {
      canonical: url,
      languages: {
        en: new URL("/", SITE_URL).toString(),
        nl: new URL("/nl", SITE_URL).toString(),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "nl" ? "nl_NL" : "en_US",
      url,
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: t("ogTitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/og-image.jpg"],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <SelectedPackageProvider>
        <CookieConsentProvider>
          <DisableRightClick>
            <ScrollRoot>
              <FilmGrainOverlay />
              <CursorSpotlightGrid />
              <Navbar />
              <div className="relative z-20 isolate flex flex-1 flex-col">{children}</div>
              <Footer />
              <WhatsAppButton />
              <CookieBanner />
              <ConsentScripts />
            </ScrollRoot>
          </DisableRightClick>
        </CookieConsentProvider>
      </SelectedPackageProvider>
    </NextIntlClientProvider>
  );
}
