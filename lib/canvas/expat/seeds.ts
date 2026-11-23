import { breakState, type BreakSet } from "@/components/expat-order/dev/break-fixtures";
import { searchPlaces, type Place } from "@/lib/data/expat-places";
import { expatRates, type ExpatRate } from "@/lib/pricing/expat-rates";
import {
  EMPTY_CHECK,
  EMPTY_DETAILS,
  EMPTY_ELIGIBILITY,
  EMPTY_PACKING,
  customsCategory,
  type CheckRateInput,
  type DetailsInput,
  type EligibilityAnswers,
  type ExpatBooking,
  type PackingInput,
  type PackingPackage,
} from "@/lib/order/expat-order";
import type { SceneSeed } from "../boot";

/**
 * What an expat-flow scene's storage starts with: the draft the order store
 * hydrates from, and the few facts the flow keeps beside it (that the
 * customs guide was seen, that the visit was welcomed, the booking just
 * made). Every scene is built on the demo order of the break-ui datasets
 * (break-fixtures), cut back to where its story starts, so a scene and the
 * dataset toggle show the same customer.
 *
 * Seeds are the same every time they're built on a given day: the canvas
 * and the frame each build one, and compare them.
 */

/* the flow's own keys (useExpatOrderStore, CustomsGuide, visit.ts) */
export const DRAFT = "rimkirim:expat-order";
const DRAFT_VERSION = 2;
const CUSTOMS_SEEN = "rimkirim:expat-order:customs-seen";
const WELCOMED = "rimkirim:expat-order:welcomed";
const BOOKED = "rimkirim:expat-order:booked";

export interface Draft {
  check: CheckRateInput;
  rate: ExpatRate | null;
  eligibility: EligibilityAnswers;
  packing: PackingInput;
  details: DetailsInput;
  addressChanged: { origin?: boolean; destination: boolean };
  bookings: ExpatBooking[];
}

/** the demo order, whole: Sydney to Jakarta, 30 kg, two packages */
export const demo = () => breakState("demo") as Draft & { rate: ExpatRate };

/** n days from today, as the flow writes a date */
export function days(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** a seeded place of the address search: `at` 0 is a country's area, which has no postal code */
export const placeOf = (country: string, query: string, at: number): Place => searchPlaces(country, query)[at];

/** a draft from nothing: Check Rate as a first visit finds it */
export function draft(over: Partial<Draft> = {}): Draft {
  return {
    check: EMPTY_CHECK,
    rate: null,
    eligibility: EMPTY_ELIGIBILITY,
    packing: EMPTY_PACKING,
    details: EMPTY_DETAILS,
    addressChanged: { origin: false, destination: false },
    bookings: [],
    ...over,
  };
}

/** the demo route checked and its rate picked: the plan opens on it, nothing answered yet */
export function planned(over: Partial<Draft> = {}): Draft {
  const d = demo();
  return draft({
    check: d.check,
    rate: d.rate,
    // the dial code follows the origin country once it's chosen (setCheck)
    details: { ...EMPTY_DETAILS, dialIso: d.check.originCountry },
    ...over,
  });
}

/** a route checked from another country, with the rate Check Rate would lead with */
export function checked(check: CheckRateInput): Draft {
  return draft({ check });
}

export const leadRate = (check: CheckRateInput) =>
  check.weightKg ? (expatRates(check.originCountry, check.weightKg).rates[0] ?? null) : null;

/** a package measured as Custom unless `over` says a standard size */
export const pkg = (id: string, over: Partial<PackingPackage> = {}): PackingPackage => ({
  id,
  box: "other",
  packaging: "box",
  packagingOther: "",
  weight: "14",
  length: "60",
  width: "40",
  height: "40",
  items: [{ id: `${id}-a`, category: "clothing", name: "", quantity: "3", value: "360" }],
  ...over,
});

/** nothing but a dataset's booking, as the device holds it after Confirm application */
export function booked(set: BreakSet): Draft {
  const now = new Date();
  // a fixed hour of today: the seed is the same each time it's built
  const createdAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9).toISOString();
  return draft({ bookings: breakState(set).bookings.map((b) => ({ ...b, createdAt })) });
}

/** the demo booking and two more made from other answers: the internal tickets, each with the flag its answers set */
export function tickets(others: { number: string; eligibility: EligibilityAnswers }[]): Draft {
  const [base] = booked("demo").bookings;
  return draft({
    bookings: [
      base,
      ...others.map((o) => ({ ...base, number: o.number, eligibility: o.eligibility, customsCategory: customsCategory(o.eligibility) })),
    ],
  });
}

/** a break-ui dataset as the plan holds it, before it's booked */
export function dataset(set: BreakSet): Draft {
  return { ...(breakState(set) as Draft), addressChanged: { origin: false, destination: false }, bookings: [] };
}

export interface SeedOptions {
  /** the plan's first visit on this device: the customs guide opens itself */
  firstVisit?: boolean;
  /** a visit that finds an earlier draft: "Welcome back" is said */
  returning?: boolean;
  /** the booking Confirm application just made: its summary draws its moment */
  justBooked?: string;
  hold?: number;
}

export function seed(state: Draft, opt: SeedOptions = {}): Omit<SceneSeed, "sig"> {
  const local: Record<string, string> = { [DRAFT]: JSON.stringify({ state, version: DRAFT_VERSION }) };
  if (!opt.firstVisit) local[CUSTOMS_SEEN] = "1";
  const session: Record<string, string> = {};
  if (!opt.returning) session[WELCOMED] = "1";
  if (opt.justBooked) session[BOOKED] = opt.justBooked;
  return { local, session, ...(opt.hold ? { hold: opt.hold } : {}) };
}
