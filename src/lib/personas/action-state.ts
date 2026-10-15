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
  formKey: number;
};

export const initialCreatePersonaActionState: CreatePersonaActionState = {
  error: null,
  fieldErrors: {},
  values: {},
  formKey: 0,
};
