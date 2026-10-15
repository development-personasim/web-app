export type PasswordFieldErrors = Partial<
  Record<"currentPassword" | "password" | "confirmPassword", string[]>
>;

export type DeleteFieldErrors = Partial<Record<"confirmEmail", string[]>>;

export type UsernameFieldErrors = Partial<Record<"username", string[]>>;

export type PasswordActionState = {
  error: string | null;
  message: string | null;
  fieldErrors: PasswordFieldErrors;
  formKey: number;
};

export type DeleteActionState = {
  error: string | null;
  fieldErrors: DeleteFieldErrors;
  values: { confirmEmail?: string };
  formKey: number;
};

export type UsernameActionState = {
  error: string | null;
  message: string | null;
  fieldErrors: UsernameFieldErrors;
  values: { username?: string };
  formKey: number;
};

export const initialPasswordActionState: PasswordActionState = {
  error: null,
  message: null,
  fieldErrors: {},
  formKey: 0,
};

export const initialDeleteActionState: DeleteActionState = {
  error: null,
  fieldErrors: {},
  values: {},
  formKey: 0,
};

export const initialUsernameActionState: UsernameActionState = {
  error: null,
  message: null,
  fieldErrors: {},
  values: {},
  formKey: 0,
};
