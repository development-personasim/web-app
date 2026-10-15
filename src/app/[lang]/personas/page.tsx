import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { DictionaryProvider } from "@/components/i18n/dictionary-provider";
import { PersonaList } from "@/components/personas/persona-list";
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
import { listPersonasByCreator } from "@/lib/personas/db";
import { getAuthClaims } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export const instant = false;

async function PersonasContent({ lang }: { lang: "en" | "ru" }) {
  const { claims, error } = await getAuthClaims();
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (error || !userId) {
    redirect(localizePathname("/login", lang) + "?next=/personas");
  }

  const dictionaries = await loadDictionaries(["personas"], lang);
  const t = createT(dictionaries);
  const personas = await listPersonasByCreator(userId);

  return (
    <DictionaryProvider locale={lang} dictionaries={dictionaries}>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-16">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
            <div className="grid gap-1.5">
              <CardTitle>{t("personas.title")}</CardTitle>
              <CardDescription>{t("personas.description")}</CardDescription>
            </div>
            <Link
              href={localizePathname("/personas/new", lang)}
              className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
            >
              {t("personas.create")}
            </Link>
          </CardHeader>
          <CardContent>
            <PersonaList
              initialPersonas={personas}
              locale={lang}
              emptyLabel={t("personas.empty")}
              privateLabel={t("personas.private")}
            />
          </CardContent>
        </Card>
      </main>
    </DictionaryProvider>
  );
}

export default async function PersonasPage({
  params,
}: PageProps<"/[lang]/personas">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <PersonasContent lang={lang} />
    </Suspense>
  );
}
