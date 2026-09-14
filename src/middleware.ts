import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import {
  isAppLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  localeFromCountry,
} from "./i18n/locale";

const handleI18n = createMiddleware(routing);

function pathnameLocale(pathname: string) {
  const match = pathname.match(/^\/(en|nl)(?=\/|$)/);
  return match?.[1];
}

export default function middleware(request: NextRequest) {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  const hasSavedLocale = isAppLocale(existing);
  const hasLocalePrefix = Boolean(pathnameLocale(request.nextUrl.pathname));

  if (!hasSavedLocale && !hasLocalePrefix) {
    const locale = localeFromCountry(request);
    request.cookies.set(LOCALE_COOKIE, locale);

    const response = handleI18n(request);
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  return handleI18n(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|studio|opengraph-image|twitter-image|icon|.*\\..*).*)",
};
