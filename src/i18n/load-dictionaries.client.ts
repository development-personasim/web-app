"use client";

import { isLocale, type Locale, type Namespace } from "@/i18n/config";

type Dictionary = Record<string, string>;

const cache = new Map<string, Promise<Dictionary>>();

function cacheKey(locale: Locale, name: Namespace) {
  return `${locale}:${name}`;
}

export async function loadClientDictionaries(
  locale: string,
  names: Namespace[],
): Promise<Record<string, Dictionary>> {
  if (!isLocale(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  const entries = await Promise.all(
    names.map(async (name) => {
      const key = cacheKey(locale, name);
      let pending = cache.get(key);

      if (!pending) {
        pending = import(`@/i18n/locales/${locale}/${name}.json`).then(
          (mod: { default: Dictionary }) => mod.default,
        );
        cache.set(key, pending);
      }

      return [name, await pending] as const;
    }),
  );

  return Object.fromEntries(entries);
}
