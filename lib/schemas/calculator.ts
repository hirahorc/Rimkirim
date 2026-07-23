import { z } from "zod";

// Validation messages are i18n keys, resolved by `t(...)` at render time.
export const packageSchema = z.object({
  weight: z.number({ message: "err.required" }).positive("err.weightPositive"),
  length: z.number({ message: "err.required" }).positive("err.required"),
  width: z.number({ message: "err.required" }).positive("err.required"),
  height: z.number({ message: "err.required" }).positive("err.required"),
  // left empty = 1 package; consumers coerce with `Number(...) || 1`
  quantity: z.number().int().min(1, "err.min1").optional(),
  // per-package optional condition flags
  nonStandardPackaging: z.boolean(),
  nonStackable: z.boolean(),
});

export const addressSchema = z.object({
  country: z.string().min(2, "err.selectCountry"),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  detail: z.string().optional(),
});

export const calculatorSchema = z
  .object({
    service: z.enum(["bfg", "moving-abroad"]),
    mode: z.enum(["base", "advance"]),
    origin: addressSchema,
    destination: addressSchema,
    packages: z.array(packageSchema),
  })
  .superRefine((val, ctx) => {
    if (val.origin.country && val.origin.country === val.destination.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "err.sameCountry",
        path: ["destination", "country"],
      });
    }
    if (val.mode === "advance" && val.packages.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "err.minPackage",
        path: ["packages"],
      });
    }
  });

export type CalculatorValues = z.infer<typeof calculatorSchema>;
export type PackageValues = z.infer<typeof packageSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
