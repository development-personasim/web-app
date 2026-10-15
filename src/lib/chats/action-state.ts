import type { ChatMessageView } from "@/lib/chats/types";

export type SendMessageFieldErrors = Partial<Record<"body" | "chatId", string[]>>;

export type SendMessageActionState = {
  error: string | null;
  fieldErrors: SendMessageFieldErrors;
  messages: ChatMessageView[] | null;
  formKey: number;
};

export const initialSendMessageActionState: SendMessageActionState = {
  error: null,
  fieldErrors: {},
  messages: null,
  formKey: 0,
};
