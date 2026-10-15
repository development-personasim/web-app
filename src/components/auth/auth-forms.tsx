"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useActionState } from "react";

import { signIn, signUp } from "@/app/auth/actions";
import { AuthProviders } from "@/components/auth/auth-providers";
import { FieldError } from "@/components/auth/field-error";
import { PasswordInput } from "@/components/auth/password-input";
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

function EmailSignInForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(
    signIn,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-invalid={Boolean(state.fieldErrors.email) || undefined}
          aria-describedby={
            state.fieldErrors.email ? "login-email-error" : undefined
          }
        />
        <FieldError id="login-email-error" messages={state.fieldErrors.email} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
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
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

function EmailSignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
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
        <Label htmlFor="signup-password">Password</Label>
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
          required
          invalid={Boolean(state.fieldErrors.password)}
          describedBy={
            state.fieldErrors.password
              ? "signup-password-error signup-password-hint"
              : "signup-password-hint"
          }
        />
        <p id="signup-password-hint" className="text-xs text-muted-foreground">
          At least 8 characters, with a letter and a number.
        </p>
        <FieldError
          id="signup-password-error"
          messages={state.fieldErrors.password}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-confirm-password">Confirm password</Label>
        <PasswordInput
          id="signup-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          required
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
      {state.message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

function EmailMethodPanel({ next }: { next?: string }) {
  const { replaceParams, searchParams } = useModalQuery();
  const view = parseAuthModalView(searchParams.get("view"));

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
            next: next ?? null,
          });
        }}
      >
        <ArrowLeftIcon className="size-4" />
        All sign-in options
      </Button>

      <Tabs
        value={view}
        onValueChange={(value) => {
          if (value === "login" || value === "signup") {
            replaceParams({
              [MODAL_PARAM]: authModal.id,
              method: "email",
              view: value,
              next: next ?? null,
            });
          }
        }}
        className="gap-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <EmailSignInForm next={next} />
        </TabsContent>
        <TabsContent value="signup">
          <EmailSignUpForm />
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
