"use client";

import { CheckIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { updateUsername } from "@/app/account/actions";
import { FieldError } from "@/components/auth/field-error";
import { useT } from "@/components/i18n/dictionary-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialUsernameActionState } from "@/lib/account/action-state";
import { updateUsernameSchema } from "@/lib/auth/schemas";
import { cn } from "@/lib/utils";

const SAVE_DELAY_MS = 700;

export function UsernameForm({ username }: { username: string }) {
  const t = useT("account");
  const [value, setValue] = useState(username);
  const [fieldErrors, setFieldErrors] = useState<string[] | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const savedRef = useRef(username.trim());
  const requestIdRef = useRef(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const normalized = value.trim();

    if (normalized === savedRef.current) {
      setFieldErrors(undefined);
      setError(null);
      setStatus((current) => (current === "saving" ? current : "idle"));
      return;
    }

    const timer = window.setTimeout(() => {
      const parsed = updateUsernameSchema.safeParse({ username: value });

      if (!parsed.success) {
        setFieldErrors(parsed.error.flatten().fieldErrors.username);
        setError(null);
        setStatus("idle");
        return;
      }

      const requestId = ++requestIdRef.current;
      setStatus("saving");
      setFieldErrors(undefined);
      setError(null);

      startTransition(async () => {
        const formData = new FormData();
        formData.set("username", parsed.data.username);

        const result = await updateUsername(
          {
            ...initialUsernameActionState,
            values: { username: parsed.data.username },
          },
          formData,
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (result.error || result.fieldErrors.username?.length) {
          setError(result.error);
          setFieldErrors(result.fieldErrors.username);
          setStatus("idle");
          return;
        }

        savedRef.current = parsed.data.username;
        setValue(parsed.data.username);
        setStatus("saved");
      });
    }, SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [value]);

  const isSaving = status === "saving" || pending;
  const isSaved = status === "saved" && !pending;

  return (
    <div className="grid gap-2">
      <Label htmlFor="username">{t("username")}</Label>
      <div className="relative">
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          spellCheck={false}
          value={value}
          onChange={(event) => {
            setStatus("idle");
            setValue(event.target.value);
          }}
          className="pr-10"
          aria-invalid={Boolean(fieldErrors?.length || error) || undefined}
          aria-describedby={
            fieldErrors?.length || error
              ? "username-error username-hint username-status"
              : "username-hint username-status"
          }
        />
        <span
          id="username-status"
          className="pointer-events-none absolute top-1/2 right-2.5 flex size-4 -translate-y-1/2 items-center justify-center"
          aria-live="polite"
        >
          {isSaving ? (
            <Loader2Icon
              className="size-4 animate-spin text-muted-foreground"
              aria-label={t("savingUsername")}
            />
          ) : null}
          {isSaved ? (
            <CheckIcon
              className={cn("size-4 text-green-600 dark:text-green-500")}
              aria-label={t("usernameUpdated")}
            />
          ) : null}
        </span>
      </div>
      <p id="username-hint" className="text-xs text-muted-foreground">
        {t("usernameHint")}
      </p>
      <FieldError id="username-error" messages={fieldErrors} />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
