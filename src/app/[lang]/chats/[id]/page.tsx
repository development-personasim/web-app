import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { ChatThread } from "@/components/chats/chat-thread";
import { DictionaryProvider } from "@/components/i18n/dictionary-provider";
import { createT } from "@/i18n/create-t";
import { isLocale } from "@/i18n/config";
import { loadDictionaries } from "@/i18n/load-dictionaries";
import { localizePathname } from "@/i18n/pathname";
import {
  getChatById,
  isUserChatMember,
  listChatMessages,
} from "@/lib/chats/db";
import { getPersonaById } from "@/lib/personas/db";
import { getAuthClaims } from "@/lib/supabase/auth";

export const instant = false;

async function ChatContent({
  lang,
  id,
}: {
  lang: "en" | "ru";
  id: string;
}) {
  const { claims } = await getAuthClaims();
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (!userId) {
    redirect(localizePathname("/", lang) + `?modal=auth&next=/chats/${id}`);
  }

  const chat = await getChatById(id);
  if (!chat) {
    notFound();
  }

  const isMember = await isUserChatMember(chat.id, userId);
  if (!isMember) {
    notFound();
  }

  // Direct persona chats live on the persona page.
  if (chat.kind === "direct" && chat.directPersonaId) {
    redirect(localizePathname(`/personas/${chat.directPersonaId}`, lang));
  }

  const dictionaries = await loadDictionaries(["chat"], lang);
  const t = createT(dictionaries);
  const messages = await listChatMessages(chat.id);

  const title =
    chat.title ??
    (chat.directPersonaId
      ? ((await getPersonaById(chat.directPersonaId))?.firstName ?? t("chat.empty"))
      : t("chat.empty"));

  return (
    <DictionaryProvider locale={lang} dictionaries={dictionaries}>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
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

export default async function ChatPage({
  params,
}: PageProps<"/[lang]/chats/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <ChatContent lang={lang} id={id} />
    </Suspense>
  );
}
