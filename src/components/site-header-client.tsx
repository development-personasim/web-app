"use client";

import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { AuthLoginButton } from "@/components/auth/auth-login-button";
import { useT } from "@/components/i18n/dictionary-provider";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { Button, buttonVariants } from "@/components/ui/button";

export function HeaderBrand({ href }: { href: string }) {
  const t = useT("header");

  return (
    <Link href={href} className="text-sm font-semibold tracking-tight">
      {t("brand")}
    </Link>
  );
}

export function HeaderSignedIn({ accountHref }: { accountHref: string }) {
  const t = useT("header");

  return (
    <>
      <Link
        href={accountHref}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        {t("account")}
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm">
          {t("signOut")}
        </Button>
      </form>
    </>
  );
}

export function HeaderSignedOut() {
  return <AuthLoginButton />;
}

export function HeaderLocaleSwitcher() {
  return <LocaleSwitcher />;
}

export function HeaderLoginFallback() {
  const t = useT("header");
  return (
    <Button variant="outline" size="sm" disabled>
      {t("login")}
    </Button>
  );
}
