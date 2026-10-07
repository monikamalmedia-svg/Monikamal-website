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
import { HtmlLang } from "@/components/HtmlLang";
import { Navbar } from "@/components/Navbar";
import { ScrollRoot } from "@/components/ScrollRoot";
import { ContactDialogProvider } from "@/components/ContactDialog";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import { routing } from "@/i18n/routing";
import { fetchSiteSettings } from "@/lib/cms-site-settings";
import { INQUIRY_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

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

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
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
    // Canonical + hreflang are set per page (see lib/seo.ts); a layout-level canonical
    // would make every page without its own metadata point at the homepage.
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "nl" ? "nl_NL" : "en_US",
      alternateLocale: locale === "nl" ? ["en_US"] : ["nl_NL"],
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
  const settings = await fetchSiteSettings();

  return (
    <NextIntlClientProvider>
      <ContactDialogProvider email={settings.contactEmail ?? INQUIRY_EMAIL}>
        <CookieConsentProvider>
          <DisableRightClick>
            <ScrollRoot>
              <HtmlLang />
              <FilmGrainOverlay />
              <CursorSpotlightGrid />
              <Navbar
                phone={settings.whatsappNumber}
                socials={{ instagramUrl: settings.instagramUrl, linkedinUrl: settings.linkedinUrl, tiktokUrl: settings.tiktokUrl }}
              />
              <div className="relative z-20 isolate flex flex-1 flex-col">{children}</div>
              <Footer />
              <CookieBanner />
              <ConsentScripts />
            </ScrollRoot>
          </DisableRightClick>
        </CookieConsentProvider>
      </ContactDialogProvider>
    </NextIntlClientProvider>
  );
}
