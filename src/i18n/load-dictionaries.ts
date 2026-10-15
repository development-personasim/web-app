import "server-only";

import { notFound } from "next/navigation";
import { lang as langParam } from "next/root-params";

import {
  defaultLocale,
  isLocale,
  type Locale,
  type Namespace,
} from "@/i18n/config";

type Dictionary = Record<string, string>;

const loaders: Record<
  Locale,
  Record<Namespace, () => Promise<{ default: Dictionary }>>
> = {
  en: {
    common: () => import("@/i18n/locales/en/common.json"),
    header: () => import("@/i18n/locales/en/header.json"),
    home: () => import("@/i18n/locales/en/home.json"),
    auth: () => import("@/i18n/locales/en/auth.json"),
    "auth-providers": () => import("@/i18n/locales/en/auth-providers.json"),
    "auth-email": () => import("@/i18n/locales/en/auth-email.json"),
    account: () => import("@/i18n/locales/en/account.json"),
    personas: () => import("@/i18n/locales/en/personas.json"),
    chat: () => import("@/i18n/locales/en/chat.json"),
  },
  ru: {
    common: () => import("@/i18n/locales/ru/common.json"),
    header: () => import("@/i18n/locales/ru/header.json"),
    home: () => import("@/i18n/locales/ru/home.json"),
    auth: () => import("@/i18n/locales/ru/auth.json"),
    "auth-providers": () => import("@/i18n/locales/ru/auth-providers.json"),
    "auth-email": () => import("@/i18n/locales/ru/auth-email.json"),
    account: () => import("@/i18n/locales/ru/account.json"),
    personas: () => import("@/i18n/locales/ru/personas.json"),
    chat: () => import("@/i18n/locales/ru/chat.json"),
  },
};

export async function getLocale(): Promise<Locale> {
  const value = await langParam();
  if (typeof value !== "string" || !isLocale(value)) {
    notFound();
  }
  return value;
}

export async function loadDictionaries(
  names: Namespace[],
  locale?: Locale,
): Promise<Record<string, Dictionary>> {
  const resolvedLocale = locale ?? (await getLocale().catch(() => defaultLocale));

  const entries = await Promise.all(
    names.map(async (name) => {
      const mod = await loaders[resolvedLocale][name]();
      return [name, mod.default] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function loadNamespace(name: Namespace, locale?: Locale) {
  const dictionaries = await loadDictionaries([name], locale);
  return dictionaries[name];
}
