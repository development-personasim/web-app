"use client";

import { MailIcon } from "lucide-react";
import { useActionState, type ReactNode } from "react";

import { signInWithOAuth } from "@/app/auth/actions";
import { useT } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { useModalQuery } from "@/hooks/use-modal-query";
import { initialAuthActionState } from "@/lib/auth/action-state";
import type { OAuthProvider } from "@/lib/auth/schemas";
import { MODAL_PARAM, authModal } from "@/lib/modals/query";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.1 0 8.1-4.3 8.1-6.5 0-.4 0-.7-.1-1.1H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.5l3.2 2.3C8 7.6 9.8 6.4 12 6.4c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 8.3 2.4 5.1 4.5 3.9 7.5z"
      />
      <path
        fill="#FBBC05"
        d="M12 20.8c2.5 0 4.7-.8 6.2-2.3l-3-2.4c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.4-3.9l-3.2 2.5c1.3 2.9 4.3 5.1 8.6 5.1z"
      />
      <path
        fill="#4285F4"
        d="M20.1 13.2c.1-.4.1-.7.1-1.1 0-.4 0-.7-.1-1.1H12v3.9h5.5c-.3 1.2-.9 2.1-1.8 2.7l3 2.4c1.8-1.6 2.9-4 2.9-6.8z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 8.2h2.3V5H14c-2.3 0-3.8 1.4-3.8 3.8V11H8v3.2h2.2V19h3.2v-4.8H16L16.5 11h-3.1V9c0-.5.3-.8.6-.8z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.5c0-1.8 1.5-2.7 1.5-2.7s-1.2-1.8-3.1-1.8c-1.3 0-1.8.6-2.7.6-.9 0-1.7-.7-2.8-.7-2.2 0-4.3 1.9-4.3 5.4 0 2.7 1.9 5.7 3.5 5.7.8 0 1.3-.6 2.4-.6 1.1 0 1.5.6 2.5.6 1.6 0 2.8-2.5 2.8-2.5s-2-1-2-3zm-2.1-6.2c.7-.8 1.2-1.9 1.1-3-.9.1-2.1.7-2.8 1.5-.6.7-1.2 1.8-1.1 2.9 1 .1 2.1-.5 2.8-1.4z"
      />
    </svg>
  );
}

const oauthProviders: Array<{
  id: OAuthProvider;
  labelKey: "google" | "facebook" | "apple";
  icon: ReactNode;
}> = [
  { id: "google", labelKey: "google", icon: <GoogleIcon /> },
  { id: "facebook", labelKey: "facebook", icon: <FacebookIcon /> },
  { id: "apple", labelKey: "apple", icon: <AppleIcon /> },
];

const providerButtonClassName =
  "h-11 w-full justify-start gap-3 px-4 text-sm";

export function AuthProviders({ next }: { next?: string }) {
  const { replaceParams } = useModalQuery();
  const t = useT("auth-providers");
  const [state, formAction, pending] = useActionState(
    signInWithOAuth,
    initialAuthActionState,
  );

  return (
    <div className="grid gap-2">
      {oauthProviders.map((provider) => (
        <form key={provider.id} action={formAction}>
          <input type="hidden" name="provider" value={provider.id} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className={providerButtonClassName}
            disabled={pending}
          >
            {provider.icon}
            {t("continueWith", { provider: t(provider.labelKey) })}
          </Button>
        </form>
      ))}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className={providerButtonClassName}
        onClick={() => {
          replaceParams({
            [MODAL_PARAM]: authModal.id,
            method: "email",
            view: "login",
            next: next ?? null,
          });
        }}
      >
        <MailIcon className="size-5" />
        {t("continueWith", { provider: t("email") })}
      </Button>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
