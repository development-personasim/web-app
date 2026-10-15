"use client";

import { AuthPanel } from "@/components/auth/auth-forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalQuery } from "@/hooks/use-modal-query";
import { authModal, parseAuthModalMethod } from "@/lib/modals/query";

export function AuthModalDialog() {
  const { isOpen, closeModal, searchParams } = useModalQuery();

  const open = isOpen(authModal.id);
  const nextParam = searchParams.get("next") ?? undefined;
  const errorParam = searchParams.get("error");
  const method = parseAuthModalMethod(searchParams.get("method"));

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeModal([...authModal.keys]);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {method === "email" ? "Email & password" : "Welcome"}
          </DialogTitle>
          <DialogDescription>
            {method === "email"
              ? "Sign in or create an account with your email."
              : "Continue with Google, Facebook, Apple, or Email."}
          </DialogDescription>
        </DialogHeader>
        {errorParam ? (
          <p className="text-sm text-destructive" role="alert">
            Authentication failed. Please try again.
          </p>
        ) : null}
        <AuthPanel next={nextParam} />
      </DialogContent>
    </Dialog>
  );
}
