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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Monika Mal — AI Visual Director",
  description:
    "Cinematic visual assets & AI commercials for high-converting brands.",
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
  openGraph: {
    title: "Monika Mal — AI Visual Director",
    description:
      "Cinematic visual assets & AI commercials for high-converting brands.",
    url: SITE_URL,
    siteName: "Monika Mal",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Monika Mal — AI Visual Director",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monika Mal — AI Visual Director",
    description:
      "Cinematic visual assets & AI commercials for high-converting brands.",
    images: ["/og-image.jpg"],
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
