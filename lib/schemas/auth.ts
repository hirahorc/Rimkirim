import { z } from "zod";

// Validation messages are i18n keys, resolved by `t(...)` at render time.

export const loginSchema = z.object({
  email: z
    .string({ message: "err.required" })
    .min(1, "err.required")
    .email("auth.emailInvalid"),
  password: z.string({ message: "err.required" }).min(1, "err.required"),
});

export const signupSchema = z.object({
  name: z.string({ message: "err.required" }).min(1, "err.required"),
  email: z
    .string({ message: "err.required" })
    .min(1, "err.required")
    .email("auth.emailInvalid"),
  password: z
    .string({ message: "err.required" })
    .min(6, "auth.passwordTooShort"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
