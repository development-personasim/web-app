import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { CreatePersonaForm } from "@/components/personas/create-persona-form";
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

async function NewPersonaContent({ lang }: { lang: "en" | "ru" }) {
  const { claims, error } = await getAuthClaims();

  if (error || !claims) {
    redirect(localizePathname("/login", lang) + "?next=/personas/new");
  }

  const dictionaries = await loadDictionaries(["personas"], lang);
  const t = createT(dictionaries);

  return (
    <DictionaryProvider locale={lang} dictionaries={dictionaries}>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-16">
        <Link
          href={localizePathname("/personas", lang)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-fit px-0 text-muted-foreground hover:bg-transparent",
          )}
        >
          {t("personas.backToList")}
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{t("personas.createTitle")}</CardTitle>
            <CardDescription>{t("personas.createDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePersonaForm />
          </CardContent>
        </Card>
      </main>
    </DictionaryProvider>
  );
}

export default async function NewPersonaPage({
  params,
}: PageProps<"/[lang]/personas/new">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <NewPersonaContent lang={lang} />
    </Suspense>
  );
}
