"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CONSENT,
  loadStoredConsent,
  persistConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  ready: boolean;
  consent: CookieConsent | null;
  bannerOpen: boolean;
  settingsOpen: boolean;
  openSettings: () => void;
  closeBanner: () => void;
  acceptAll: () => void;
  acceptNecessary: () => void;
  savePreferences: (next: Pick<CookieConsent, "analytics" | "marketing">) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = loadStoredConsent();
    setConsent(stored);
    setBannerOpen(!stored);
    setReady(true);
  }, []);

  const commit = useCallback((next: CookieConsent) => {
    persistConsent(next);
    setConsent(next);
    setBannerOpen(false);
    setSettingsOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    commit({ necessary: true, analytics: true, marketing: true });
  }, [commit]);

  const acceptNecessary = useCallback(() => {
    commit({ ...DEFAULT_CONSENT });
  }, [commit]);

  const savePreferences = useCallback(
    (next: Pick<CookieConsent, "analytics" | "marketing">) => {
      commit({
        necessary: true,
        analytics: next.analytics,
        marketing: next.marketing,
      });
    },
    [commit],
  );

  const openSettings = useCallback(() => {
    setBannerOpen(true);
    setSettingsOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    if (!consent) {
      commit({ ...DEFAULT_CONSENT });
      return;
    }
    setBannerOpen(false);
    setSettingsOpen(false);
  }, [commit, consent]);

  const value = useMemo(
    () => ({
      ready,
      consent,
      bannerOpen,
      settingsOpen,
      openSettings,
      closeBanner,
      acceptAll,
      acceptNecessary,
      savePreferences,
    }),
    [
      ready,
      consent,
      bannerOpen,
      settingsOpen,
      openSettings,
      closeBanner,
      acceptAll,
      acceptNecessary,
      savePreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}
