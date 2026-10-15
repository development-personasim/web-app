import "server-only";

import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function getAuthClaims() {
  // Supabase JWT checks use Date.now(); defer past prerender.
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return {
    claims: data?.claims ?? null,
    error,
  };
}
