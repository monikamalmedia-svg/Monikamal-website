"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Phone, X } from "lucide-react";
import { useContactDialog } from "@/components/ContactDialog";
import { NavCaption } from "@/components/NavCaption";
import { InstagramIcon, LinkedInIcon, TikTokIcon } from "@/components/SocialIcons";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/locale";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  SERVICE_KEYS,
  pagePath,
  routeFromSlug,
  servicePath,
  translatePath,
  type Locale,
  type ServiceKey,
} from "@/lib/services";

// /projects/[slug] serves About works and portfolio videos; the page content says which one.
const subscribeToNothing = () => () => {};
const isClientSnapshot = () => true;
const isServerSnapshot = () => false;

/** Remember the chosen language (same cookie the middleware reads). */
function persistLocale(code: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
const LANG_FOCUS_KEY = "mm-lang-focus";
const isPortfolioPage = () => Boolean(document.querySelector('main[data-page="portfolio"]'));

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d]";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SERVICE_LABEL_KEYS: Record<ServiceKey, "serviceUgc" | "serviceAi" | "serviceProduct"> = {
  ugc: "serviceUgc",
  ai: "serviceAi",
  product: "serviceProduct",
};

/**
 * Compact floating header: a fully rounded pill (logo · short description · menu button), and a
 * full-screen menu with large links, the services, "Discuss your project" (opens the contact
 * dialog) and "Call me" (tel:). The NL/EN toggle sits in the pill, left of Menu. The phone number
 * itself is never shown.
 */
export type SocialLinks = { instagramUrl: string; linkedinUrl: string; tiktokUrl: string };

export function Navbar({ phone, socials }: { phone: string; socials: SocialLinks }) {
  const t = useTranslations("Navbar");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { openContact } = useContactDialog();
  const [open, setOpen] = useState(false);
  const isClient = useSyncExternalStore(subscribeToNothing, isClientSnapshot, isServerSnapshot);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(true);
  const langRef = useRef<HTMLButtonElement>(null);
  const menuLangRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LANG_FOCUS_KEY)) {
        sessionStorage.removeItem(LANG_FOCUS_KEY);
        const target = langRef.current?.offsetParent ? langRef.current : toggleRef.current;
        target?.focus({ preventScroll: true });
      }
    } catch {}
  }, [locale]);

  const isHome = pathname === "/";
  const firstSegment = pathname.split("/")[1] ?? "";
  const route = routeFromSlug(firstSegment);
  const portfolioContent = useSyncExternalStore(subscribeToNothing, isPortfolioPage, () => false);
  const portfolioProject = firstSegment === "projects" && portfolioContent;
  const active = {
    work: firstSegment === "portfolio" || portfolioProject,
    services: route?.kind === "service" || (route?.kind === "page" && route.key === "hub"),
    process: route?.kind === "page" && route.key === "howItWorks",
    about: firstSegment === "about" || (firstSegment === "projects" && !portfolioProject),
  };

  // Open menu: page inert, no background scroll, Escape closes, Tab stays inside, focus returns.
  useEffect(() => {
    if (!open) return;
    restoreFocus.current = true;
    const toggle = toggleRef.current;
    const others = [...document.body.children].filter((node) => node !== panelRef.current) as HTMLElement[];
    const wasInert = others.map((node) => node.inert);
    others.forEach((node) => (node.inert = true));
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const focusFirst = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => node.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", onKeyDown);
      others.forEach((node, index) => (node.inert = wasInert[index]));
      html.style.overflow = previousOverflow;
      if (restoreFocus.current) toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);
  // Only platforms with a real URL in the site settings.
  const socialLinks = [
    { key: "instagram" as const, href: socials.instagramUrl, Icon: InstagramIcon },
    { key: "linkedin" as const, href: socials.linkedinUrl, Icon: LinkedInIcon },
    { key: "tiktok" as const, href: socials.tiktokUrl, Icon: TikTokIcon },
  ].filter((link) => /^https?:\/\//.test(link.href?.trim() ?? ""));
  const leave = useCallback(() => {
    restoreFocus.current = false;
    setOpen(false);
  }, []);

  const goHome = useCallback(
    (event?: { preventDefault: () => void }) => {
      setOpen(false);
      if (isHome) {
        event?.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [isHome],
  );

  // Menu → contact dialog: close the menu first; the dialog then takes over inert/scroll lock and
  // returns focus to the menu button when it closes.
  const discuss = () => {
    setOpen(false);
    openContact({ opener: toggleRef.current });
  };

  // Same page in the other language (service/page slugs are translated; case studies and
  // projects keep their slug).
  const otherLocale: Locale = locale === "nl" ? "en" : "nl";
  const switchLocale = () => {
    persistLocale(otherLocale);
    // The header re-mounts under the new locale: put focus back on the toggle afterwards.
    try {
      sessionStorage.setItem(LANG_FOCUS_KEY, "1");
    } catch {}
    router.replace(translatePath(pathname, otherLocale), { locale: otherLocale, scroll: false });
  };

  // NL ◯ EN; display:none (so also out of the tab order) where the other copy is shown.
  const langToggle = (className: string, ref: RefObject<HTMLButtonElement | null>) => (
          <button
            ref={ref}
            type="button"
            onClick={switchLocale}
            aria-label={t("languageSwitch")}
            className={`group ${className} h-11 shrink-0 items-center gap-2 rounded-full px-2 text-sm ${FOCUS_RING}`}
          >
            <span lang="nl" aria-hidden className={locale === "nl" ? "text-ivory-strong" : "text-[#8d8a86] transition-colors group-hover:text-ivory"}>
              NL
            </span>
            <span aria-hidden className="relative h-[18px] w-[32px] rounded-full border border-white/15 bg-white/[0.07]">
              <span
                className={`absolute top-[2px] left-[2px] h-3 w-3 rounded-full bg-ivory-strong shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-transform duration-300 motion-reduce:transition-none ${
                  locale === "en" ? "translate-x-[14px]" : ""
                }`}
              />
            </span>
            <span lang="en" aria-hidden className={locale === "en" ? "text-ivory-strong" : "text-[#8d8a86] transition-colors group-hover:text-ivory"}>
              EN
            </span>
          </button>
  );

  const current = (isActive: boolean) => (isActive ? ("page" as const) : undefined);
  const bigLinks = [
    { key: "work", href: "/portfolio", label: t("work"), isActive: active.work },
    { key: "services", href: pagePath("hub", locale), label: t("services"), isActive: active.services },
    { key: "process", href: pagePath("howItWorks", locale), label: t("process"), isActive: active.process },
    { key: "about", href: "/about", label: t("about"), isActive: active.about },
    { key: "contact", href: "/#contact", label: t("contact"), isActive: false },
  ];

  const brand = (
    <Link href="/" onClick={goHome} className={`flex min-w-0 items-center gap-2.5 rounded-full ${FOCUS_RING}`}>
      <Image src="/logo.png" alt="" width={36} height={36} priority className="h-7 w-auto shrink-0 object-contain opacity-95" />
      <span className="font-serif text-[1.0625rem] whitespace-nowrap text-ivory-strong">{t("brand")}</span>
    </Link>
  );

  const fade = (index: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay: 0.08 + index * 0.05, ease: [0.22, 1, 0.36, 1] as const },
        };

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="site-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("navLabel")}
          className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-[radial-gradient(90%_75%_at_0%_100%,rgba(32,53,43,0.8)_0%,rgba(32,53,43,0.28)_45%,transparent_78%),radial-gradient(55%_50%_at_100%_0%,rgba(41,37,31,0.55)_0%,transparent_72%),linear-gradient(160deg,#141a17_0%,#0b0e0d_55%)] text-ivory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.28 }}
        >
          <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 md:pt-6">
            <div className="flex items-center justify-between gap-4">
              {brand}
              <button
                type="button"
                data-autofocus
                onClick={close}
                className={`inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-base text-ivory transition-colors hover:border-gold/70 hover:text-gold ${FOCUS_RING}`}
              >
                {t("closeMenu")} <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </button>
            </div>

            <div className="mt-10 grid flex-1 gap-12 md:mt-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-20">
              <nav aria-label={t("navLabel")}>
                <ul className="space-y-1 md:space-y-2">
                  {bigLinks.map((link, index) => (
                    <motion.li key={link.key} {...fade(index)}>
                      <Link
                        href={link.href}
                        onClick={leave}
                        aria-current={current(link.isActive)}
                        className={`font-display inline-block rounded-sm text-[clamp(2.4rem,7vw,4.5rem)] leading-[1.08] font-light tracking-tight transition-colors ${FOCUS_RING} ${
                          link.isActive ? "text-gold" : "text-ivory-strong hover:text-gold"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div className="flex flex-col gap-10 lg:pt-4" {...fade(bigLinks.length)}>
                <div>
                  <p className="text-sm tracking-[0.04em] text-gold">{t("servicesMenuLabel")}</p>
                  <ul className="mt-3 border-t border-white/12">
                    {SERVICE_KEYS.map((key) => (
                      <li key={key} className="border-b border-white/12">
                        <Link
                          href={servicePath(key, locale)}
                          onClick={leave}
                          aria-current={current(route?.kind === "service" && route.key === key)}
                          className={`group flex items-center justify-between gap-4 rounded-sm py-3.5 text-lg text-ivory transition-colors hover:text-gold aria-[current=page]:text-gold ${FOCUS_RING}`}
                        >
                          {t(SERVICE_LABEL_KEYS[key])}{" "}
                          <ArrowRight className="h-4 w-4 shrink-0 opacity-70 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" strokeWidth={1.5} aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="font-display max-w-sm text-2xl leading-snug font-light text-ivory-strong">{t("phrase")}</p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={discuss}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ivory-strong px-6 text-base text-[#241018] transition-colors hover:bg-white ${FOCUS_RING}`}
                  >
                    {t("discuss")} <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  </button>
                  <a
                    href={`tel:+${phone}`}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-base text-ivory transition-colors hover:border-gold/70 hover:text-gold ${FOCUS_RING}`}
                  >
                    <Phone className="h-4 w-4" strokeWidth={1.5} aria-hidden /> {t("call")}
                  </a>
                </div>

                {socialLinks.length > 0 ? (
                  <div>
                    <p className="text-sm tracking-[0.04em] text-gold">{t("follow")}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {socialLinks.map(({ key, href, Icon }) => (
                        <li key={key}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-base text-ivory transition-colors hover:border-white/45 hover:text-ivory-strong ${FOCUS_RING}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden /> {t(key)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Mobile only: on wider screens the toggle sits in the header pill. */}
                <div className="flex items-center gap-3 border-t border-white/12 pt-5 md:hidden">
                  <span className="text-sm tracking-[0.04em] text-gold">{t("language")}</span>
                  {langToggle("inline-flex -ml-2 text-base", menuLangRef)}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:pt-4">
        <div className="pointer-events-auto flex h-14 w-full max-w-[52rem] items-center justify-between gap-2 rounded-full border border-white/15 bg-[rgba(11,14,13,0.92)] py-1.5 pr-1.5 pl-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:gap-4 sm:pl-5">
          {brand}
          {/* Section / page caption; gives way first when space runs out (hidden below md, truncated above). */}
          <NavCaption className="hidden min-w-0 flex-1 truncate text-center text-[0.9375rem] text-ivory/80 md:block" />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {langToggle("hidden md:inline-flex", langRef)}
          <button
            ref={toggleRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t("openMenu")}
            onClick={() => setOpen(true)}
            className={`inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-ivory-strong/95 px-4 text-base sm:px-5 text-[#241018] transition-colors hover:bg-white ${FOCUS_RING}`}
          >
            {t("menu")}
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
          </div>
        </div>
      </header>
      {isClient ? createPortal(overlay, document.body) : null}
    </>
  );
}
