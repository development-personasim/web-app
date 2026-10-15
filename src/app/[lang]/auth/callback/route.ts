import { NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/config";
import { localizePathname } from "@/i18n/pathname";
import { safeNextPath } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ lang: string }> },
) {
  const { lang: langParam } = await context.params;
  const lang = isLocale(langParam) ? langParam : defaultLocale;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = safeNextPath(searchParams.get("next"), "/");
  const localizedNext = localizePathname(nextPath, lang);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${localizedNext}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${localizedNext}`);
      }

      return NextResponse.redirect(`${origin}${localizedNext}`);
    }
  }

  return NextResponse.redirect(
    `${origin}${localizePathname("/", lang)}?modal=auth&error=auth-code-error`,
  );
}
