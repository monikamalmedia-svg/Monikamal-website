import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { getLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/site";
import { CSPostHogProvider } from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
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
      className={`${manrope.variable} ${cormorant.variable} h-full min-h-screen antialiased`}
    >
      <body
        className={`${manrope.variable} ${cormorant.variable} flex min-h-full flex-col bg-background font-sans text-foreground`}
      >
        <CSPostHogProvider>
          {children}
        </CSPostHogProvider>
      </body>
    </html>
  );
}
