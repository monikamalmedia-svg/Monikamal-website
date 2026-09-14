import type { NextRequest } from "next/server";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const DUTCH_COUNTRIES = new Set(["NL", "BE"]);

export type AppLocale = "en" | "nl";

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return value === "en" || value === "nl";
}

export function localeFromCountry(request: NextRequest): AppLocale {
  const geoCountry =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    (
      request as NextRequest & {
        geo?: { country?: string | null };
      }
    ).geo?.country ||
    "";

  if (DUTCH_COUNTRIES.has(geoCountry.trim().toUpperCase())) {
    return "nl";
  }

  return "en";
}
