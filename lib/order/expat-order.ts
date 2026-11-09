/**
 * The Expat Relocation order, as pure data and rules (no React, no store):
 * what each step collects, when a step is complete, and the provisional
 * Customs Category a booking carries. The store (useExpatOrderStore) and the
 * screens read these; swap the rules here for the real ones.
 */

import type { Place } from "@/lib/data/expat-places";
import type { ExpatRate } from "@/lib/pricing/expat-rates";

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

/* ------------------------------------------------------- Personal Information */

export interface Pin {
  lat: number;
  lng: number;
}

export interface DetailsInput {
  originDetail: string;
  originPin?: Pin;
  destinationDetail: string;
  destinationPin?: Pin;
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
  originDetail: "",
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

/** the first day a pickup can be booked: today plus three (H+0 to H+2 are out) */
export function firstPickupIso(now = new Date()): string {
  return toIso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3));
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
  const origin = d.originDetail.trim().length > 0 && !!d.originPin;
  const destination = d.destinationDetail.trim().length > 0 && !!d.destinationPin;
  const name = d.fullName.trim().length > 0;
  const email = emailValid(d.email);
  const phone = !!d.dialIso && phoneValid(d.phone);
  const pickup = !!d.pickupDate && pickupDayAllowed(d.pickupDate);
  return { origin, destination, name, email, phone, pickup, done: origin && destination && name && email && phone && pickup };
}

/* -------------------------------------------------------------------- Booking */

export interface ExpatBooking {
  /** e.g. "RK4KX9M2PT" */
  number: string;
  /** ISO timestamp */
  createdAt: string;
  check: CheckRateInput & { origin: Place; destination: Place; weightKg: number };
  rate: ExpatRate;
  eligibility: EligibilityAnswers;
  details: DetailsInput;
  /** internal only: never rendered to the customer, nor in the email */
  customsCategory: CustomsCategory;
  /** the Booking Summary email's two recipients */
  emailTo: [string, string];
}

/** the team's inbox, the email's second recipient (epic, section 8) */
export const TEAM_INBOX = "hello@rimkirim.com";
