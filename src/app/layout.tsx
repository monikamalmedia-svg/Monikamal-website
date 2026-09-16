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

const DEFAULT_TITLE = "Custom E-Commerce Commercials | Monika Mal";
const DEFAULT_DESCRIPTION =
  "Professional custom e-commerce commercials for brands. High-converting cinematic videos for Meta, TikTok, and product pages without an expensive crew.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Monika Mal | Global AI Video Production, UGC & Commercials for US & Europe",
  description:
    "Cinematic AI video production, high-converting UGC, and product visuals for premium e-commerce brands and agencies across the US, Netherlands, and Europe. Elevate your brand with next-gen AI commercials.",
  keywords: [
    "AI video production",
    "AI commercials",
    "AI UGC video agency",
    "Product video production US and Europe",
    "E-commerce video production",
    "Cinematic AI assets",
    "AI video agency US and Europe",
    "Global AI commercial production",
    "High-end AI video director",
    "UGC content for brands"
  ],
  openGraph: {
    title: "Monika Mal | Global AI Video Production, UGC & Commercials for US & Europe",
    description: "Cinematic AI video production, high-converting UGC & AI-driven commercials for global brands across the US and Europe.",
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
