export type AuthFieldErrors = Partial<
  Record<"email" | "password" | "confirmPassword", string[]>
>;

export type AuthActionState = {
  error: string | null;
  message: string | null;
  fieldErrors: AuthFieldErrors;
};

export const initialAuthActionState: AuthActionState = {
  error: null,
  message: null,
  fieldErrors: {},
};
