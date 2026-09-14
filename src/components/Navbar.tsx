"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { GetInTouchModal } from "@/components/GetInTouchModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

const HASH_LINKS = [
  { id: "portfolio", key: "portfolio" },
  { id: "pipeline", key: "pipeline" },
  { id: "pricing", key: "pricing" },
  { id: "faq", key: "faq" },
] as const;

type HashId = (typeof HASH_LINKS)[number]["id"] | "contact";

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<HashId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const isHome = pathname === "/";
  const isAbout = pathname === "/about";

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 50);
  });

  useEffect(() => {
    if (!isHome) {
      setActiveId(null);
      return;
    }

    const ids = [...HASH_LINKS.map(({ id }) => id), "contact"] as const;
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id as HashId);
        }
      },
      {
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0.15, 0.35, 0.55],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

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

  const goToSection = useCallback(
    (id: string) => {
      setMobileOpen(false);
      if (isHome) {
        scrollToSection(id);
        return;
      }
      router.push(`/#${id}`);
    },
    [isHome, router],
  );

  const openInquiry = useCallback(() => {
    setMobileOpen(false);
    setInquiryOpen(true);
  }, []);

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

  const brandLockup = (
    <Link href="/" onClick={goHome} className="flex min-w-0 items-center gap-2 sm:gap-2.5">
      <Image
        src="/logo.png"
        alt="Monika Mal"
        width={36}
        height={36}
        priority
        className="h-7 w-auto shrink-0 object-contain opacity-95"
      />
      <span className="whitespace-nowrap font-serif text-[0.95rem] tracking-wide text-stone-200 sm:text-lg">
        {t("brand")}
      </span>
    </Link>
  );

  const linkClass = (active: boolean, large = false) =>
    large
      ? `font-display text-3xl tracking-tight transition-colors ${
          active ? "text-gold" : "text-foreground"
        }`
      : `text-sm tracking-[0.04em] transition-colors ${
          active ? "text-gold" : "text-foreground/90 hover:text-gold"
        }`;

  const navItems = (
    large: boolean,
  ) => (
    <>
      <button
        type="button"
        onClick={() => goToSection("portfolio")}
        className={linkClass(isHome && activeId === "portfolio", large)}
      >
        {t("portfolio")}
      </button>
      <Link
        href="/about"
        onClick={() => setMobileOpen(false)}
        className={linkClass(isAbout, large)}
      >
        {t("about")}
      </Link>
      <button
        type="button"
        onClick={() => goToSection("pipeline")}
        className={linkClass(isHome && activeId === "pipeline", large)}
      >
        {t("pipeline")}
      </button>
      <button
        type="button"
        onClick={() => goToSection("pricing")}
        className={linkClass(isHome && activeId === "pricing", large)}
      >
        {t("pricing")}
      </button>
      <button
        type="button"
        onClick={() => goToSection("faq")}
        className={linkClass(isHome && activeId === "faq", large)}
      >
        {t("faq")}
      </button>
    </>
  );

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(20, 7, 12, 0.8)" : "rgba(20, 7, 12, 0)",
          borderBottomColor: scrolled
            ? "rgba(245, 235, 232, 0.12)"
            : "rgba(245, 235, 232, 0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ borderBottomWidth: 1 }}
      >
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 md:h-[4.25rem] md:px-10 lg:px-12">
          {brandLockup}

          <nav
            aria-label={t("navLabel")}
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex lg:gap-8"
          >
            {navItems(false)}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5 md:gap-3">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={openInquiry}
              className="hidden rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium tracking-widest text-white uppercase backdrop-blur-md transition-all duration-300 hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] lg:inline-flex"
            >
              {t("cta")}
            </button>

            <button
              type="button"
              aria-label={t("openMenu")}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-graphite/90 text-foreground backdrop-blur-md sm:h-10 sm:w-10 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-graphite text-foreground"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16">
              {navItems(true)}

              <div className="mt-6 flex flex-col items-center gap-5">
                <LanguageSwitcher />
                <button
                  type="button"
                  onClick={openInquiry}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-medium tracking-widest text-white uppercase backdrop-blur-md transition-all duration-300 hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                >
                  {t("cta")}
                </button>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <GetInTouchModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
