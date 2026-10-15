"use client";

import Link from "next/link";

import { useT } from "@/components/i18n/dictionary-provider";
import { buttonVariants } from "@/components/ui/button";
import { useModalQuery } from "@/hooks/use-modal-query";
import { authModal } from "@/lib/modals/query";

export function AuthLoginButton() {
  const { hrefForModal } = useModalQuery();
  const t = useT("header");

  return (
    <Link
      href={hrefForModal(authModal.id)}
      className={buttonVariants({ variant: "outline", size: "sm" })}
      scroll={false}
    >
      {t("login")}
    </Link>
  );
}
