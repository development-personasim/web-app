import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login?next=/account");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "Signed in";
  const userId =
    typeof data.claims.sub === "string" ? data.claims.sub : "unknown";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Session is verified with Supabase Auth JWT claims.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1 text-sm">
            <p className="text-muted-foreground">Email</p>
            <p>{email}</p>
          </div>
          <div className="grid gap-1 text-sm">
            <p className="text-muted-foreground">User id</p>
            <p className="break-all font-mono text-xs">{userId}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
