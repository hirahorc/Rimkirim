import { z } from "zod";

// Validation messages are i18n keys, resolved by `t(...)` at render time.

/** what an expat ships, in the order the form offers it: the goods, never
 *  the packaging. Boxes and suitcases are how the goods travel, so they live
 *  in the quantity question, not here. `large` is the one the service
 *  assesses separately rather than quoting straight away. */
export const EXPAT_ITEMS = [
  "clothes",
  "books",
  "kitchen",
  "bedding",
  "toys",
  "personal",
  "large",
] as const;
export type ExpatItem = (typeof EXPAT_ITEMS)[number];

/** how many boxes or suitcases the goods fill: enough for sales to size the
 *  job, no tape measure yet */
export const EXPAT_QUANTITIES = ["1-3", "4-6", "7-10", "10+"] as const;
export type ExpatQuantity = (typeof EXPAT_QUANTITIES)[number];

/** step 1: what and where, before we ask who */
export const expatShipmentSchema = z.object({
  origin: z.string().min(2, "err.selectCountry"),
  city: z.string().trim().min(2, "expat.form.errCity"),
  items: z.array(z.enum(EXPAT_ITEMS)).min(1, "expat.form.errItems"),
  quantity: z.enum(EXPAT_QUANTITIES, { message: "expat.form.errQuantity" }),
});

/** step 2: where to send the quote; WhatsApp is optional, but if given it
 *  has to be a dialable number */
export const expatContactSchema = z.object({
  name: z.string().trim().min(2, "expat.form.errName"),
  email: z.string().trim().min(1, "err.required").email("err.emailInvalid"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, "expat.form.errPhone")
    .or(z.literal("")),
});
