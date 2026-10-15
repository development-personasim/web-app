"use client";

import { useActionState, useEffect, useRef } from "react";

import { sendChatMessage } from "@/app/chats/actions";
import { useDictionary, useT } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { initialSendMessageActionState } from "@/lib/chats/action-state";

export function ChatComposer({ chatId }: { chatId: string }) {
  const t = useT("chat");
  const { locale } = useDictionary();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    sendChatMessage,
    initialSendMessageActionState,
  );

  useEffect(() => {
    if (!pending && !state.error && !state.fieldErrors.body?.length) {
      formRef.current?.reset();
    }
  }, [pending, state.error, state.fieldErrors.body, state.formKey]);

  return (
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
        className="min-h-16 resize-none"
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
  );
}
