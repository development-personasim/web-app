import { z } from "zod";

export const personaVisibilitySchema = z.enum(["private", "public"]);

export const createPersonaSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(60, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(60, "Last name is too long"),
  visibility: personaVisibilitySchema.default("private"),
});

export type CreatePersonaInput = z.infer<typeof createPersonaSchema>;

export const PERSONA_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const PERSONA_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
