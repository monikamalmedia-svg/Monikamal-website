"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  SERVICE_KEYS,
  pagePath,
  routeFromSlug,
  servicePath,
  type Locale,
  type ServiceKey,
} from "@/lib/services";

const DEMO_ID = "gratis-demo";
/** Header height on desktop (md:h-[4.25rem]); the hero counts as passed once its bottom reaches it. */
const HEADER_HEIGHT = 68;
const DESKTOP_MQ = "(min-width: 1024px)";

// No outline after a mouse click; a clear gold ring for keyboard focus only.
const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0206]";

const SERVICE_LABEL_KEYS: Record<ServiceKey, "serviceUgc" | "serviceAi" | "serviceProduct"> = {
  ugc: "serviceUgc",
  ai: "serviceAi",
  product: "serviceProduct",
};

export function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [overHero, setOverHero] = useState(true);

  const isHome = pathname === "/";
  const firstSegment = pathname.split("/")[1] ?? "";
  const route = routeFromSlug(firstSegment);
  const active = {
    work: firstSegment === "portfolio",
    services: route?.kind === "service" || (route?.kind === "page" && route.key === "hub"),
    process: route?.kind === "page" && route.key === "howItWorks",
    about: firstSegment === "about" || firstSegment === "projects",
  };

  // Homepage on desktop: the header lies over the hero (transparent, ivory on hover/focus via
  // .site-header[data-hero] in globals.css) until the hero has scrolled past.
  const heroMode = isHome && isDesktop && overHero;
  const solid = heroMode ? false : scrolled;

  const syncOverHero = useCallback(() => {
    const hero = document.querySelector("[data-hero-section]");
    setOverHero(hero ? hero.getBoundingClientRect().bottom > HEADER_HEIGHT : false);
  }, []);

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 50);
    if (isHome) syncOverHero();
  });

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);
    const sync = () => {
      setIsDesktop(media.matches);
      syncOverHero();
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("resize", syncOverHero);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("resize", syncOverHero);
    };
  }, [pathname, syncOverHero]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (media.matches) setMobileOpen(false);
    };

    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  // Service, case and other pages have their own demo form; otherwise go to the homepage form.
  const goToDemo = useCallback(() => {
    setMobileOpen(false);
    const target = document.getElementById(DEMO_ID);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push(`/#${DEMO_ID}`);
  }, [router]);

  const goHome = useCallback(
    (event?: { preventDefault: () => void }) => {
      setMobileOpen(false);
      if (isHome) {
        event?.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [isHome],
  );

  const contactGhostClass =
    `box-border inline-flex h-8 shrink-0 items-center whitespace-nowrap justify-center rounded-full border border-glass-border bg-black/30 bg-clip-padding px-3.5 text-[11px] font-medium tracking-[0.08em] text-white backdrop-blur-md transition-[border-color,color,background-color] duration-300 hover:bg-black/45 hover:text-gold ${FOCUS_RING}`;

  const brandLockup = (
    <Link href="/" onClick={goHome} className={`flex min-w-0 items-center gap-2 rounded-sm sm:gap-2.5 ${FOCUS_RING}`}>
      <span className="relative inline-flex shrink-0">
        <Image
          src="/logo.png"
          alt="Monika Mal"
          width={36}
          height={36}
          priority
          data-logo-img
          className="h-7 w-auto shrink-0 object-contain opacity-95"
        />
        <span
          aria-hidden
          data-logo-gold
          className="pointer-events-none absolute inset-0 bg-gold opacity-0 [mask:url(/logo.png)_center/contain_no-repeat]"
        />
      </span>
      <span data-brand-text className="whitespace-nowrap font-serif text-[0.95rem] tracking-wide text-stone-200 sm:text-lg">
        {t("brand")}
      </span>
    </Link>
  );

  const linkClass = (isActive: boolean, large = false) =>
    large
      ? `font-display rounded-sm text-3xl tracking-tight transition-colors ${FOCUS_RING} ${
          isActive ? "text-gold" : "text-foreground"
        }`
      : `rounded-sm text-sm tracking-[0.04em] transition-colors ${FOCUS_RING} ${
          isActive ? "text-gold" : "text-foreground/90 hover:text-gold"
        }`;

  const close = () => setMobileOpen(false);
  const current = (isActive: boolean) => (isActive ? ("page" as const) : undefined);

  const serviceLinks = SERVICE_KEYS.map((key) => ({
    key,
    href: servicePath(key, locale),
    label: t(SERVICE_LABEL_KEYS[key]),
    isActive: route?.kind === "service" && route.key === key,
  }));

  const navItems = (large: boolean) => (
    <>
      <Link href="/portfolio" onClick={close} aria-current={current(active.work)} data-nav-link={large ? undefined : ""} className={linkClass(active.work, large)}>
        {t("work")}
      </Link>
      {large ? (
        <div className="flex flex-col items-center gap-3">
          <Link href={pagePath("hub", locale)} onClick={close} aria-current={current(active.services)} className={linkClass(active.services, true)}>
            {t("services")}
          </Link>
          <ul className="flex flex-col items-center gap-2">
            {serviceLinks.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={current(item.isActive)}
                  className={`text-base transition-colors ${item.isActive ? "text-gold" : "text-foreground-muted hover:text-foreground"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Understated dropdown on hover/focus; clicking the label itself opens the hub page.
        <div className="group relative">
          <Link
            href={pagePath("hub", locale)}
            aria-current={current(active.services)}
            data-nav-link
            className={`inline-flex items-center gap-1 ${linkClass(active.services)}`}
          >
            {t("services")}
            <ChevronDown
              className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180"
              strokeWidth={1.5}
              aria-hidden
            />
          </Link>
          <div className="invisible absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <ul
              aria-label={t("servicesMenuLabel")}
              data-nav-dropdown
              className="min-w-52 rounded-xl border border-glass-border bg-graphite/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
            >
              {serviceLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={current(item.isActive)}
                    data-nav-dropdown-link
                    className={`block rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none ${item.isActive ? "text-gold" : "text-foreground/90 hover:text-gold focus-visible:text-gold"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Link href={pagePath("howItWorks", locale)} onClick={close} aria-current={current(active.process)} data-nav-link={large ? undefined : ""} className={linkClass(active.process, large)}>
        {t("process")}
      </Link>
      <Link href="/about" onClick={close} aria-current={current(active.about)} data-nav-link={large ? undefined : ""} className={linkClass(active.about, large)}>
        {t("about")}
      </Link>
    </>
  );

  return (
    <>
      <motion.header
        className="site-header fixed inset-x-0 top-0 z-50"
        data-hero={heroMode ? "" : undefined}
        initial={false}
        animate={{
          backgroundColor: solid ? "rgba(20, 7, 12, 0.8)" : "rgba(20, 7, 12, 0)",
          borderBottomColor: solid
            ? "rgba(245, 235, 232, 0.12)"
            : "rgba(245, 235, 232, 0)",
          backdropFilter: solid ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ borderBottomWidth: 1 }}
      >
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 md:h-[4.25rem] md:grid-cols-[auto_minmax(0,1fr)_auto] md:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-12">
          {brandLockup}

          {/* Tablet: sits in the middle grid column; desktop: centered in the bar. */}
          <nav
            aria-label={t("navLabel")}
            className="hidden items-center justify-center gap-5 md:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:gap-8"
          >
            {navItems(false)}
          </nav>

          <div className="flex shrink-0 items-center justify-end">
            <div className="hidden items-center justify-end gap-3 md:flex">
              <LanguageSwitcher className="relative z-10" />
              <button
                type="button"
                onClick={() => goToDemo()}
                data-header-cta
                className={contactGhostClass}
              >
                {t("demoCta")}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 md:hidden">
              <button
                type="button"
                onClick={() => goToDemo()}
                className={contactGhostClass}
              >
                {t("demoCta")}
              </button>
              <button
                type="button"
                aria-label={t("openMenu")}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
                className={`box-border inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 bg-clip-padding text-white backdrop-blur-md transition-[border-color,color,background-color] duration-300 hover:bg-black/45 hover:text-gold ${FOCUS_RING}`}
              >
                <Menu className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t("navLabel")}
            className="fixed inset-0 z-[60] flex flex-col bg-graphite/98 backdrop-blur-md md:hidden"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6">
              {brandLockup}
              <button
                type="button"
                aria-label={t("closeMenu")}
                onClick={() => setMobileOpen(false)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-graphite text-foreground ${FOCUS_RING}`}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
              <div className="flex flex-col items-center gap-7">
                {navItems(true)}
              </div>
              <button
                type="button"
                onClick={() => goToDemo()}
                className={`mt-10 inline-flex items-center justify-center rounded-full border border-gold/60 ${FOCUS_RING} bg-gold/10 px-9 py-3.5 text-sm font-medium tracking-[0.12em] text-gold uppercase transition-[border-color,background-color,box-shadow] duration-300 hover:border-gold hover:bg-gold/15 hover:shadow-[0_0_22px_rgba(212,175,55,0.28)]`}
              >
                {t("demoCta")}
              </button>
              <div className="mt-8">
                <LanguageSwitcher />
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
