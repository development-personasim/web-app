import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { signOut } from "@/app/auth/actions";
import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { UsernameForm } from "@/components/account/username-form";
import { DictionaryProvider } from "@/components/i18n/dictionary-provider";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { getProfileUsername } from "@/lib/account/profiles";
import { usernameFromClaims } from "@/lib/auth/avatar";
import { getAuthClaims } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export const instant = false;

async function AccountContent({
  lang,
  passwordUpdated,
}: {
  lang: "en" | "ru";
  passwordUpdated: boolean;
}) {
  const { claims, error } = await getAuthClaims();

  if (error || !claims) {
    redirect(localizePathname("/login", lang) + "?next=/account");
  }

  const dictionaries = await loadDictionaries(["account"], lang);
  const t = createT(dictionaries);

  const email =
    typeof claims.email === "string" ? claims.email : t("account.signedIn");
  const userId = typeof claims.sub === "string" ? claims.sub : null;
  const usernameFromAuth = usernameFromClaims(claims);
  const usernameFromDb = userId ? await getProfileUsername(userId) : null;
  const username = usernameFromAuth ?? usernameFromDb ?? "";
  const passwordHref = localizePathname("/account/password", lang);

  return (
    <DictionaryProvider locale={lang} dictionaries={dictionaries}>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>{t("account.title")}</CardTitle>
            <CardDescription>{t("account.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {passwordUpdated ? (
              <p className="text-sm text-muted-foreground" role="status">
                {t("account.passwordUpdated")}
              </p>
            ) : null}
            <div className="grid gap-1 text-sm">
              <p className="text-muted-foreground">{t("account.email")}</p>
              <p>{email}</p>
            </div>
            <UsernameForm username={username} />
            <Link
              href={passwordHref}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              {t("account.changePassword")}
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="ghost" className="w-full">
                {t("account.signOut")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("account.dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeleteAccountForm email={email} />
          </CardContent>
        </Card>
      </main>
    </DictionaryProvider>
  );
}

export default async function AccountPage({
  params,
  searchParams,
}: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const query = await searchParams;
  const passwordUpdated = query.password === "updated";

  return (
    <Suspense fallback={null}>
      <AccountContent lang={lang} passwordUpdated={passwordUpdated} />
    </Suspense>
  );
}
