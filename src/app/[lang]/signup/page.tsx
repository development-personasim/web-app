import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { localizePathname } from "@/i18n/pathname";
import { authModalHref } from "@/lib/modals/auth";

export const instant = false;

export default async function SignupPage({
  params,
}: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  redirect(
    authModalHref({
      pathname: localizePathname("/", lang),
      method: "email",
      view: "signup",
    }),
  );
}
