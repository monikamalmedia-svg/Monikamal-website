"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { GB, NL } from "country-flag-icons/react/3x2";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/locale";
import { routing } from "@/i18n/routing";

type LocaleCode = (typeof routing.locales)[number];

const FLAGS = {
  en: GB,
  nl: NL,
} as const;

const CLOSE_DELAY_MS = 140;

function FlagIcon({
  locale,
  className,
}: {
  locale: LocaleCode;
  className: string;
}) {
  const Flag = FLAGS[locale];

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-sm border border-white/15 opacity-80 ${className}`}
    >
      <Flag className="h-full w-full object-cover" aria-hidden />
    </span>
  );
}

export function LanguageSwitcher({
  className = "relative z-10",
}: {
  className?: string;
}) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale() as LocaleCode;
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(false);
  }, [clearCloseTimer]);

  const persistLocaleCookie = useCallback((code: LocaleCode) => {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  }, []);

  const selectLocale = useCallback(
    (code: LocaleCode) => {
      closeMenu();
      persistLocaleCookie(code);
      if (code === locale) return;
      router.replace(pathname, { locale: code });
    },
    [closeMenu, locale, pathname, persistLocaleCookie, router],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!rootRef.current || !target) return;
      if (!rootRef.current.contains(target)) {
        closeMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeMenu]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  return (
    <div
      ref={rootRef}
      className={className}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        onFocus={openMenu}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 text-white/80 backdrop-blur-md transition-all duration-300 ease-out hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:border-white/25 focus-visible:bg-white/10 focus-visible:outline-none sm:h-auto sm:gap-2 sm:px-3 sm:py-1.5"
      >
        <FlagIcon locale={locale} className="h-3 w-4" />
        <span className="text-[11px] font-medium tracking-wider uppercase sm:text-xs">
          {t(locale)}
        </span>
        <ChevronDown
          className={`hidden h-3.5 w-3.5 opacity-80 transition-transform duration-300 ease-out sm:block ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={menuId}
            role="listbox"
            aria-label={t("label")}
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: {
                opacity: 0,
                y: -8,
                scale: 0.96,
                filter: "blur(8px)",
              },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: {
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                  staggerChildren: 0.05,
                  delayChildren: 0.04,
                },
              },
            }}
            style={{ originX: 1, originY: 0 }}
            className="absolute top-[calc(100%+0.5rem)] right-0 min-w-[9.75rem] rounded-2xl border border-white/20 bg-white/[0.08] p-1.5 shadow-[0_10px_40px_rgba(14,2,6,0.22)] ring-1 ring-white/10 ring-inset backdrop-blur-2xl"
          >
            {routing.locales.map((code) => {
              const isActive = locale === code;

              return (
                <motion.li
                  key={code}
                  role="option"
                  aria-selected={isActive}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectLocale(code)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium tracking-wider uppercase transition-[background-color,color,box-shadow,transform] duration-300 ease-out hover:translate-x-px hover:bg-white/[0.12] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] focus-visible:bg-white/[0.12] focus-visible:text-white focus-visible:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] focus-visible:outline-none ${
                      isActive ? "bg-white/[0.1] text-white" : "text-white/75"
                    }`}
                  >
                    <FlagIcon locale={code} className="h-4 w-5" />
                    <span>{t(code)}</span>
                    {isActive ? (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-gold/80 shadow-[0_0_8px_rgba(212,175,55,0.45)]"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
