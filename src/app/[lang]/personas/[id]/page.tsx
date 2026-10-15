import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { PersonaProfile } from "@/components/personas/persona-profile";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createT } from "@/i18n/create-t";
import { isLocale } from "@/i18n/config";
import { loadDictionaries } from "@/i18n/load-dictionaries";
import { localizePathname } from "@/i18n/pathname";
import { getPersonaById } from "@/lib/personas/db";
import { getAuthClaims } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export const instant = false;

async function PersonaDetailContent({
  lang,
  id,
}: {
  lang: "en" | "ru";
  id: string;
}) {
  const persona = await getPersonaById(id);

  if (!persona) {
    notFound();
  }

  const { claims } = await getAuthClaims();
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  const isOwner = userId === persona.creatorId;

  if (persona.visibility === "private" && !isOwner) {
    if (!userId) {
      redirect(localizePathname("/login", lang) + `?next=/personas/${id}`);
    }
    notFound();
  }

  const dictionaries = await loadDictionaries(["personas"], lang);
  const t = createT(dictionaries);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-16">
      {isOwner ? (
        <Link
          href={localizePathname("/personas", lang)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-fit px-0 text-muted-foreground hover:bg-transparent",
          )}
        >
          {t("personas.backToList")}
        </Link>
      ) : null}
      <Card>
        <CardContent className="pt-6">
          <PersonaProfile
            persona={persona}
            creatorLabel={t("personas.creator")}
            privateLabel={t("personas.private")}
          />
        </CardContent>
      </Card>
    </main>
  );
}

export default async function PersonaDetailPage({
  params,
}: PageProps<"/[lang]/personas/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <PersonaDetailContent lang={lang} id={id} />
    </Suspense>
  );
}
