"use client";

import { Suspense } from "react";

import { AuthModalDialog } from "@/components/auth/auth-modal-dialog";
import type { Locale } from "@/i18n/config";

export function ModalHost({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={null}>
      <AuthModalDialog locale={locale} />
    </Suspense>
  );
}
