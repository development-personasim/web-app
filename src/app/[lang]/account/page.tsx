import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
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
import { createClient } from "@/lib/supabase/server";

export const instant = false;

async function AccountContent({ lang }: { lang: "en" | "ru" }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect(localizePathname("/login", lang) + "?next=/account");
  }

  const dictionaries = await loadDictionaries(["account"], lang);
  const t = createT(dictionaries);

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : t("account.signedIn");
  const userId =
    typeof data.claims.sub === "string" ? data.claims.sub : "unknown";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("account.title")}</CardTitle>
          <CardDescription>{t("account.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1 text-sm">
            <p className="text-muted-foreground">{t("account.email")}</p>
            <p>{email}</p>
          </div>
          <div className="grid gap-1 text-sm">
            <p className="text-muted-foreground">{t("account.userId")}</p>
            <p className="break-all font-mono text-xs">{userId}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              {t("account.signOut")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default async function AccountPage({
  params,
}: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <AccountContent lang={lang} />
    </Suspense>
  );
}
