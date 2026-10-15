"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { createT, type Translate } from "@/i18n/create-t";
import type { Locale } from "@/i18n/config";

type Dictionaries = Record<string, Record<string, string>>;

type DictionaryContextValue = {
  locale: Locale;
  dictionaries: Dictionaries;
  t: Translate;
};

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({
  locale,
  dictionaries,
  children,
}: {
  locale: Locale;
  dictionaries: Dictionaries;
  children: ReactNode;
}) {
  const parent = useContext(DictionaryContext);

  const value = useMemo(() => {
    const merged = {
      ...(parent?.dictionaries ?? {}),
      ...dictionaries,
    };

    const flat: Record<string, unknown> = {};
    for (const [namespace, messages] of Object.entries(merged)) {
      flat[namespace] = messages;
    }

    return {
      locale,
      dictionaries: merged,
      t: createT(flat),
    };
  }, [dictionaries, locale, parent?.dictionaries]);

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within DictionaryProvider");
  }
  return context;
}

export function useT(namespace?: string) {
  const { t } = useDictionary();

  if (!namespace) {
    return t;
  }

  return (key: string, vars?: Record<string, string | number>) =>
    t(`${namespace}.${key}`, vars);
}
