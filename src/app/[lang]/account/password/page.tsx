import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/account/change-password-form";
import { DictionaryProvider } from "@/components/i18n/dictionary-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createT } from "@/i18n/create-t";
import { isLocale } from "@/i18n/config";
import { loadDictionaries } from "@/i18n/load-dictionaries";
import { localizePathname } from "@/i18n/pathname";
import { getAuthClaims } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export const instant = false;

async function PasswordContent({ lang }: { lang: "en" | "ru" }) {
  const { claims, error } = await getAuthClaims();

  if (error || !claims) {
    redirect(localizePathname("/login", lang) + "?next=/account/password");
  }

  const dictionaries = await loadDictionaries(["account"], lang);
  const t = createT(dictionaries);

  return (
    <DictionaryProvider locale={lang} dictionaries={dictionaries}>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-16">
        <Link
          href={localizePathname("/account", lang)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-fit px-0 text-muted-foreground hover:bg-transparent",
          )}
        >
          {t("account.backToProfile")}
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{t("account.changePassword")}</CardTitle>
            <CardDescription>
              {t("account.changePasswordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </main>
    </DictionaryProvider>
  );
}

export default async function ChangePasswordPage({
  params,
}: PageProps<"/[lang]/account/password">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <PasswordContent lang={lang} />
    </Suspense>
  );
}
