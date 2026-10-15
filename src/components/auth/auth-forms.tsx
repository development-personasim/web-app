"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useActionState, useEffect } from "react";

import { signIn, signUp } from "@/app/auth/actions";
import { AuthProviders } from "@/components/auth/auth-providers";
import { FieldError } from "@/components/auth/field-error";
import { PasswordInput } from "@/components/auth/password-input";
import { useT } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModalQuery } from "@/hooks/use-modal-query";
import { initialAuthActionState } from "@/lib/auth/action-state";
import {
  MODAL_PARAM,
  authModal,
  parseAuthModalMethod,
  parseAuthModalView,
} from "@/lib/modals/query";

function EmailSignInForm({
  next,
  emailPrefill,
}: {
  next?: string;
  emailPrefill?: string;
}) {
  const t = useT("auth-email");
  const [state, formAction, pending] = useActionState(
    signIn,
    initialAuthActionState,
  );

  return (
    <form
      key={`${state.formKey}-${emailPrefill ?? ""}`}
      action={formAction}
      className="grid gap-4"
      noValidate
    >
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="login-email">{t("email")}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values.email ?? emailPrefill ?? ""}
          aria-invalid={Boolean(state.fieldErrors.email) || undefined}
          aria-describedby={
            state.fieldErrors.email ? "login-email-error" : undefined
          }
        />
        <FieldError id="login-email-error" messages={state.fieldErrors.email} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">{t("password")}</Label>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
          defaultValue={state.values.password ?? ""}
          invalid={Boolean(state.fieldErrors.password)}
          describedBy={
            state.fieldErrors.password ? "login-password-error" : undefined
          }
        />
        <FieldError
          id="login-password-error"
          messages={state.fieldErrors.password}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? t("signingIn") : t("signIn")}
      </Button>
    </form>
  );
}

function EmailSignUpForm({ next }: { next?: string }) {
  const t = useT("auth-email");
  const { replaceParams } = useModalQuery();
  const [state, formAction, pending] = useActionState(
    signUp,
    initialAuthActionState,
  );

  useEffect(() => {
    if (state.message !== "checkEmail") {
      return;
    }

    const email = state.values.email?.trim();
    if (!email) {
      return;
    }

    replaceParams({
      [MODAL_PARAM]: authModal.id,
      method: "email",
      view: "check-email",
      email,
      next: next ?? null,
      error: null,
    });
  }, [next, replaceParams, state.message, state.values.email]);

  return (
    <form
      key={state.formKey}
      action={formAction}
      className="grid gap-4"
      noValidate
    >
      <div className="grid gap-2">
        <Label htmlFor="signup-email">{t("email")}</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values.email ?? ""}
          aria-invalid={Boolean(state.fieldErrors.email) || undefined}
          aria-describedby={
            state.fieldErrors.email ? "signup-email-error" : undefined
          }
        />
        <FieldError
          id="signup-email-error"
          messages={state.fieldErrors.email}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">{t("password")}</Label>
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
          required
          defaultValue={state.values.password ?? ""}
          invalid={Boolean(state.fieldErrors.password)}
          describedBy={
            state.fieldErrors.password
              ? "signup-password-error signup-password-hint"
              : "signup-password-hint"
          }
        />
        <p id="signup-password-hint" className="text-xs text-muted-foreground">
          {t("passwordHint")}
        </p>
        <FieldError
          id="signup-password-error"
          messages={state.fieldErrors.password}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-confirm-password">{t("confirmPassword")}</Label>
        <PasswordInput
          id="signup-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          defaultValue={state.values.confirmPassword ?? ""}
          invalid={Boolean(state.fieldErrors.confirmPassword)}
          describedBy={
            state.fieldErrors.confirmPassword
              ? "signup-confirm-password-error"
              : undefined
          }
        />
        <FieldError
          id="signup-confirm-password-error"
          messages={state.fieldErrors.confirmPassword}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? t("creatingAccount") : t("createAccount")}
      </Button>
    </form>
  );
}

function CheckEmailPanel({
  email,
  next,
}: {
  email: string;
  next?: string;
}) {
  const t = useT("auth-email");
  const { replaceParams } = useModalQuery();

  useEffect(() => {
    const goToLogin = () => {
      replaceParams({
        [MODAL_PARAM]: authModal.id,
        method: "email",
        view: "login",
        email: email || null,
        next: next ?? null,
        error: null,
      });
    };

    const timer = window.setTimeout(goToLogin, 5000);
    return () => window.clearTimeout(timer);
  }, [email, next, replaceParams]);

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground" role="status">
        {t("checkEmail")}
        {email ? (
          <>
            {" "}
            <span className="font-medium text-foreground">{email}</span>
          </>
        ) : null}
      </p>
      <Button
        type="button"
        className="w-full"
        size="lg"
        onClick={() => {
          replaceParams({
            [MODAL_PARAM]: authModal.id,
            method: "email",
            view: "login",
            email: email || null,
            next: next ?? null,
            error: null,
          });
        }}
      >
        {t("ok")}
      </Button>
    </div>
  );
}

function EmailMethodPanel({ next }: { next?: string }) {
  const { replaceParams, searchParams } = useModalQuery();
  const view = parseAuthModalView(searchParams.get("view"));
  const email = searchParams.get("email") ?? "";
  const tAuth = useT("auth");
  const tEmail = useT("auth-email");

  if (view === "check-email") {
    return <CheckEmailPanel email={email} next={next} />;
  }

  return (
    <div className="grid gap-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit gap-1.5 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => {
          replaceParams({
            [MODAL_PARAM]: authModal.id,
            view: null,
            method: null,
            email: null,
            next: next ?? null,
          });
        }}
      >
        <ArrowLeftIcon className="size-4" />
        {tAuth("backToProviders")}
      </Button>

      <Tabs
        value={view}
        onValueChange={(value) => {
          if (value === "login" || value === "signup") {
            replaceParams({
              [MODAL_PARAM]: authModal.id,
              method: "email",
              view: value,
              email: value === "login" ? email || null : null,
              next: next ?? null,
            });
          }
        }}
        className="gap-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{tEmail("signInTab")}</TabsTrigger>
          <TabsTrigger value="signup">{tEmail("signUpTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <EmailSignInForm next={next} emailPrefill={email} />
        </TabsContent>
        <TabsContent value="signup">
          <EmailSignUpForm next={next} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AuthPanel({ next }: { next?: string }) {
  const { searchParams } = useModalQuery();
  const method = parseAuthModalMethod(searchParams.get("method"));

  if (method === "email") {
    return <EmailMethodPanel next={next} />;
  }

  return <AuthProviders next={next} />;
}
