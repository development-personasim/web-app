"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { deleteAccount } from "@/app/account/actions";
import { FieldError } from "@/components/auth/field-error";
import { useDictionary, useT } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localizePathname } from "@/i18n/pathname";
import { initialDeleteActionState } from "@/lib/account/action-state";

export function DeleteAccountForm({ email }: { email: string }) {
  const t = useT("account");
  const { locale } = useDictionary();
  const router = useRouter();
  const lastHandledKey = useRef(0);
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialDeleteActionState,
  );

  useEffect(() => {
    if (state.formKey === lastHandledKey.current) {
      return;
    }
    lastHandledKey.current = state.formKey;

    if (state.deleted) {
      router.replace(localizePathname("/", locale));
    }
  }, [locale, router, state.deleted, state.formKey]);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="lang" value={locale} />
      <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
      <div className="grid gap-2">
        <Label htmlFor="confirm-email">{t("confirmEmail")}</Label>
        <Input
          id="confirm-email"
          name="confirmEmail"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder={email}
          defaultValue={state.values.confirmEmail ?? ""}
          aria-invalid={Boolean(state.fieldErrors.confirmEmail) || undefined}
          aria-describedby={
            state.fieldErrors.confirmEmail ? "confirm-email-error" : undefined
          }
        />
        <FieldError
          id="confirm-email-error"
          messages={state.fieldErrors.confirmEmail}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="destructive"
        disabled={pending || state.deleted}
        className="w-full"
        size="lg"
      >
        {pending || state.deleted ? t("deletingAccount") : t("deleteAccount")}
      </Button>
    </form>
  );
}
