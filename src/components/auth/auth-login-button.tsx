"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useModalQuery } from "@/hooks/use-modal-query";
import { authModal } from "@/lib/modals/query";

export function AuthLoginButton() {
  const { hrefForModal } = useModalQuery();

  return (
    <Link
        href={hrefForModal(authModal.id)}
      className={buttonVariants({ variant: "outline", size: "sm" })}
      scroll={false}
    >
      Login
    </Link>
  );
}
