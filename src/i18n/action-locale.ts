import "server-only";

import { cookies } from "next/headers";

import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/i18n/config";

/** Locale for Server Actions — root-params are not available there. */
export async function getActionLocale(formData?: FormData): Promise<Locale> {
  const fromForm = formData?.get("lang");
  if (typeof fromForm === "string" && isLocale(fromForm)) {
    return fromForm;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return defaultLocale;
}
