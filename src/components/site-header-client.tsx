"use client";

import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { AuthLoginButton } from "@/components/auth/auth-login-button";
import { useT } from "@/components/i18n/dictionary-provider";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserAvatarInfo } from "@/lib/auth/avatar";

export function HeaderBrand({ href }: { href: string }) {
  const t = useT("header");

  return (
    <Link href={href} className="text-sm font-semibold tracking-tight">
      {t("brand")}
    </Link>
  );
}

export function HeaderSignedIn({
  accountHref,
  personasHref,
  user,
}: {
  accountHref: string;
  personasHref: string;
  user: UserAvatarInfo;
}) {
  const t = useT("header");
  const label = user.username ?? user.name ?? user.email ?? t("account");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={label}
      >
        <Avatar size="sm">
          {user.imageUrl ? (
            <AvatarImage src={user.imageUrl} alt={label} />
          ) : null}
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {user.username || user.email || user.name ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                {user.username ? (
                  <p className="truncate text-sm font-medium text-foreground">
                    @{user.username}
                  </p>
                ) : user.name ? (
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                ) : null}
                {user.email ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                ) : null}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem render={<Link href={personasHref} />}>
          {t("personas")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={accountHref} />}>
          {t("account")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void signOut();
          }}
        >
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
