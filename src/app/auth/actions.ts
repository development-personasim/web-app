"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
  message: string | null;
};

function readCredential(formData: FormData, key: "email" | "password") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readCredential(formData, "email");
  const password = readCredential(formData, "password");
  const next = formData.get("next");
  const nextPath = typeof next === "string" && next.startsWith("/") ? next : "/account";

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message, message: null };
  }

  redirect(nextPath);
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readCredential(formData, "email");
  const password = readCredential(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters.",
      message: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  if (data.session) {
    redirect("/account");
  }

  return {
    error: null,
    message: "Check your email to confirm your account.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
