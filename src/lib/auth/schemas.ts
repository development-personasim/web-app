import { z } from "zod";

export const emailSchema = z
  .email("Enter a valid email address")
  .max(254, "Email is too long")
  .transform((value) => value.trim().toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(72, "Password is too long"),
  next: z.string().optional(),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export const oauthProviders = ["google", "facebook", "apple"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (oauthProviders as readonly string[]).includes(value);
}
