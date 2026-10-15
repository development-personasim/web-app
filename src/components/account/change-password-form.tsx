"use client";

import { useActionState } from "react";

import { changePassword } from "@/app/account/actions";
import { FieldError } from "@/components/auth/field-error";
import { PasswordInput } from "@/components/auth/password-input";
import { useDictionary, useT } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { initialPasswordActionState } from "@/lib/account/action-state";

export function ChangePasswordForm() {
  const t = useT("account");
  const { locale } = useDictionary();
  const [state, formAction, pending] = useActionState(
    changePassword,
    initialPasswordActionState,
  );

  return (
    <form
      key={state.formKey}
      action={formAction}
      className="grid gap-4"
      noValidate
    >
      <input type="hidden" name="lang" value={locale} />
      <div className="grid gap-2">
        <Label htmlFor="current-password">{t("currentPassword")}</Label>
        <PasswordInput
          id="current-password"
          name="currentPassword"
          autoComplete="current-password"
          required
          invalid={Boolean(state.fieldErrors.currentPassword)}
          describedBy={
            state.fieldErrors.currentPassword
              ? "current-password-error"
              : undefined
          }
        />
        <FieldError
          id="current-password-error"
          messages={state.fieldErrors.currentPassword}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="new-password">{t("newPassword")}</Label>
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          required
          invalid={Boolean(state.fieldErrors.password)}
          describedBy={
            state.fieldErrors.password
              ? "new-password-error new-password-hint"
              : "new-password-hint"
          }
        />
        <p id="new-password-hint" className="text-xs text-muted-foreground">
          {t("passwordHint")}
        </p>
        <FieldError
          id="new-password-error"
          messages={state.fieldErrors.password}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirm-new-password">{t("confirmPassword")}</Label>
        <PasswordInput
          id="confirm-new-password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          invalid={Boolean(state.fieldErrors.confirmPassword)}
          describedBy={
            state.fieldErrors.confirmPassword
              ? "confirm-new-password-error"
              : undefined
          }
        />
        <FieldError
          id="confirm-new-password-error"
          messages={state.fieldErrors.confirmPassword}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? t("savingPassword") : t("savePassword")}
      </Button>
    </form>
  );
}
