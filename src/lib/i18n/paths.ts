import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export function getPathLocale(pathname: string): Locale | null {
  const value = pathname.split("/")[1];
  return value && isLocale(value) ? value : null;
}

export function stripLocalePrefix(pathname: string) {
  const locale = getPathLocale(pathname);
  if (!locale) {
    return pathname || "/";
  }

  const rest = pathname.slice(locale.length + 1);
  return rest ? rest : "/";
}

export function withLocalePrefix(pathname: string, locale: Locale) {
  const bare = stripLocalePrefix(pathname);
  if (bare === "/") {
    return `/${locale}`;
  }
  return `/${locale}${bare}`;
}

export function resolveLocale(pathname: string): Locale {
  return getPathLocale(pathname) ?? defaultLocale;
}
