import type { PersonaWithCreator } from "@/lib/personas/types";

export type PersonaFieldErrors = Partial<
  Record<"firstName" | "lastName" | "avatar" | "visibility", string[]>
>;

export type PersonaFormValues = {
  firstName?: string;
  lastName?: string;
};

export type CreatePersonaActionState = {
  error: string | null;
  fieldErrors: PersonaFieldErrors;
  values: PersonaFormValues;
  persona: PersonaWithCreator | null;
  formKey: number;
};

export const initialCreatePersonaActionState: CreatePersonaActionState = {
  error: null,
  fieldErrors: {},
  values: {},
  persona: null,
  formKey: 0,
};
