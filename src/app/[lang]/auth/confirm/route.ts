import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/config";
import { localizePathname } from "@/i18n/pathname";
import { safeNextPath } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/server";

function redirectTo(
  request: Request,
  path: string,
) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${path}`);
  }

  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${path}`);
  }

  return NextResponse.redirect(`${origin}${path}`);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ lang: string }> },
) {
  const { lang: langParam } = await context.params;
  const lang = isLocale(langParam) ? langParam : defaultLocale;
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextPath = safeNextPath(searchParams.get("next"), "/");
  const localizedNext = localizePathname(nextPath, lang);
  const errorPath = `${localizePathname("/", lang)}?modal=auth&error=auth-code-error`;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return redirectTo(request, localizedNext);
    }
  }

  return redirectTo(request, errorPath);
}
