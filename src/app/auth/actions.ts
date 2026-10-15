"use server";

import { redirect } from "next/navigation";

import type { AuthActionState, AuthFormValues } from "@/lib/auth/action-state";
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

function nextFormKey(prev: AuthActionState) {
  return prev.formKey + 1;
}

function failureState(
  prev: AuthActionState,
  input: {
    error?: string | null;
    message?: string | null;
    fieldErrors?: AuthActionState["fieldErrors"];
    values?: AuthFormValues;
  },
): AuthActionState {
  return {
    error: input.error ?? null,
    message: input.message ?? null,
    fieldErrors: input.fieldErrors ?? {},
    values: input.values ?? {},
    formKey: nextFormKey(prev),
  };
}

export async function signIn(
  prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = {
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
  };

  const parsed = signInSchema.safeParse({
    ...values,
    next: readFormString(formData, "next") || undefined,
  });

  if (!parsed.success) {
    return failureState(prev, {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    });
  }

  const nextPath = safeNextPath(parsed.data.next);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return failureState(prev, {
      error: mapAuthError(error.message),
      values: { email: values.email },
    });
  }

  redirect(nextPath);
}

export async function signUp(
  prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = {
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
    confirmPassword: readFormString(formData, "confirmPassword"),
  };

  const parsed = signUpSchema.safeParse(values);

  if (!parsed.success) {
    return failureState(prev, {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    });
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
    return failureState(prev, {
      error: mapAuthError(error.message),
      values: { email: values.email },
    });
  }

  if (data.session) {
    redirect("/");
  }

  return failureState(prev, {
    message: "checkEmail",
    values: { email: values.email },
  });
}

export async function signInWithOAuth(
  prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const providerValue = readFormString(formData, "provider");
  if (!isOAuthProvider(providerValue)) {
    return failureState(prev, {
      error: "Unsupported sign-in provider.",
    });
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
    return failureState(prev, {
      error: mapAuthError(error.message),
    });
  }

  if (!data.url) {
    return failureState(prev, {
      error: "Could not start provider sign-in.",
    });
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
