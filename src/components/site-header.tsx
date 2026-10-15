import Link from "next/link";
import { Suspense } from "react";

import { signOut } from "@/app/auth/actions";
import { AuthLoginButton } from "@/components/auth/auth-login-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

async function HeaderAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  if (isSignedIn) {
    return (
      <>
        <Link
          href="/account"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Account
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </>
    );
  }

  return (
    <Suspense
      fallback={
        <Button variant="outline" size="sm" disabled>
          Login
        </Button>
      }
    >
      <AuthLoginButton />
    </Suspense>
  );
}

function HeaderAuthFallback() {
  return (
    <Button variant="outline" size="sm" disabled>
      Login
    </Button>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          PersonaSim
        </Link>
        <div className="flex items-center gap-2">
          <Suspense fallback={<HeaderAuthFallback />}>
            <HeaderAuth />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
