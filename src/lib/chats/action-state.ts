export type SendMessageFieldErrors = Partial<Record<"body" | "chatId", string[]>>;

export type SendMessageActionState = {
  error: string | null;
  fieldErrors: SendMessageFieldErrors;
  formKey: number;
};

export const initialSendMessageActionState: SendMessageActionState = {
  error: null,
  fieldErrors: {},
  formKey: 0,
};
