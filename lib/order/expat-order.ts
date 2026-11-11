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

/** Q1's six options, in the epic's order */
export const ITEM_CATEGORIES = ["furniture", "personal", "fineArt", "electronics", "office", "others"] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/** Q2's follow-up for someone already in Indonesia, in the epic's order */
export const STAY_LENGTHS = ["lt3m", "3to6m", "6to12m", "gt1y"] as const;
export type StayLength = (typeof STAY_LENGTHS)[number];

/** Q4's options, in the epic's order */
export const REASONS = ["working", "student", "others"] as const;
export type Reason = (typeof REASONS)[number];

export interface EligibilityAnswers {
  /** Q1, multi-select */
  items: ItemCategory[];
  itemsOther: string;
  /** Q2 */
  location?: "abroad" | "indonesia";
  /** Q2 follow-up when still abroad, "YYYY-MM-DD"; recorded for ops only */
  arrivalDate?: string;
  /** Q2 follow-up when in Indonesia; recorded for ops only, never a gate */
  stayLength?: StayLength;
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
  const q2 =
    (a.location === "abroad" && !!a.arrivalDate) || (a.location === "indonesia" && !!a.stayLength);
  const q3 = a.hasVisa === false || (a.hasVisa === true && a.hasVitas !== undefined && a.hasItas !== undefined);
  const q4 = !!a.reason && (a.reason !== "others" || a.reasonOther.trim().length > 0);
  return { q1, q2, q3, q4, done: q1 && q2 && q3 && q4 };
}

/* ----------------------------------------------------------- Customs Category */

/** the provisional internal flag (epic, section 8); never shown to the customer */
export type CustomsCategory = "eligible_pindahan" | "personal_shipment" | "needs_review";

/**
 * The team's dummy rule table, read top down, first match wins. Q1 never
 * moves the flag (furniture only warns), and neither do the arrival date or
 * the length of stay: ops weighs those. A draft until ops confirms it.
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

/** the measurement photos, by what each one shows; a file name once added */
export type PackingPhotos = { weight?: string; length?: string; width?: string; height?: string };
export const PHOTO_SIDES = ["weight", "length", "width", "height"] as const;

export interface PackingItem {
  /** a list key, never shown */
  id: string;
  name: string;
  /** typed text, digits only */
  quantity: string;
  /** per item, in the list's currency; optional, the team asks if it's missing */
  value: string;
}

/**
 * One package as typed, the same fields as the WNI flow's Items & Packages
 * (lib/types/packing): measurements stay text while typed, so "12." survives
 * the keystroke, and become numbers in the booking (toItemsData).
 */
export interface PackingPackage {
  id: string;
  /** a PACKAGING_TYPES value */
  packaging: string;
  /** what it's packed in, typed, when packaging is "other"; absent on drafts
   *  saved before it was asked */
  packagingOther?: string;
  /** kg */
  weight: string;
  /** cm */
  length: string;
  width: string;
  height: string;
  items: PackingItem[];
  photos: PackingPhotos;
}

export interface PackingInput {
  /** the values' currency; empty follows the origin country's */
  currency: string;
  packages: PackingPackage[];
}

const key = () => Math.random().toString(36).slice(2, 10);

export const newPackingItem = (): PackingItem => ({ id: key(), name: "", quantity: "1", value: "" });

export const newPackingPackage = (): PackingPackage => ({
  id: key(),
  packaging: "box",
  packagingOther: "",
  weight: "",
  length: "",
  width: "",
  height: "",
  items: [newPackingItem()],
  photos: {},
});

export const EMPTY_PACKING: PackingInput = {
  currency: "",
  packages: [{ ...newPackingPackage(), id: "p0", items: [{ ...newPackingItem(), id: "i0" }] }],
};

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

/** weight and all three sides in, each above 0 */
export const packageMeasured = (p: PackingPackage) =>
  num(p.weight) > 0 && num(p.length) > 0 && num(p.width) > 0 && num(p.height) > 0;

/** what a package is charged on: its weight, or its size when that's more */
export function packageCharge(p: PackingPackage): { kg: number; by: "weight" | "size" } {
  const dims = { weight: num(p.weight), length: num(p.length), width: num(p.width), height: num(p.height), quantity: 1 };
  return { kg: chargeableWeight(dims), by: volumetricWeight(dims) > dims.weight ? "size" : "weight" };
}

export const itemDescribed = (it: PackingItem) => it.name.trim().length > 0 && num(it.quantity) >= 1;

/** Others asks what it's packed in */
export const packagingDescribed = (p: PackingPackage) => p.packaging !== "other" || !!p.packagingOther?.trim();

export function packingProgress(p: PackingInput) {
  const measured = p.packages.length > 0 && p.packages.every(packageMeasured);
  const described =
    p.packages.length > 0 &&
    p.packages.every((pk) => packagingDescribed(pk) && pk.items.length > 0 && pk.items.every(itemDescribed));
  return { measured, described, done: measured && described };
}

export const photosMissing = (p: PackingPackage) => PHOTO_SIDES.some((s) => !p.photos[s]);

export function packingTotals(p: PackingInput) {
  let kg = 0;
  let items = 0;
  let value = 0;
  for (const pk of p.packages) {
    kg += packageCharge(pk).kg;
    for (const it of pk.items) {
      items += num(it.quantity);
      value += num(it.quantity) * num(it.value);
    }
  }
  return { packages: p.packages.length, kg, items, value };
}

export interface PackedPricing {
  /** the rate the estimate stands on: repriced when `packed` */
  rate: ExpatRate;
  packed: boolean;
  /** the packages' charged weight once they're all measured, else 0 */
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
    packages: p.packages.map(
      (pk): PackageRow => ({
        packaging: pk.packaging,
        ...(pk.packaging === "other" ? { packagingOther: pk.packagingOther?.trim() } : {}),
        weight: num(pk.weight),
        length: num(pk.length),
        width: num(pk.width),
        height: num(pk.height),
        items: pk.items.map((it) => ({ name: it.name.trim(), quantity: num(it.quantity), value: num(it.value) })),
        photos: { ...pk.photos },
      }),
    ),
  };
}

/* ------------------------------------------------------- Personal Information */

/** how the pickup is handed over: by the customer, or someone they name */
export type Handover = "me" | "other";

export interface DetailsInput {
  /** each side's Detail Address: the unit, building and landmarks of its
   *  Address, the courier's way to the door. Both required. The origin's is
   *  absent on drafts saved while it wasn't asked */
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

  /* The pickup, as the WNI flow's Pickup Schedule asks it, so the courier
     collects without a second trip. Every field is absent on a draft saved
     before these were asked. */
  /** who hands the packages over; unset reads as the customer */
  handover?: Handover;
  /** the person named, when it isn't the customer */
  picName?: string;
  picDialIso?: string;
  picPhone?: string;
  /** a BUILDING_TYPES value (components/order/module-options) */
  buildingType?: string;
  /** a shared building's access, asked for anything but a house */
  freightElevator?: boolean;
  receptionist?: boolean;
  /** for the courier, optional */
  courierNotes?: string;
  /** a PICKUP_WINDOWS value, in the origin's local time */
  pickupWindow?: string;
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
  const origin = (d.originDetail ?? "").trim().length > 0;
  const destination = d.destinationDetail.trim().length > 0;
  const name = d.fullName.trim().length > 0;
  const email = emailValid(d.email);
  const phone = !!d.dialIso && phoneValid(d.phone);
  // the customer hands over unless they name someone, who then needs a name
  // and a number the courier can call
  const handover =
    (d.handover ?? "me") === "me" || (!!d.picName?.trim() && !!d.picDialIso && phoneValid(d.picPhone ?? ""));
  // a house has no shared access to ask about
  const building =
    !!d.buildingType &&
    (d.buildingType === "house" || (d.freightElevator !== undefined && d.receptionist !== undefined));
  const pickup = !!d.pickupDate && pickupDayAllowed(d.pickupDate);
  const window = !!d.pickupWindow;
  return {
    origin,
    destination,
    name,
    email,
    phone,
    handover,
    building,
    pickup,
    window,
    done: origin && destination && name && email && phone && handover && building && pickup && window,
  };
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
