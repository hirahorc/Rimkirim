/**
 * The Expat Relocation order, as pure data and rules (no React, no store):
 * what each step collects, when a step is complete, and the provisional
 * Customs Category a booking carries. The store (useExpatOrderStore) and the
 * screens read these; swap the rules here for the real ones.
 */

import { defaultCurrencyFor } from "@/lib/data/currencies";
import type { Place } from "@/lib/data/expat-places";
import { chargedWeight, expatRates, type ExpatRate, type ExpatRates } from "@/lib/pricing/expat-rates";
import type { ItemsData, PackageRow } from "@/lib/types/packing";
import { chargeableWeight, volumetricWeight } from "@/lib/utils/chargeable-weight";

/* ---------------------------------------------------------------- Check Rate */

export interface CheckRateInput {
  originCountry: string;
  origin: Place | null;
  /** always Indonesia: the service is import only */
  destCountry: "ID";
  destination: Place | null;
  /** as entered; the rate rounds it up */
  weightKg: number | null;
}

export const EMPTY_CHECK: CheckRateInput = {
  originCountry: "",
  origin: null,
  destCountry: "ID",
  destination: null,
  weightKg: null,
};

/** an Address counts only once it's a picked place with a postal code */
export const addressReady = (p: Place | null): p is Place => !!p?.postalCode;

export function checkComplete(c: CheckRateInput): boolean {
  return !!c.originCountry && addressReady(c.origin) && addressReady(c.destination) && !!c.weightKg && c.weightKg > 0;
}

/* --------------------------------------------------------- Eligibility Check */

/** Q1's options, in the epic's order minus "Fine Art & High-Value Items"
 *  (dropped 2026-11-20) */
export const ITEM_CATEGORIES = ["furniture", "personal", "electronics", "office", "others"] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/** what Q1 tells the customer can't be shipped (the PM's eligibility rule
 *  v1): none of the three customs paths lets these in. Told, not asked */
export const BLOCKED_ITEMS = ["vehicle", "excise", "hazard"] as const;
export type BlockedItem = (typeof BLOCKED_ITEMS)[number];

/** Q4's options, in the epic's order */
export const REASONS = ["working", "student", "others"] as const;
export type Reason = (typeof REASONS)[number];

export interface EligibilityAnswers {
  /** Q1, multi-select */
  items: ItemCategory[];
  itemsOther: string;
  /** Q2 */
  location?: "abroad" | "indonesia";
  /** Q2's follow-up in both branches, "YYYY-MM-DD": the expected arrival when
   *  still abroad, the day they arrived when already in Indonesia (the PM's
   *  rule v1 asks the date either way); recorded for ops only */
  arrivalDate?: string;
  /** Q3, then its two follow-ups when yes */
  hasVisa?: boolean;
  hasVitas?: boolean;
  hasItas?: boolean;
  /** Q4 */
  reason?: Reason;
  reasonOther: string;
}

export const EMPTY_ELIGIBILITY: EligibilityAnswers = { items: [], itemsOther: "", reasonOther: "" };

/** each question answered, follow-ups and "Others" text included */
export function eligibilityProgress(a: EligibilityAnswers) {
  const q1 = a.items.length > 0 && (!a.items.includes("others") || a.itemsOther.trim().length > 0);
  const q2 = !!a.location && !!a.arrivalDate;
  const q3 = a.hasVisa === false || (a.hasVisa === true && a.hasVitas !== undefined && a.hasItas !== undefined);
  const q4 = !!a.reason && (a.reason !== "others" || a.reasonOther.trim().length > 0);
  return { q1, q2, q3, q4, done: q1 && q2 && q3 && q4 };
}

/* ----------------------------------------------------------- Customs Category */

/** the provisional internal flag (epic, section 8); never shown to the customer */
export type CustomsCategory = "eligible_pindahan" | "personal_shipment" | "needs_review";

/**
 * The team's dummy rule table, read top down, first match wins. Q1 never
 * moves the flag (furniture only warns, and what can't be shipped is told
 * beside it, not asked), and neither does the arrival date:
 * ops weighs it. A draft until ops confirms it.
 *
 * | # | When                                              | Flag                |
 * |---|---------------------------------------------------|---------------------|
 * | 1 | reason is Others                                  | personal_shipment   |
 * | 2 | working or student, no visa                       | needs_review        |
 * | 3 | a visa, but neither a VITAS nor an ITAS           | needs_review        |
 * | 4 | already in Indonesia, however long                | needs_review        |
 * | 5 | the rest: working or student, abroad, VITAS/ITAS  | eligible_pindahan   |
 */
export function customsCategory(a: EligibilityAnswers): CustomsCategory {
  if (a.reason === "others") return "personal_shipment";
  if (a.hasVisa === false) return "needs_review";
  if (a.hasVisa && !a.hasVitas && !a.hasItas) return "needs_review";
  if (a.location === "indonesia") return "needs_review";
  return "eligible_pindahan";
}

/* ------------------------------------------------------------------- Packages */

/**
 * Rimkirim's three standard boxes, inner sides in cm, from the boxes
 * themselves (photo, 20 Nov 2026). A size to pick the closest to, not a box
 * that's sent: the customer packs in their own. A package that fits none of
 * them (a suitcase, a crate, a bigger box) is "other" and is measured.
 */
export const BOX_SIZES = {
  A: { length: 32, width: 23, height: 30 },
  B: { length: 43, width: 37, height: 37 },
  C: { length: 55, width: 54, height: 40 },
} as const;
export type StandardBox = keyof typeof BOX_SIZES;
export type BoxChoice = StandardBox | "other";
export const BOX_CHOICES: BoxChoice[] = ["A", "B", "C", "other"];
export const isStandardBox = (b: string | undefined): b is StandardBox => b === "A" || b === "B" || b === "C";

/**
 * What a package holds, by kind, in the order customers most often ship
 * them: a stand-in for the categories the dev team derives from HS codes.
 * "others" asks what it is. Each is a row of its own in a package.
 */
export const CONTENT_CATEGORIES = [
  "clothing",
  "bags",
  "books",
  "kitchen",
  "textiles",
  "furniture",
  "decor",
  "appliances",
  "electronics",
  "toys",
  "sports",
  "instruments",
  "art",
  "tools",
  "stationery",
  "others",
] as const;
export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

export interface PackingItem {
  /** a list key, never shown */
  id: string;
  /** a CONTENT_CATEGORIES value; "" until one is picked */
  category: string;
  /** what it is, typed, when the category is "others" */
  name: string;
  /** typed text, digits only */
  quantity: string;
  /** the whole row's value, in the list's currency; optional, the team asks
   *  if it's missing */
  value: string;
}

/**
 * One package as typed: the standard box it's closest to, or "other" and
 * then the WNI flow's fields (lib/types/packing), what it's packed in, its
 * weight and three sides. Measurements stay text while typed, so "12."
 * survives the keystroke, and become numbers in the booking (toItemsData).
 */
export interface PackingPackage {
  id: string;
  /** "" until one is picked */
  box: BoxChoice | "";
  /** a PACKAGING_TYPES value; asked of "other" only */
  packaging: string;
  /** what it's packed in, typed, when packaging is "other"; absent on drafts
   *  saved before it was asked */
  packagingOther?: string;
  /** kg; asked of "other" only, as are the three sides */
  weight: string;
  /** cm */
  length: string;
  width: string;
  height: string;
  items: PackingItem[];
}

export interface PackingInput {
  /** the values' currency; empty follows the origin country's */
  currency: string;
  packages: PackingPackage[];
}

const key = () => Math.random().toString(36).slice(2, 10);

export const newPackingItem = (): PackingItem => ({ id: key(), category: "", name: "", quantity: "1", value: "" });

export const newPackingPackage = (): PackingPackage => ({
  id: key(),
  box: "",
  packaging: "box",
  packagingOther: "",
  weight: "",
  length: "",
  width: "",
  height: "",
  items: [newPackingItem()],
});

export const EMPTY_PACKING: PackingInput = {
  currency: "",
  packages: [{ ...newPackingPackage(), id: "p0", items: [{ ...newPackingItem(), id: "i0" }] }],
};

/**
 * A draft saved before the standard boxes and the categories were asked
 * (store version 1): a package with anything measured is "other", as it was
 * measured, and an item typed by name is "others" with that name, its value
 * each made the row's total. Nothing typed is lost.
 */
export function migratePacking(p: PackingInput): PackingInput {
  type Old = Omit<PackingPackage, "box" | "items"> & { box?: BoxChoice | ""; items: (Omit<PackingItem, "category"> & { category?: string })[] };
  return {
    ...p,
    packages: (p.packages as Old[]).map((pk) => ({
      ...pk,
      box: pk.box ?? (pk.weight || pk.length || pk.width || pk.height ? "other" : ""),
      items: pk.items.map((it) =>
        it.category !== undefined
          ? (it as PackingItem)
          : {
              ...it,
              category: it.name.trim() ? "others" : "",
              value: it.value ? String(num(it.value) * Math.max(1, num(it.quantity))) : "",
            },
      ),
    })),
  };
}

const num = (s: string) => {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

/** the currency the values are declared in: the one picked, or the origin's */
export const packingCurrency = (p: PackingInput, originCountry: string) =>
  p.currency || defaultCurrencyFor(originCountry);

/** a declared value as the inputs wear it: the code, then the amount
 *  ("AUD 300"), never a symbol that only some currencies have */
export const declaredValue = (n: number, code: string) =>
  `${code} ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(n)}`;

/** a standard box picked, or "other" with its weight and all three sides
 *  in, each above 0 */
export const packageMeasured = (p: PackingPackage) =>
  isStandardBox(p.box) ||
  (p.box === "other" && num(p.weight) > 0 && num(p.length) > 0 && num(p.width) > 0 && num(p.height) > 0);

/** what a package is charged on: its weight, or its size when that's more. A
 *  standard box isn't weighed here, so it's estimated on its size ("box") */
export function packageCharge(p: PackingPackage): { kg: number; by: "weight" | "size" | "box" } {
  if (isStandardBox(p.box)) return { kg: volumetricWeight(BOX_SIZES[p.box]), by: "box" };
  const dims = { weight: num(p.weight), length: num(p.length), width: num(p.width), height: num(p.height), quantity: 1 };
  return { kg: chargeableWeight(dims), by: volumetricWeight(dims) > dims.weight ? "size" : "weight" };
}

/** a category picked (and, for "others", what it is) and how many */
export const itemDescribed = (it: PackingItem) =>
  !!it.category && (it.category !== "others" || it.name.trim().length > 0) && num(it.quantity) >= 1;

/** Others asks what it's packed in (only a package that isn't a standard box
 *  is asked what it's packed in) */
export const packagingDescribed = (p: PackingPackage) =>
  p.box !== "other" || p.packaging !== "other" || !!p.packagingOther?.trim();

export function packingProgress(p: PackingInput) {
  const measured = p.packages.length > 0 && p.packages.every(packageMeasured);
  const described =
    p.packages.length > 0 &&
    p.packages.every((pk) => packagingDescribed(pk) && pk.items.length > 0 && pk.items.every(itemDescribed));
  return { measured, described, done: measured && described };
}

export function packingTotals(p: PackingInput) {
  let kg = 0;
  let items = 0;
  let value = 0;
  for (const pk of p.packages) {
    kg += packageCharge(pk).kg;
    for (const it of pk.items) {
      items += num(it.quantity);
      value += num(it.value);
    }
  }
  return { packages: p.packages.length, kg, items, value };
}

export interface PackedPricing {
  /** the rate the estimate stands on: repriced when `packed` */
  rate: ExpatRate;
  packed: boolean;
  /** the packages' chargeable weight once they're all measured, else 0 */
  kg: number;
  /** set when a Special Rate couldn't be repriced: where it starts */
  specialFromKg?: number;
}

/**
 * The estimate on the Packages step: once every package is measured, the
 * Selected Rate's own service priced again at the packages' chargeable
 * weight, so the one estimate on screen follows the best numbers there are.
 * Until then, or when that service isn't offered at that weight (a Special
 * Rate below its first tier), the Check Rate estimate stands.
 */
export function packedPricing(originCountry: string, rate: ExpatRate, p: PackingInput): PackedPricing {
  if (!packingProgress(p).measured) return { rate, packed: false, kg: 0 };
  const kg = chargedWeight(packingTotals(p).kg);
  const priced = expatRates(originCountry, kg);
  const same = priced.rates.find((r) => r.id === rate.id);
  return same ? { rate: same, packed: true, kg } : { rate, packed: false, kg, specialFromKg: priced.specialFromKg };
}

/**
 * What the plan offers when the service is changed there: Check Rate's own
 * list, priced at the weight the estimate follows (the packages' once
 * they're all measured, else the weight checked), so a card's figure is the
 * one the Selected Service shows once it's picked.
 */
export function serviceOptions(check: CheckRateInput, pricing: PackedPricing): ExpatRates {
  return expatRates(check.originCountry, pricing.kg || check.weightKg || pricing.rate.chargedKg);
}

/**
 * The rate the order carries for a service picked on the plan: that service
 * as Check Rate prices it, at the weight checked, so the packages go on
 * repricing it as they do a rate picked there. A Special Rate that only
 * starts above the weight checked has no such price, and is carried as
 * picked, at the packages' weight.
 */
export function checkedRate(check: CheckRateInput, picked: ExpatRate): ExpatRate {
  if (!check.weightKg) return picked;
  return expatRates(check.originCountry, check.weightKg).rates.find((r) => r.id === picked.id) ?? picked;
}

/** the list in the shared Packing List shape, for the booking */
export function toItemsData(p: PackingInput, originCountry: string): ItemsData {
  return {
    currency: packingCurrency(p, originCountry),
    packages: p.packages.map((pk): PackageRow => {
      // a row's value is its total; the booking keeps it per item, as the
      // WNI flow's rows do
      const items = pk.items.map((it) => {
        const quantity = num(it.quantity);
        return {
          category: it.category,
          name: it.category === "others" ? it.name.trim() : "",
          quantity,
          value: quantity > 0 ? num(it.value) / quantity : 0,
        };
      });
      if (isStandardBox(pk.box)) return { box: pk.box, packaging: "box", weight: 0, ...BOX_SIZES[pk.box], items };
      return {
        packaging: pk.packaging,
        ...(pk.packaging === "other" ? { packagingOther: pk.packagingOther?.trim() } : {}),
        weight: num(pk.weight),
        length: num(pk.length),
        width: num(pk.width),
        height: num(pk.height),
        items,
      };
    }),
  };
}

/* ------------------------------------------------------- Personal Information */

export interface DetailsInput {
  /** each side's Detail Address: the unit, building and landmarks of its
   *  Address, the courier's way to the door. Both optional (the team's call;
   *  the epic marks them required). The origin's is absent on drafts saved
   *  while it wasn't asked */
  destinationDetail: string;
  originDetail?: string;
  fullName: string;
  email: string;
  /** ISO country code of the dial code; follows the origin until changed */
  dialIso: string;
  /** true once the customer picks a dial code themselves */
  dialTouched: boolean;
  phone: string;
  /** "YYYY-MM-DD": the day the belongings are collected */
  pickupDate?: string;
}

export const EMPTY_DETAILS: DetailsInput = {
  destinationDetail: "",
  fullName: "",
  email: "",
  dialIso: "",
  dialTouched: false,
  phone: "",
};

/** the epic's rule: an @ and a valid domain */
export const emailValid = (s: string) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s.trim());

/** digits only, spaces allowed while typing; the epic sets no length */
export const phoneValid = (s: string) => /^[0-9 ]*[0-9][0-9 ]*$/.test(s.trim());

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** the first day a pickup can be booked: tomorrow (H+0 is out) */
export function firstPickupIso(now = new Date()): string {
  return toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
}

/** weekends and anything before the first pickup day are out */
export function pickupDayAllowed(iso: string, now = new Date()): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const day = d.getDay();
  return day !== 0 && day !== 6 && iso >= firstPickupIso(now);
}

export function todayIso(now = new Date()): string {
  return toIso(now);
}

export function detailsProgress(d: DetailsInput) {
  const name = d.fullName.trim().length > 0;
  const email = emailValid(d.email);
  const phone = !!d.dialIso && phoneValid(d.phone);
  const pickup = !!d.pickupDate && pickupDayAllowed(d.pickupDate);
  return { name, email, phone, pickup, done: name && email && phone && pickup };
}

/* -------------------------------------------------------------------- Booking */

export interface ExpatBooking {
  /** e.g. "RK4KX9M2PT" */
  number: string;
  /** ISO timestamp */
  createdAt: string;
  check: CheckRateInput & { origin: Place; destination: Place; weightKg: number };
  /** the Selected Rate, priced on the packages when it could be */
  rate: ExpatRate;
  eligibility: EligibilityAnswers;
  /** absent on bookings made before the Packages step */
  packing?: ItemsData;
  details: DetailsInput;
  /** internal only: never rendered to the customer, nor in the email */
  customsCategory: CustomsCategory;
  /** the Booking Summary email's two recipients */
  emailTo: [string, string];
}

/** the team's inbox, the email's second recipient (epic, section 8) */
export const TEAM_INBOX = "hello@rimkirim.com";
