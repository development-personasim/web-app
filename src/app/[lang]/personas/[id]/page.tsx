import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ChatThread } from "@/components/chats/chat-thread";
import { PersonaChatHeader } from "@/components/chats/persona-chat-header";
import { DictionaryProvider } from "@/components/i18n/dictionary-provider";
import { buttonVariants } from "@/components/ui/button";
import { createT } from "@/i18n/create-t";
import { isLocale } from "@/i18n/config";
import { loadDictionaries } from "@/i18n/load-dictionaries";
import { localizePathname } from "@/i18n/pathname";
import {
  getOrCreateDirectPersonaChat,
  listChatMessages,
} from "@/lib/chats/db";
import { getPersonaById } from "@/lib/personas/db";
import { getAuthClaims } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

export const instant = false;

async function PersonaChatContent({
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
      redirect(localizePathname("/", lang) + `?modal=auth&next=/personas/${id}`);
    }
    notFound();
  }

  if (!userId) {
    redirect(localizePathname("/", lang) + `?modal=auth&next=/personas/${id}`);
  }

  const dictionaries = await loadDictionaries(["personas", "chat"], lang);
  const t = createT(dictionaries);

  const chat = await getOrCreateDirectPersonaChat({
    userId,
    personaId: persona.id,
  });
  const messages = await listChatMessages(chat.id);

  return (
    <DictionaryProvider locale={lang} dictionaries={dictionaries}>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
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
        <PersonaChatHeader
          persona={persona}
          privateLabel={t("personas.private")}
        />
        <ChatThread
          chatId={chat.id}
          messages={messages}
          currentUserId={userId}
          emptyLabel={t("chat.empty")}
        />
      </main>
    </DictionaryProvider>
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
      <PersonaChatContent lang={lang} id={id} />
    </Suspense>
  );
}
