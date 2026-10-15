import { Suspense } from "react";

import {
  HeaderBrand,
  HeaderLocaleSwitcher,
  HeaderLoginFallback,
  HeaderSignedIn,
  HeaderSignedOut,
} from "@/components/site-header-client";
import { userAvatarFromClaims } from "@/lib/auth/avatar";
import { getLocale } from "@/i18n/load-dictionaries";
import { localizePathname } from "@/i18n/pathname";
import { getAuthClaims } from "@/lib/supabase/auth";

async function HeaderAuth() {
  const locale = await getLocale();
  const { claims } = await getAuthClaims();

  if (claims) {
    return (
      <HeaderSignedIn
        accountHref={localizePathname("/account", locale)}
        personasHref={localizePathname("/personas", locale)}
        user={userAvatarFromClaims(claims)}
      />
    );
  }

  return <HeaderSignedOut />;
}

export async function SiteHeader() {
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <HeaderBrand href={localizePathname("/", locale)} />
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <HeaderLocaleSwitcher />
          </Suspense>
          <Suspense fallback={<HeaderLoginFallback />}>
            <HeaderAuth />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
