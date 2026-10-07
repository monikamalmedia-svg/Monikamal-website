import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Moved pages keep working: permanent redirects to the current URL.
  async redirects() {
    return [
      { source: "/en/how-it-works", destination: "/en/how-i-work", permanent: true },
      { source: "/nl/how-it-works", destination: "/nl/werkwijze", permanent: true },
      { source: "/how-it-works", destination: "/how-i-work", permanent: true },
      // The AUDIMAS case was first published as /portfolio/lietuva.
      { source: "/en/portfolio/lietuva", destination: "/en/portfolio/audimas", permanent: true },
      { source: "/nl/portfolio/lietuva", destination: "/nl/portfolio/audimas", permanent: true },
      { source: "/portfolio/lietuva", destination: "/portfolio/audimas", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
