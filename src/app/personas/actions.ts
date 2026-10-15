"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

import { getActionLocale } from "@/i18n/action-locale";
import { localizePathname } from "@/i18n/pathname";
import type { CreatePersonaActionState } from "@/lib/personas/action-state";
import { createPersona } from "@/lib/personas/db";
import { createPersonaSchema } from "@/lib/personas/schemas";
import { uploadPersonaAvatar } from "@/lib/personas/storage";
import { createClient } from "@/lib/supabase/server";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readFormFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function createPersonaAction(
  prev: CreatePersonaActionState,
  formData: FormData,
): Promise<CreatePersonaActionState> {
  const values = {
    firstName: readFormString(formData, "firstName"),
    lastName: readFormString(formData, "lastName"),
  };

  const parsed = createPersonaSchema.safeParse({
    ...values,
    visibility: "private",
  });

  if (!parsed.success) {
    return {
      error: null,
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
      error: "You must be signed in to create a persona.",
      fieldErrors: {},
      values,
      formKey: prev.formKey + 1,
    };
  }

  const personaId = randomUUID();
  const avatarFile = readFormFile(formData, "avatar");
  let avatarUrl: string | null = null;

  if (avatarFile) {
    try {
      avatarUrl = await uploadPersonaAvatar({
        creatorId: user.id,
        personaId,
        file: avatarFile,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not upload avatar.";
      return {
        error: message,
        fieldErrors: { avatar: [message] },
        values,
        formKey: prev.formKey + 1,
      };
    }
  }

  try {
    await createPersona({
      id: personaId,
      creatorId: user.id,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      avatarUrl,
      visibility: "private",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create persona.";
    return {
      error: message,
      fieldErrors: {},
      values,
      formKey: prev.formKey + 1,
    };
  }

  const locale = await getActionLocale(formData);
  redirect(localizePathname(`/personas/${personaId}`, locale));
}
