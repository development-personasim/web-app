export type AuthFieldErrors = Partial<
  Record<"email" | "password" | "confirmPassword", string[]>
>;

export type AuthFormValues = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export type AuthActionState = {
  error: string | null;
  message: string | null;
  fieldErrors: AuthFieldErrors;
  values: AuthFormValues;
  formKey: number;
};

export const initialAuthActionState: AuthActionState = {
  error: null,
  message: null,
  fieldErrors: {},
  values: {},
  formKey: 0,
};
