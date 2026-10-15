import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { NextRequest } from "next/server";

import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
  type Locale,
} from "@/i18n/config";

export function getRequestLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headers = {
    "accept-language": request.headers.get("accept-language") ?? undefined,
  };
  const languages = new Negotiator({ headers }).languages();

  try {
    const matched = match([...languages], [...locales], defaultLocale);
    return isLocale(matched) ? matched : defaultLocale;
  } catch {
    return defaultLocale;
  }
}
