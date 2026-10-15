"use client";

import { Suspense } from "react";

import { AuthModalDialog } from "@/components/auth/auth-modal-dialog";

/**
 * Mounts every query-driven modal once at the app shell.
 * Open with ?modal=<id> (and modal-specific params like view=login).
 */
export function ModalHost() {
  return (
    <Suspense fallback={null}>
      <AuthModalDialog />
    </Suspense>
  );
}
