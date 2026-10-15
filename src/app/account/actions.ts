"use server";

import type {
  DeleteActionState,
  PasswordActionState,
  UsernameActionState,
} from "@/lib/account/action-state";
import {
  deleteProfile,
  isUniqueViolation,
  upsertProfileUsername,
} from "@/lib/account/profiles";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateUsernameSchema,
} from "@/lib/auth/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function mapAccountError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Current password is incorrect.";
  }

  if (normalized.includes("same password")) {
    return "New password must be different from the current password.";
  }

  if (normalized.includes("password")) {
    return message;
  }

  return message;
}

export async function updateUsername(
  prev: UsernameActionState,
  formData: FormData,
): Promise<UsernameActionState> {
  const values = {
    username: readFormString(formData, "username"),
  };

  const parsed = updateUsernameSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: null,
      message: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
      formKey: prev.formKey + 1,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return {
      error: "You must be signed in to update your username.",
      message: null,
      fieldErrors: {},
      values,
      formKey: prev.formKey + 1,
    };
  }

  try {
    await upsertProfileUsername(user.id, parsed.data.username);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error: null,
        message: null,
        fieldErrors: {
          username: ["This username is already taken."],
        },
        values,
        formKey: prev.formKey + 1,
      };
    }

    const message =
      error instanceof Error ? error.message : "Could not update username.";
    return {
      error: mapAccountError(message),
      message: null,
      fieldErrors: {},
      values,
      formKey: prev.formKey + 1,
    };
  }

  const { error } = await supabase.auth.updateUser({
    data: { username: parsed.data.username },
  });

  if (error) {
    return {
      error: mapAccountError(error.message),
      message: null,
      fieldErrors: {},
      values,
      formKey: prev.formKey + 1,
    };
  }

  return {
    error: null,
    message: "updated",
    fieldErrors: {},
    values: { username: parsed.data.username },
    formKey: prev.formKey,
  };
}

export async function changePassword(
  prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const values = {
    currentPassword: readFormString(formData, "currentPassword"),
    password: readFormString(formData, "password"),
    confirmPassword: readFormString(formData, "confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: null,
      message: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
      formKey: prev.formKey + 1,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return {
      error: "You must be signed in to change your password.",
      message: null,
      fieldErrors: {},
      formKey: prev.formKey + 1,
    };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (reauthError) {
    return {
      error: mapAccountError(reauthError.message),
      message: null,
      fieldErrors: {},
      formKey: prev.formKey + 1,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: mapAccountError(error.message),
      message: null,
      fieldErrors: {},
      formKey: prev.formKey + 1,
    };
  }

  return {
    error: null,
    message: "updated",
    fieldErrors: {},
    formKey: prev.formKey + 1,
  };
}

export async function deleteAccount(
  prev: DeleteActionState,
  formData: FormData,
): Promise<DeleteActionState> {
  const values = {
    confirmEmail: readFormString(formData, "confirmEmail"),
  };

  const parsed = deleteAccountSchema.safeParse(values);

  if (!parsed.success) {
    return {
      error: null,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
      deleted: false,
      formKey: prev.formKey + 1,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email || !user.id) {
    return {
      error: "You must be signed in to delete your account.",
      fieldErrors: {},
      values,
      deleted: false,
      formKey: prev.formKey + 1,
    };
  }

  if (user.email.toLowerCase() !== parsed.data.confirmEmail) {
    return {
      error: null,
      fieldErrors: {
        confirmEmail: ["Email does not match your account."],
      },
      values,
      deleted: false,
      formKey: prev.formKey + 1,
    };
  }

  try {
    await deleteProfile(user.id);
  } catch {
    // Profile row may not exist yet.
  }

  try {
    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return {
        error: mapAccountError(deleteError.message),
        fieldErrors: {},
        values,
        deleted: false,
        formKey: prev.formKey + 1,
      };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete account.";
    return {
      error: mapAccountError(message),
      fieldErrors: {},
      values,
      deleted: false,
      formKey: prev.formKey + 1,
    };
  }

  await supabase.auth.signOut();

  return {
    error: null,
    fieldErrors: {},
    values: {},
    deleted: true,
    formKey: prev.formKey + 1,
  };
}
