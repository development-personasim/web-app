"use server";

import { getProfileUsername } from "@/lib/account/profiles";
import type { SendMessageActionState } from "@/lib/chats/action-state";
import {
  getChatById,
  insertChatMessage,
  isUserChatMember,
} from "@/lib/chats/db";
import { buildStubPersonaReply } from "@/lib/chats/persona-reply";
import { sendChatMessageSchema } from "@/lib/chats/schemas";
import type { ChatMessageView } from "@/lib/chats/types";
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
      messages: null,
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
      messages: null,
      formKey: prev.formKey + 1,
    };
  }

  const chat = await getChatById(parsed.data.chatId);
  if (!chat) {
    return {
      error: "Chat not found.",
      fieldErrors: {},
      messages: null,
      formKey: prev.formKey + 1,
    };
  }

  const isMember = await isUserChatMember(chat.id, user.id);
  if (!isMember) {
    return {
      error: "You are not a member of this chat.",
      fieldErrors: {},
      messages: null,
      formKey: prev.formKey + 1,
    };
  }

  const created: ChatMessageView[] = [];

  try {
    const username = await getProfileUsername(user.id);
    const userMessage = await insertChatMessage({
      chatId: chat.id,
      senderType: "user",
      senderUserId: user.id,
      body: parsed.data.body,
    });

    created.push({
      ...userMessage,
      senderName: username ?? "You",
      senderAvatarUrl: null,
    });

    if (chat.kind === "direct" && chat.directPersonaId) {
      const persona = await getPersonaById(chat.directPersonaId);
      if (persona) {
        const personaMessage = await insertChatMessage({
          chatId: chat.id,
          senderType: "persona",
          senderPersonaId: persona.id,
          body: buildStubPersonaReply({
            firstName: persona.firstName,
            userMessage: parsed.data.body,
          }),
        });

        created.push({
          ...personaMessage,
          senderName: `${persona.firstName} ${persona.lastName}`.trim(),
          senderAvatarUrl: persona.avatarUrl,
        });
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send message.";
    return {
      error: message,
      fieldErrors: {},
      messages: null,
      formKey: prev.formKey + 1,
    };
  }

  return {
    error: null,
    fieldErrors: {},
    messages: created,
    formKey: prev.formKey + 1,
  };
}
