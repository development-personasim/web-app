import { NextRequest, NextResponse } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
  type Locale,
} from "@/i18n/config";
import { getRequestLocale } from "@/i18n/get-request-locale";

export function pathnameHasLocale(pathname: string) {
  return locales.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function getPathLocale(pathname: string): Locale | null {
  const value = pathname.split("/")[1];
  return value && isLocale(value) ? value : null;
}

export function withLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
}

export function prepareLocaleRequest(request: NextRequest): {
  redirect?: NextResponse;
  request: NextRequest;
  locale: Locale;
  rewriteTo?: URL;
} {
  const { pathname } = request.nextUrl;

  if (pathname === "/auth/callback") {
    const locale = getRequestLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/callback`;
    return {
      request: new NextRequest(url, request),
      locale,
      rewriteTo: url,
    };
  }

  if (!pathnameHasLocale(pathname)) {
    const locale = getRequestLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const redirect = withLocaleCookie(NextResponse.redirect(url), locale);
    return {
      redirect,
      request,
      locale,
    };
  }

  return {
    request,
    locale: getPathLocale(pathname) ?? defaultLocale,
  };
}
