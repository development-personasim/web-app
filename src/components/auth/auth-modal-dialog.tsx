"use client";

import { useEffect, useState } from "react";

import { AuthPanel } from "@/components/auth/auth-forms";
import { DictionaryProvider, useT } from "@/components/i18n/dictionary-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalQuery } from "@/hooks/use-modal-query";
import type { Locale } from "@/i18n/config";
import { loadClientDictionaries } from "@/i18n/load-dictionaries.client";
import {
  authModal,
  parseAuthModalMethod,
  parseAuthModalView,
} from "@/lib/modals/query";

function AuthModalContent({
  method,
  view,
  nextParam,
  errorParam,
}: {
  method: "email" | null;
  view: "login" | "signup" | "check-email";
  nextParam?: string;
  errorParam: string | null;
}) {
  const t = useT("auth");

  const title =
    view === "check-email"
      ? t("checkEmailTitle")
      : method === "email"
        ? t("emailTitle")
        : t("welcomeTitle");

  const description =
    view === "check-email"
      ? t("checkEmailDescription")
      : method === "email"
        ? t("emailDescription")
        : t("welcomeDescription");

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {errorParam ? (
        <p className="text-sm text-destructive" role="alert">
          {t("authFailed")}
        </p>
      ) : null}
      <AuthPanel next={nextParam} />
    </DialogContent>
  );
}

export function AuthModalDialog({ locale }: { locale: Locale }) {
  const { isOpen, closeModal, searchParams } = useModalQuery();
  const open = isOpen(authModal.id);
  const nextParam = searchParams.get("next") ?? undefined;
  const errorParam = searchParams.get("error");
  const method = parseAuthModalMethod(searchParams.get("method"));
  const view = parseAuthModalView(searchParams.get("view"));

  const [dictionaries, setDictionaries] = useState<Record<
    string,
    Record<string, string>
  > | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    void loadClientDictionaries(locale, [
      "auth",
      "auth-providers",
      "auth-email",
    ]).then((loaded) => {
      if (!cancelled) {
        setDictionaries(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [locale, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeModal([...authModal.keys]);
        }
      }}
    >
      {dictionaries ? (
        <DictionaryProvider locale={locale} dictionaries={dictionaries}>
          <AuthModalContent
            method={method}
            view={view}
            nextParam={nextParam}
            errorParam={errorParam}
          />
        </DictionaryProvider>
      ) : open ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>...</DialogTitle>
            <DialogDescription>...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
