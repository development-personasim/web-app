"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";

import { sendChatMessage } from "@/app/chats/actions";
import { ChatMessageBubble } from "@/components/chats/chat-message-bubble";
import { useDictionary, useT } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initialSendMessageActionState } from "@/lib/chats/action-state";
import type { ChatMessageView } from "@/lib/chats/types";

export function ChatThread({
  chatId,
  initialMessages,
  currentUserId,
  emptyLabel,
}: {
  chatId: string;
  initialMessages: ChatMessageView[];
  currentUserId: string;
  emptyLabel: string;
}) {
  const t = useT("chat");
  const { locale } = useDictionary();
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandledKey = useRef(0);

  const [state, formAction, pending] = useActionState(
    sendChatMessage,
    initialSendMessageActionState,
  );

  useEffect(() => {
    setMessages(initialMessages);
    lastHandledKey.current = 0;
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only when switching chats

  useEffect(() => {
    if (state.formKey === lastHandledKey.current) {
      return;
    }

    lastHandledKey.current = state.formKey;

    if (state.messages?.length) {
      setMessages((current) => {
        const seen = new Set(current.map((message) => message.id));
        const next = state.messages!.filter((message) => !seen.has(message.id));
        return next.length ? [...current, ...next] : current;
      });
      formRef.current?.reset();
    }
  }, [state.formKey, state.messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-background">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isOwn={
                message.senderType === "user" &&
                message.senderUserId === currentUserId
              }
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="grid gap-2 border-t border-border/80 p-3"
      >
        <input type="hidden" name="lang" value={locale} />
        <input type="hidden" name="chatId" value={chatId} />
        <Textarea
          name="body"
          rows={2}
          required
          placeholder={t("placeholder")}
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors.body) || undefined}
          className="field-sizing-fixed min-h-16 resize-none"
        />
        {state.fieldErrors.body?.[0] ? (
          <p className="text-sm text-destructive" role="alert">
            {state.fieldErrors.body[0]}
          </p>
        ) : null}
        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? t("sending") : t("send")}
          </Button>
        </div>
      </form>
    </div>
  );
}
