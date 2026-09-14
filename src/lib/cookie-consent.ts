import { LOCALE_COOKIE } from "@/i18n/locale";

export const CONSENT_COOKIE = "cookie_consent_status";
export const CONSENT_STORAGE_KEY = "mmm-cookie-consent";
export const CONSENT_EVENT = "mmm-cookie-consent";
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export type CookieCategory = "necessary" | "analytics" | "marketing";

export type CookieRow = {
  name: string;
  provider: string;
  category: CookieCategory;
  purposeKey: string;
  expiryKey: string;
};

export const COOKIE_ROWS: CookieRow[] = [
  {
    name: CONSENT_COOKIE,
    provider: "Monika Mal",
    category: "necessary",
    purposeKey: "consent",
    expiryKey: "months12",
  },
  {
    name: LOCALE_COOKIE,
    provider: "Monika Mal",
    category: "necessary",
    purposeKey: "locale",
    expiryKey: "months12",
  },
];

export function parseConsent(raw: string | null): CookieConsent | null {
  if (!raw) return null;

  if (raw === "all") {
    return { necessary: true, analytics: true, marketing: true };
  }
  if (raw === "necessary") {
    return { ...DEFAULT_CONSENT };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent> & {
      v?: number;
    };
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null;
    }
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
    };
  } catch {
    return null;
  }
}

export function serializeConsent(consent: CookieConsent) {
  return JSON.stringify({
    v: 1,
    necessary: true,
    analytics: consent.analytics,
    marketing: consent.marketing,
  });
}

export function readConsentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${CONSENT_COOKIE}=`;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  if (!match) return null;
  return decodeURIComponent(match.slice(prefix.length));
}

export function persistConsent(consent: CookieConsent) {
  const value = serializeConsent(consent);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
}

export function allowsAnalytics(consent: CookieConsent | null) {
  return consent?.analytics === true;
}

export function allowsMarketing(consent: CookieConsent | null) {
  return consent?.marketing === true;
}

export function loadStoredConsent(): CookieConsent | null {
  const fromStorage = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  if (fromStorage) return fromStorage;
  return parseConsent(readConsentCookie());
}
