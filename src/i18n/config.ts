export const locales = ["en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeCookieName = "NEXT_LOCALE";

export const namespaces = [
  "common",
  "header",
  "home",
  "auth",
  "auth-providers",
  "auth-email",
  "account",
  "personas",
  "chat",
] as const;

export type Namespace = (typeof namespaces)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
