"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCookieConsent } from "@/context/CookieConsentContext";

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
        checked ? "border-gold bg-gold/30" : "border-glass-border bg-graphite"
      } ${disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform duration-200 ${
          checked ? "translate-x-5 bg-gold" : "translate-x-0 bg-foreground-muted"
        }`}
      />
    </button>
  );
}

export function CookieBanner() {
  const t = useTranslations("Cookies");
  const {
    ready,
    consent,
    bannerOpen,
    settingsOpen,
    closeBanner,
    acceptAll,
    savePreferences,
  } = useCookieConsent();
  const titleId = useId();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [panel, setPanel] = useState<"notice" | "settings">(
    settingsOpen ? "settings" : "notice",
  );

  useEffect(() => {
    if (!bannerOpen) return;
    setAnalytics(consent?.analytics === true);
    setMarketing(consent?.marketing === true);
    setPanel(settingsOpen ? "settings" : "notice");
  }, [bannerOpen, settingsOpen, consent]);

  if (!ready) return null;

  return (
    <AnimatePresence>
      {bannerOpen ? (
        <motion.div
          role="region"
          aria-labelledby={titleId}
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 32, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 bottom-0 left-0 z-50 w-full border-t border-amber-500/20 bg-[#0d0509]/90 backdrop-blur-md"
        >
          {panel === "settings" ? (
            <div className="mx-auto max-h-[min(70vh,32rem)] max-w-6xl overflow-y-auto px-6 py-5 md:px-10">
              <div className="flex items-start justify-between gap-3">
                <p id={titleId} className="font-display text-lg text-foreground">
                  {t("settingsTitle")}
                </p>
                <button
                  type="button"
                  onClick={closeBanner}
                  className="text-xs tracking-wide text-neutral-400 uppercase transition-colors hover:text-white"
                >
                  {t("close")}
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                {t("settingsIntro")}
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("categories.necessary.title")}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                        {t("categories.necessary.body")}
                      </p>
                      <p className="mt-2 text-[10px] tracking-[0.14em] text-amber-300 uppercase">
                        {t("required")}
                      </p>
                    </div>
                    <Switch
                      checked
                      disabled
                      label={t("categories.necessary.title")}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("categories.analytics.title")}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                        {t("categories.analytics.body")}
                      </p>
                    </div>
                    <Switch
                      checked={analytics}
                      label={t("categories.analytics.title")}
                      onChange={setAnalytics}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("categories.marketing.title")}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                        {t("categories.marketing.body")}
                      </p>
                    </div>
                    <Switch
                      checked={marketing}
                      label={t("categories.marketing.title")}
                      onChange={setMarketing}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => savePreferences({ analytics, marketing })}
                  className="rounded-lg border border-amber-400/60 bg-amber-400/10 px-4 py-2 text-xs font-medium tracking-wider text-amber-300 uppercase shadow-[0_0_10px_rgba(251,191,36,0.15)] transition-all duration-300 hover:bg-amber-400 hover:text-black"
                >
                  {t("save")}
                </button>
                <button
                  type="button"
                  onClick={() => setPanel("notice")}
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs tracking-wider text-white/80 uppercase transition-all hover:bg-white/10 hover:text-white"
                >
                  {t("back")}
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:gap-8 md:px-10">
              <p id={titleId} className="text-sm text-neutral-300">
                {t("barBody")}
              </p>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href="/privacy-policy"
                  className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs tracking-wider text-white/80 uppercase transition-all hover:bg-white/10 hover:text-white"
                >
                  {t("learnMore")}
                </Link>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-lg border border-amber-400/60 bg-amber-400/10 px-4 py-2 text-xs font-medium tracking-wider text-amber-300 uppercase shadow-[0_0_10px_rgba(251,191,36,0.15)] transition-all duration-300 hover:bg-amber-400 hover:text-black"
                >
                  {t("accept")}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
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
