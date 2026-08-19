import { z } from "zod";

// Validation messages are i18n keys, resolved by `t(...)` at render time.

export const emailSchema = z.object({
  email: z
    .string({ message: "err.required" })
    .min(1, "err.required")
    .email("auth.emailInvalid"),
});

export const nameSchema = z.object({
  name: z.string({ message: "err.required" }).min(1, "err.required"),
});

export type EmailValues = z.infer<typeof emailSchema>;
export type NameValues = z.infer<typeof nameSchema>;
