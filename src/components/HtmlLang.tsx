"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/** Keeps <html lang> in sync after a client-side language switch (the root layout only sets it on load). */
export function HtmlLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
