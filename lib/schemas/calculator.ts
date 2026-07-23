import { z } from "zod";

export const packageSchema = z.object({
  weight: z.number({ message: "Wajib diisi" }).positive("Berat harus > 0"),
  length: z.number({ message: "Wajib diisi" }).positive("Wajib diisi"),
  width: z.number({ message: "Wajib diisi" }).positive("Wajib diisi"),
  height: z.number({ message: "Wajib diisi" }).positive("Wajib diisi"),
  quantity: z.number().int().min(1, "Min. 1"),
});

export const addressSchema = z.object({
  country: z.string().min(2, "Pilih negara"),
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
    nonStandardPackaging: z.boolean(),
    nonStackable: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.origin.country && val.origin.country === val.destination.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Negara asal dan tujuan tidak boleh sama",
        path: ["destination", "country"],
      });
    }
    if (val.mode === "advance" && val.packages.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tambahkan minimal 1 paket",
        path: ["packages"],
      });
    }
  });

export type CalculatorValues = z.infer<typeof calculatorSchema>;
export type PackageValues = z.infer<typeof packageSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
