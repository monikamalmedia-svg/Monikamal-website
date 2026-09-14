import { defineRouting } from "next-intl/routing";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "./locale";

export const routing = defineRouting({
  locales: ["en", "nl"],
  defaultLocale: "en",
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  },
});
