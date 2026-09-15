"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useCookieConsent } from "@/context/CookieConsentContext";

const COPY = {
  nl: {
    barBody:
      "Strikt noodzakelijke cookies houden de site werkend. Analyse (Vercel Analytics / PostHog) en marketing plaatsen we alleen met jouw toestemming. Geen impliciete toestemming: kies zelf.",
    accept: "Akkoord",
    reject: "Alles afwijzen",
    manage: "Voorkeuren beheren",
    save: "Bevestig mijn keuzes",
    settingsTitle: "Cookievoorkeuren",
    settingsIntro:
      "Je kunt optionele cookies uitzetten. Analyse-scripts (Vercel Analytics en PostHog) laden alleen als Analyse aan staat.",
    close: "Sluiten",
    alwaysOn: "Altijd actief",
    necessaryTitle: "Strikt noodzakelijk",
    necessaryBody:
      "Technische cookies voor beveiliging, basisfuncties en het bewaren van jouw keuze (cookie_consent_status). Deze categorie blijft altijd aan.",
    analyticsTitle: "Analyse",
    analyticsBody:
      "Meet hoe bezoekers de site gebruiken. Omvat Vercel Analytics en PostHog. Wordt niet geladen als je deze categorie uitzet of alles afwijst.",
    marketingTitle: "Marketing",
    marketingBody:
      "Optionele cookies voor campagnemeting. Geen marketingpixels zonder jouw toestemming.",
  },
  en: {
    barBody:
      "Strictly necessary cookies keep the site working. Analytics (Vercel Analytics / PostHog) and marketing are set only with your consent. No implied consent: you choose.",
    accept: "Accept",
    reject: "Reject all",
    manage: "Manage preferences",
    save: "Save preferences",
    settingsTitle: "Cookie preferences",
    settingsIntro:
      "You can turn optional cookies off. Analytics scripts (Vercel Analytics and PostHog) load only when Analytics is enabled.",
    close: "Close",
    alwaysOn: "Always on",
    necessaryTitle: "Strictly necessary",
    necessaryBody:
      "Technical cookies for security, core functions, and storing your choice (cookie_consent_status). This category stays on.",
    analyticsTitle: "Analytics",
    analyticsBody:
      "Helps understand how visitors use the site. Includes Vercel Analytics and PostHog. Not loaded if you disable this category or reject all.",
    marketingTitle: "Marketing",
    marketingBody:
      "Optional cookies for campaign measurement. No marketing pixels without your consent.",
  },
} as const;

function Switch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange?: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ${
        checked ? "border-gold bg-gold/30" : "border-white/15 bg-black/50"
      } ${disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform duration-200 ${
          checked ? "translate-x-5 bg-gold" : "translate-x-0 bg-neutral-500"
        }`}
      />
    </button>
  );
}

const actionBtn =
  "inline-flex min-h-9 items-center justify-center rounded-md border border-white/15 bg-black/35 px-3.5 py-1.5 text-xs font-normal tracking-wide text-neutral-300 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04] hover:text-neutral-100";
const linkBtn =
  "inline-flex min-h-9 items-center justify-center px-1 py-1.5 text-center text-xs font-normal tracking-wide text-neutral-500 underline-offset-4 transition-colors duration-200 hover:text-neutral-300 hover:underline";

export function CookieBanner() {
  const locale = useLocale();
  const copy = locale === "nl" ? COPY.nl : COPY.en;
  const {
    ready,
    consent,
    bannerOpen,
    settingsOpen,
    closeBanner,
    acceptAll,
    acceptNecessary,
    savePreferences,
  } = useCookieConsent();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (settingsOpen) setModalDismissed(false);
  }, [settingsOpen]);

  useEffect(() => {
    if (!bannerOpen && !settingsOpen) {
      setManageOpen(false);
      setModalDismissed(false);
    }
  }, [bannerOpen, settingsOpen]);

  useEffect(() => {
    setAnalytics(consent?.analytics === true);
    setMarketing(consent?.marketing === true);
  }, [consent, manageOpen, settingsOpen]);

  const modalOpen =
    mounted && (manageOpen || (settingsOpen && !modalDismissed));
  const showBanner = ready && bannerOpen && !modalOpen;

  const dismissModal = () => {
    setManageOpen(false);
    setModalDismissed(true);
    if (consent) closeBanner();
  };

  const openManage = () => {
    setModalDismissed(false);
    setManageOpen(true);
  };

  const chooseAcceptAll = () => {
    setManageOpen(false);
    setModalDismissed(true);
    acceptAll();
  };

  const chooseRejectAll = () => {
    setManageOpen(false);
    setModalDismissed(true);
    acceptNecessary();
  };

  const chooseSave = () => {
    setManageOpen(false);
    setModalDismissed(true);
    savePreferences({ analytics, marketing });
  };

  if (!ready) return null;

  const modal = (
    <AnimatePresence>
      {modalOpen ? (
        <motion.div
          key="cookie-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[min(88vh,40rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0509]/95 p-5 shadow-[0_0_40px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id={titleId}
                className="font-display text-lg tracking-wide text-foreground"
              >
                {copy.settingsTitle}
              </h2>
              <button
                type="button"
                onClick={dismissModal}
                aria-label={copy.close}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition-colors hover:border-white/20 hover:text-white"
              >
                <span className="text-lg leading-none" aria-hidden>
                  ×
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              {copy.settingsIntro}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {copy.necessaryTitle}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                      {copy.necessaryBody}
                    </p>
                    <p className="mt-2 text-[10px] tracking-[0.14em] text-amber-300/80 uppercase">
                      {copy.alwaysOn}
                    </p>
                  </div>
                  <Switch checked disabled label={copy.necessaryTitle} />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {copy.analyticsTitle}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                      {copy.analyticsBody}
                    </p>
                  </div>
                  <Switch
                    checked={analytics}
                    label={copy.analyticsTitle}
                    onChange={setAnalytics}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {copy.marketingTitle}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                      {copy.marketingBody}
                    </p>
                  </div>
                  <Switch
                    checked={marketing}
                    label={copy.marketingTitle}
                    onChange={setMarketing}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button type="button" onClick={chooseRejectAll} className={actionBtn}>
                {copy.reject}
              </button>
              <button type="button" onClick={chooseAcceptAll} className={actionBtn}>
                {copy.accept}
              </button>
              <button type="button" onClick={chooseSave} className={actionBtn}>
                {copy.save}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <AnimatePresence>
        {showBanner ? (
          <motion.div
            role="region"
            aria-labelledby={titleId}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 bottom-0 left-0 z-50 w-full border-t border-white/10 bg-[#0d0509]/88 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3.5 md:flex-row md:items-center md:justify-between md:gap-8 md:px-10">
              <p
                id={titleId}
                className="text-xs leading-relaxed text-neutral-400 md:min-w-0 md:flex-1"
              >
                {copy.barBody}
              </p>
              <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2">
                <button type="button" onClick={openManage} className={linkBtn}>
                  {copy.manage}
                </button>
                <button
                  type="button"
                  onClick={chooseRejectAll}
                  className={actionBtn}
                >
                  {copy.reject}
                </button>
                <button
                  type="button"
                  onClick={chooseAcceptAll}
                  className={actionBtn}
                >
                  {copy.accept}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  const t = useTranslations("Cookies");
  const { openSettings } = useCookieConsent();

  return (
    <button type="button" onClick={openSettings} className={className}>
      {t("settingsLink")}
    </button>
  );
}
