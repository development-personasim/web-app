import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  PERSONA_AVATAR_MAX_BYTES,
  PERSONA_AVATAR_MIME_TYPES,
} from "@/lib/personas/schemas";

const BUCKET = "persona-avatars";

let ensured = false;

function extensionForMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export async function ensurePersonaAvatarBucket() {
  if (ensured) {
    return;
  }

  const admin = createAdminClient();
  const { data: buckets, error } = await admin.storage.listBuckets();

  if (error) {
    throw new Error(error.message);
  }

  const exists = buckets?.some((bucket) => bucket.name === BUCKET);
  if (!exists) {
    const { error: createError } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: PERSONA_AVATAR_MAX_BYTES,
      allowedMimeTypes: [...PERSONA_AVATAR_MIME_TYPES],
    });

    if (createError && !createError.message.toLowerCase().includes("already")) {
      throw new Error(createError.message);
    }
  }

  ensured = true;
}

export async function uploadPersonaAvatar(input: {
  creatorId: string;
  personaId: string;
  file: File;
}) {
  if (!PERSONA_AVATAR_MIME_TYPES.includes(input.file.type as never)) {
    throw new Error("Avatar must be a JPEG, PNG, or WebP image.");
  }

  if (input.file.size > PERSONA_AVATAR_MAX_BYTES) {
    throw new Error("Avatar must be 2 MB or smaller.");
  }

  const extension = extensionForMime(input.file.type);
  if (!extension) {
    throw new Error("Unsupported avatar image type.");
  }

  await ensurePersonaAvatarBucket();

  const admin = createAdminClient();
  const path = `${input.creatorId}/${input.personaId}.${extension}`;
  const bytes = new Uint8Array(await input.file.arrayBuffer());

  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: input.file.type,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
