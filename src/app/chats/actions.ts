"use server";

import { revalidatePath } from "next/cache";

import { getActionLocale } from "@/i18n/action-locale";
import { localizePathname } from "@/i18n/pathname";
import type { SendMessageActionState } from "@/lib/chats/action-state";
import {
  getChatById,
  insertChatMessage,
  isUserChatMember,
} from "@/lib/chats/db";
import { buildStubPersonaReply } from "@/lib/chats/persona-reply";
import { sendChatMessageSchema } from "@/lib/chats/schemas";
import { getPersonaById } from "@/lib/personas/db";
import { createClient } from "@/lib/supabase/server";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function sendChatMessage(
  prev: SendMessageActionState,
  formData: FormData,
): Promise<SendMessageActionState> {
  const parsed = sendChatMessageSchema.safeParse({
    chatId: readFormString(formData, "chatId"),
    body: readFormString(formData, "body"),
  });

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
      formKey: prev.formKey + 1,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return {
      error: "You must be signed in to send messages.",
      fieldErrors: {},
      formKey: prev.formKey + 1,
    };
  }

  const chat = await getChatById(parsed.data.chatId);
  if (!chat) {
    return {
      error: "Chat not found.",
      fieldErrors: {},
      formKey: prev.formKey + 1,
    };
  }

  const isMember = await isUserChatMember(chat.id, user.id);
  if (!isMember) {
    return {
      error: "You are not a member of this chat.",
      fieldErrors: {},
      formKey: prev.formKey + 1,
    };
  }

  try {
    await insertChatMessage({
      chatId: chat.id,
      senderType: "user",
      senderUserId: user.id,
      body: parsed.data.body,
    });

    if (chat.kind === "direct" && chat.directPersonaId) {
      const persona = await getPersonaById(chat.directPersonaId);
      if (persona) {
        await insertChatMessage({
          chatId: chat.id,
          senderType: "persona",
          senderPersonaId: persona.id,
          body: buildStubPersonaReply({
            firstName: persona.firstName,
            userMessage: parsed.data.body,
          }),
        });
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send message.";
    return {
      error: message,
      fieldErrors: {},
      formKey: prev.formKey + 1,
    };
  }

  const locale = await getActionLocale(formData);
  if (chat.kind === "direct" && chat.directPersonaId) {
    revalidatePath(localizePathname(`/personas/${chat.directPersonaId}`, locale));
  }
  revalidatePath(localizePathname(`/chats/${chat.id}`, locale));

  return {
    error: null,
    fieldErrors: {},
    formKey: prev.formKey + 1,
  };
}
