import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { getLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/site";
import { CSPostHogProvider } from "./providers";
import "./globals.css";

// One typeface for the whole site: a high-contrast serif with an optical-size axis, so small
// text automatically gets the sturdier text cut and large headings the fine display cut.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

type Props = {
  children: ReactNode;
};

// Fallback for routes outside [locale] (Studio, error pages); locale pages set their own metadata.
const DEFAULT_TITLE = "UGC, AI Commercials & Product Content | Monika Mal";
const DEFAULT_DESCRIPTION =
  "UGC videos, cinematic AI commercials and product content for e-commerce brands. For Meta Ads, TikTok, Instagram and webshops.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Monika Mal",
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({ children }: Props) {
  let locale = "en";

  try {
    locale = await getLocale();
  } catch {
    locale = "en";
  }

  return (
    <html
      lang={locale}
      className={`${newsreader.variable} h-full min-h-screen antialiased`}
    >
      <body
        className={`${newsreader.variable} flex min-h-full flex-col bg-background font-sans text-foreground`}
      >
        <CSPostHogProvider>
          {children}
        </CSPostHogProvider>
      </body>
    </html>
  );
}
