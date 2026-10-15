"use server";

import { redirect } from "next/navigation";

import type { AuthActionState } from "@/lib/auth/action-state";
import {
  isOAuthProvider,
  signInSchema,
  signUpSchema,
  type OAuthProvider,
} from "@/lib/auth/schemas";
import { getSiteUrl, safeNextPath } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/server";

function mapAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirm your email before signing in.";
  }

  if (normalized.includes("user already registered")) {
    return "An account with this email already exists.";
  }

  if (normalized.includes("provider is not enabled")) {
    return "This sign-in provider is not enabled yet. Enable it in Supabase Auth settings.";
  }

  return message;
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
    next: readFormString(formData, "next") || undefined,
  });

  if (!parsed.success) {
    return {
      error: null,
      message: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const nextPath = safeNextPath(parsed.data.next);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: mapAuthError(error.message),
      message: null,
      fieldErrors: {},
    };
  }

  redirect(nextPath);
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
    confirmPassword: readFormString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: null,
      message: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/`,
    },
  });

  if (error) {
    return {
      error: mapAuthError(error.message),
      message: null,
      fieldErrors: {},
    };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    error: null,
    message: "checkEmail",
    fieldErrors: {},
  };
}

export async function signInWithOAuth(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const providerValue = readFormString(formData, "provider");
  if (!isOAuthProvider(providerValue)) {
    return {
      error: "Unsupported sign-in provider.",
      message: null,
      fieldErrors: {},
    };
  }

  const provider = providerValue as OAuthProvider;
  const nextPath = safeNextPath(readFormString(formData, "next") || "/");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      ...(provider === "google"
        ? {
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          }
        : {}),
    },
  });

  if (error) {
    return {
      error: mapAuthError(error.message),
      message: null,
      fieldErrors: {},
    };
  }

  if (!data.url) {
    return {
      error: "Could not start provider sign-in.",
      message: null,
      fieldErrors: {},
    };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
