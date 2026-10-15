import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { localizePathname } from "@/i18n/pathname";
import { authModalHref } from "@/lib/modals/auth";

export const instant = false;

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const query = await searchParams;

  redirect(
    authModalHref({
      pathname: localizePathname("/", lang),
      next: typeof query.next === "string" ? query.next : undefined,
      error: typeof query.error === "string" ? query.error : undefined,
    }),
  );
}
