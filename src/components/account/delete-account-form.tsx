"use client";

import { useActionState } from "react";

import { deleteAccount } from "@/app/account/actions";
import { FieldError } from "@/components/auth/field-error";
import { useDictionary, useT } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialDeleteActionState } from "@/lib/account/action-state";

export function DeleteAccountForm({ email }: { email: string }) {
  const t = useT("account");
  const { locale } = useDictionary();
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialDeleteActionState,
  );

  return (
    <form
      key={state.formKey}
      action={formAction}
      className="grid gap-4"
      noValidate
    >
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
        disabled={pending}
        className="w-full"
        size="lg"
      >
        {pending ? t("deletingAccount") : t("deleteAccount")}
      </Button>
    </form>
  );
}
