import { NextResponse, type NextRequest } from "next/server";

import {
  copyCookies,
  prepareLocaleRequest,
  withLocaleCookie,
} from "@/lib/i18n/proxy";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const prepared = prepareLocaleRequest(request);

  if (prepared.redirect) {
    return prepared.redirect;
  }

  const sessionResponse = await updateSession(prepared.request);

  if (sessionResponse.headers.get("location")) {
    return withLocaleCookie(sessionResponse, prepared.locale);
  }

  if (prepared.rewriteTo) {
    const rewriteResponse = NextResponse.rewrite(prepared.rewriteTo);
    copyCookies(sessionResponse, rewriteResponse);
    return withLocaleCookie(rewriteResponse, prepared.locale);
  }

  return withLocaleCookie(sessionResponse, prepared.locale);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
