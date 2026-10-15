"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { createPersonaAction } from "@/app/personas/actions";
import { FieldError } from "@/components/auth/field-error";
import { useDictionary, useT } from "@/components/i18n/dictionary-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localizePathname } from "@/i18n/pathname";
import { initialCreatePersonaActionState } from "@/lib/personas/action-state";
import type { PersonaWithCreator } from "@/lib/personas/types";

export function CreatePersonaForm({
  onCreated,
}: {
  onCreated?: (persona: PersonaWithCreator) => void;
} = {}) {
  const t = useT("personas");
  const { locale } = useDictionary();
  const router = useRouter();
  const lastHandledKey = useRef(0);
  const [state, formAction, pending] = useActionState(
    createPersonaAction,
    initialCreatePersonaActionState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.formKey === lastHandledKey.current) {
      return;
    }
    lastHandledKey.current = state.formKey;

    if (!state.persona) {
      return;
    }

    onCreated?.(state.persona);
    router.push(localizePathname(`/personas/${state.persona.id}`, locale));
  }, [locale, onCreated, router, state.formKey, state.persona]);

  const initials = [
    state.values.firstName?.[0] ?? "",
    state.values.lastName?.[0] ?? "",
  ]
    .join("")
    .toUpperCase() || "?";

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input type="hidden" name="lang" value={locale} />
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {previewUrl ? <AvatarImage src={previewUrl} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="persona-avatar">{t("avatar")}</Label>
          <Input
            id="persona-avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setPreviewUrl(null);
                return;
              }
              setPreviewUrl(URL.createObjectURL(file));
            }}
            aria-invalid={Boolean(state.fieldErrors.avatar) || undefined}
            aria-describedby={
              state.fieldErrors.avatar
                ? "persona-avatar-error persona-avatar-hint"
                : "persona-avatar-hint"
            }
          />
          <p id="persona-avatar-hint" className="text-xs text-muted-foreground">
            {t("avatarHint")}
          </p>
          <FieldError
            id="persona-avatar-error"
            messages={state.fieldErrors.avatar}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="persona-first-name">{t("firstName")}</Label>
          <Input
            id="persona-first-name"
            name="firstName"
            autoComplete="given-name"
            required
            defaultValue={state.values.firstName ?? ""}
            aria-invalid={Boolean(state.fieldErrors.firstName) || undefined}
            aria-describedby={
              state.fieldErrors.firstName
                ? "persona-first-name-error"
                : undefined
            }
          />
          <FieldError
            id="persona-first-name-error"
            messages={state.fieldErrors.firstName}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="persona-last-name">{t("lastName")}</Label>
          <Input
            id="persona-last-name"
            name="lastName"
            autoComplete="family-name"
            required
            defaultValue={state.values.lastName ?? ""}
            aria-invalid={Boolean(state.fieldErrors.lastName) || undefined}
            aria-describedby={
              state.fieldErrors.lastName ? "persona-last-name-error" : undefined
            }
          />
          <FieldError
            id="persona-last-name-error"
            messages={state.fieldErrors.lastName}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t("privateDefault")}</p>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending || Boolean(state.persona)}
        size="lg"
        className="w-full"
      >
        {pending || state.persona ? t("creating") : t("create")}
      </Button>
    </form>
  );
}
