import { z } from "zod";

export const sendChatMessageSchema = z.object({
  chatId: z.string().uuid("Invalid chat"),
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long"),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
