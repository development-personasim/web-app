import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-20">
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">PersonaSim</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Web app with Supabase Auth
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Email/password auth runs through the same Supabase project that mobile
          clients can use later.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {isSignedIn ? (
          <Link href="/account" className={buttonVariants()}>
            Open account
          </Link>
        ) : (
          <>
            <Link href="/login" className={buttonVariants()}>
              Sign in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "outline" })}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
