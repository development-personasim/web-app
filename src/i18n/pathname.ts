import {
  getPathLocale,
  stripLocalePrefix,
  withLocalePrefix,
} from "@/lib/i18n/paths";
import { defaultLocale, type Locale } from "@/i18n/config";

export function stripLocaleFromPathname(pathname: string) {
  return stripLocalePrefix(pathname);
}

export function localizePathname(pathname: string, locale: Locale) {
  return withLocalePrefix(pathname, locale);
}

export function replaceLocaleInPathname(pathname: string, locale: Locale) {
  return localizePathname(pathname, locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  return getPathLocale(pathname) ?? defaultLocale;
}
