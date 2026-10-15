import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { createT } from "@/i18n/create-t";
import { isLocale } from "@/i18n/config";
import { loadDictionaries } from "@/i18n/load-dictionaries";
import { localizePathname } from "@/i18n/pathname";
import { getAuthClaims } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

async function HomeActions({ lang }: { lang: "en" | "ru" }) {
  const { claims } = await getAuthClaims();
  if (!claims) {
    return null;
  }

  const dictionaries = await loadDictionaries(["home"], lang);
  const t = createT(dictionaries);

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={localizePathname("/personas/new", lang)}
        className={cn(buttonVariants({ size: "lg" }))}
      >
        {t("home.createPersona")}
      </Link>
      <Link
        href={localizePathname("/personas", lang)}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
      >
        {t("home.myPersonas")}
      </Link>
    </div>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  const dictionaries = await loadDictionaries(["home"], lang);
  const t = createT(dictionaries);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-20">
      <div className="grid gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {t("home.title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {t("home.description")}
        </p>
      </div>
      <Suspense fallback={null}>
        <HomeActions lang={lang} />
      </Suspense>
    </main>
  );
}
