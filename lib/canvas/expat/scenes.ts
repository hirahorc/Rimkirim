import { breakBookingNumber } from "@/components/expat-order/dev/break-fixtures";
import { REVIEW_NOTES } from "@/lib/data/expat";
import { ORDER_REVIEW_NOTES } from "@/lib/data/expat-order-notes";
import { messages } from "@/lib/i18n/messages";
import { EMPTY_CHECK, EMPTY_DETAILS, EMPTY_ELIGIBILITY } from "@/lib/order/expat-order";
import { ownLocalStorage } from "../boot";
import type { Board, Gap, Scene, Step, Target } from "../types";
import { DRAFT, booked, checked, dataset, days, demo, draft, pkg, placeOf, planned, seed, tickets } from "./seeds";

/**
 * Expat Relocation as scenes: every state its stories ask for, each one a
 * page opened on a seed and, where a stored draft can't reach the state, a
 * few steps. Lanes are the brief's tickets (RPW-281 to RPW-297); a row is a
 * story's positive path, its negative ones, or its edge data.
 *
 * Steps find what they press by the flow's own copy (messages.en), so a
 * label that's reworded is still found. Titles, notes and arrow labels are
 * in English, as the brief and its tickets are: they travel into the
 * pictures copied to Jira. What's on the screen is quoted as the screen
 * says it, and the review notes (`confirm`) as the prototype writes them.
 */

const M = messages.en.expatOrder;
/** the simulator is the team's, in Indonesian */
const OPS = messages.id.expatOrder.ops;
const LANDING = "/expat-relocation";
const SIMULATOR = "/simulator";
const RATES = "/expat-relocation/rates";
const PLAN = "/expat-relocation/plan";
const booking = (number: string) => `/expat-relocation/booking/${number}`;

/* what the steps press */
const button = (name: string, more: Partial<Target> = {}): Target => ({ role: "button", name, ...more });
const CHECK = button(M.rates.submit);
const CONTINUE = button(M.plan.continue);
const CONFIRM = button(M.plan.confirm);
const part = (k: "eligibility" | "details" | "packing") => button(M[k].title);
const WEIGHT: Target = { label: M.rates.weight };
const ORIGIN_ADDRESS: Target = { placeholder: M.rates.addressPh, nth: 0 };
const DIALOG: Target = { css: "[role='dialog']" };

/** a toast, or a moment the page paces, stays once the timer that ends it is held */
const HOLD: Step = { do: "hold", over: 2500 };
const click = (on: Target): Step => ({ do: "click", on });
const fill = (on: Target, text: string): Step => ({ do: "fill", on, text });
const wait = (ms: number): Step => ({ do: "wait", ms });

const d = demo();
const NUMBER = breakBookingNumber("demo");
/** Your details as the plan first shows it: nothing typed, the dial code from the origin country */
const START_DETAILS = { ...EMPTY_DETAILS, dialIso: d.check.originCountry };

/* --------------------------------------------------------------- Check Rate */

const rates: Scene[] = [
  {
    id: "rates-empty",
    title: "Empty form",
    note: "A first visit. The address is locked until the origin country is chosen.",
    via: "Landing: “Check your rate”",
    path: RATES,
    seed: () => seed(draft()),
  },
  {
    id: "rates-address",
    title: "Address suggestions",
    note: "Typing in the address opens suggestions. A place without a postal code is listed too, but refused when it's picked.",
    via: "Choose a country, type an address",
    path: RATES,
    seed: () => seed(draft({ check: { ...EMPTY_CHECK, originCountry: "AU" } })),
    steps: [fill(ORIGIN_ADDRESS, "syd")],
  },
  {
    id: "rates-filled",
    title: "Form filled in",
    note: "Origin, destination and weight are in. The button is lime: there's something to check.",
    via: "Pick the addresses, enter the weight",
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: null })),
    steps: [fill(WEIGHT, "30")],
  },
  {
    id: "rates-checking",
    title: "Checking…",
    note: "Loading while the rate is fetched. The prototype's rates are local, so the wait is deliberate (pace.ts).",
    via: "Press “Check rates”",
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: null })),
    steps: [fill(WEIGHT, "30"), { do: "hold", over: 650 }, click(CHECK)],
  },
  {
    id: "rates-required",
    title: "Check rates with nothing filled in",
    note: "Each missing field is marked where it is, and the first one takes focus.",
    via: "Press “Check rates” on an empty form",
    from: "rates-empty",
    path: RATES,
    seed: () => seed(draft()),
    steps: [click(CHECK)],
  },
  {
    id: "rates-no-results",
    title: "No address found",
    note: "“No places found. Try a street name.”",
    via: "Type an address that doesn't exist",
    from: "rates-address",
    path: RATES,
    seed: () => seed(draft({ check: { ...EMPTY_CHECK, originCountry: "AU" } })),
    steps: [fill(ORIGIN_ADDRESS, "zzzz")],
  },
  {
    id: "rates-no-postal",
    title: "A place without a postal code",
    note: "Refused at once, not on Check rates: the rate is priced on the postal code.",
    via: "Pick “Sydney” (an area, no postal code)",
    from: "rates-address",
    path: RATES,
    seed: () => seed(draft({ check: { ...EMPTY_CHECK, originCountry: "AU", origin: placeOf("AU", "syd", 0) } })),
  },
  {
    id: "rates-estimate",
    title: "Estimate: Special Rate",
    note: "One rate, the cheapest. The origin country has a Special Rate, so that's the one shown first.",
    via: "A rate is found",
    from: "rates-checking",
    path: RATES,
    seed: () => seed(checked(d.check)),
  },
  {
    id: "rates-normal",
    title: "Estimate: no Special Rate",
    note: "Brazil has no Special Rate: the cheapest Normal Rate per kg is shown first.",
    via: "A country without a Special Rate",
    from: null,
    path: RATES,
    seed: () => seed(checked({ ...d.check, originCountry: "BR", origin: placeOf("BR", "rio", 1) })),
  },
  {
    id: "rates-more",
    title: "See more rates",
    note: "The other rates open under it, cheapest first.",
    via: "Press “See more rates”",
    from: "rates-estimate",
    path: RATES,
    seed: () => seed(checked(d.check)),
    steps: [click(button("See more rates", { contains: true }))],
  },
  {
    id: "rates-rounded",
    title: "Weight rounded up",
    note: "30.4 kg is priced as 31 kg: “Priced at 31 kg”.",
    via: "A weight that isn't whole",
    from: null,
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: 30.4 })),
  },
  {
    id: "rates-below-tier",
    title: "Below the Special Rate's first tier",
    note: "10 kg isn't in the Special Rate yet (it starts at 21 kg): a Normal Rate is shown, with the weight the Special Rate starts at.",
    via: "A weight under 21 kg",
    from: "rates-estimate",
    path: RATES,
    seed: () => seed(checked({ ...d.check, weightKg: 10 })),
  },
  {
    id: "rates-stale",
    title: "Form changed after the estimate",
    note: "The old estimate dims and can't be selected until the rate is checked again.",
    via: "Change the weight",
    from: "rates-estimate",
    path: RATES,
    seed: () => seed(checked(d.check)),
    steps: [fill(WEIGHT, "45")],
  },
];

const NO_SERVICE: Gap = {
  gap: true,
  id: "rates-no-service",
  title: "No rate available / country not served",
  note: "Asked by RPW-290: a clear message and a next action. Not in the prototype (its rates are local, so there's always one); listed under “Still to build”.",
  via: "The route isn't served",
  from: "rates-checking",
};

/* --------------------------------------------------------------------- Plan */

const ELIG_INDONESIA = {
  ...EMPTY_ELIGIBILITY,
  items: ["personal" as const],
  location: "indonesia" as const,
  arrivalDate: days(-20),
  hasVisa: false,
  reason: "student" as const,
};
const ELIG_OTHERS = {
  ...EMPTY_ELIGIBILITY,
  items: ["personal" as const, "others" as const],
  itemsOther: "A digital piano",
  location: "abroad" as const,
  arrivalDate: days(30),
  hasVisa: true,
  hasVitas: false,
  hasItas: true,
  reason: "others" as const,
  reasonOther: "Joining my partner",
};
/** every part of the plan answered: all three fold and the action reads Confirm application */
const ALL_DONE = { eligibility: d.eligibility, details: d.details, packing: d.packing };

const plan: Scene[] = [
  /* RPW-297: the shell */
  {
    id: "plan-start",
    title: "Plan opens on the Eligibility Check",
    note: "Three parts on one page, one open. A part that can't be reached yet stands back.",
    via: "Check Rate: “Select this rate”",
    path: PLAN,
    seed: () => seed(planned()),
  },
  {
    id: "plan-part-done",
    title: "A part done, the next one open",
    note: "The Eligibility Check folds to a line that says the answers back; Your details opens under it.",
    via: "Answer everything, press “Continue”",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
  },
  {
    id: "plan-all-done",
    title: "All three done",
    note: "All folded, and the button reads “Confirm application”. Any part reopens from “Edit”.",
    via: "Fill in Your details and the packages",
    path: PLAN,
    seed: () => seed(planned(ALL_DONE)),
  },
  {
    id: "plan-welcome",
    title: "Back with a draft",
    note: "The draft stays on the device until it's submitted. The next visit says so once: “Welcome back. Your answers are still here.”",
    via: "Close the tab, come back later",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility }), { returning: true, hold: 2500 }),
    view: "screen",
  },
  {
    id: "plan-no-rate",
    title: "Plan opened without a rate",
    note: "Sent back to Check Rate, with the reason: “Check your rate first, then plan your relocation.”",
    via: "Open /plan directly, before picking a rate",
    from: null,
    path: PLAN,
    seed: () => seed(checked(d.check), { hold: 2500 }),
    view: "screen",
  },
  {
    id: "plan-missing",
    title: "Continue with answers missing",
    note: "The button is never disabled: what's missing is marked, the first of it takes focus, and a toast counts the rest.",
    via: "Press “Continue” without answering",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [HOLD, click(CONTINUE)],
    view: "screen",
  },

  /* RPW-296: the customs guide */
  {
    id: "customs-first",
    title: "First visit: it opens itself",
    note: "Half a second after the plan appears, the guide comes out of its button. A dialog on desktop, a sheet on a phone.",
    via: "Enter the plan for the first time",
    path: PLAN,
    seed: () => seed(planned(), { firstVisit: true }),
    steps: [{ do: "see", on: DIALOG }, wait(700)],
    view: "screen",
  },
  {
    id: "customs-hint",
    title: "Closed: the button says where it went",
    note: "The guide goes back into its button, and that first time there are words beside it: “Open this again here, any time.”",
    via: "Press “Got it”",
    path: PLAN,
    seed: () => seed(planned(), { firstVisit: true }),
    steps: [{ do: "see", on: DIALOG }, wait(600), { do: "hold", over: 3000 }, click(button(M.customs.gotIt)), wait(900)],
    view: "screen",
  },
  {
    id: "customs-reopen",
    title: "Opened again from its button",
    note: "On later visits the guide doesn't open itself; its button is always on screen.",
    via: "Press “How your belongings clear customs”",
    from: null,
    path: PLAN,
    seed: () => seed(planned()),
    steps: [click(button(M.customs.title)), wait(600)],
    view: "screen",
  },

  /* RPW-292: the Eligibility Check */
  {
    id: "elig-abroad",
    title: "Not arrived yet, with a VITAS",
    note: "Q2 “I have not arrived yet” asks the estimated arrival date; Q3 “Yes” opens VITAS and ITAS.",
    via: "Answer Q1 to Q4",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [click(part("eligibility"))],
  },
  {
    id: "elig-indonesia",
    title: "Already in Indonesia, no visa",
    note: "Q2 asks the day they arrived (up to today); Q3 “No” hides VITAS and ITAS.",
    via: "The other branch of Q2 and Q3",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: ELIG_INDONESIA })),
    steps: [click(part("eligibility"))],
  },
  {
    id: "elig-others",
    title: "“Others” in Q1 and Q4",
    note: "Each asks for a few words. No answer stops the order.",
    via: "Choose “Others”",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: ELIG_OTHERS })),
    steps: [click(part("eligibility"))],
  },
  {
    id: "elig-missing",
    title: "Nothing answered",
    note: "“Choose at least one.” on Q1, “Choose an answer.” on Q2 to Q4.",
    via: "Press “Continue” without answering",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [HOLD, click(CONTINUE)],
  },
  {
    id: "elig-followups",
    title: "Follow-ups left empty",
    note: "The arrival date, VITAS/ITAS and the “Others” text are required once an answer brings them up.",
    via: "Answer, but skip the follow-ups",
    from: "plan-start",
    path: PLAN,
    seed: () =>
      seed(
        planned({
          eligibility: { ...EMPTY_ELIGIBILITY, items: ["others"], location: "abroad", hasVisa: true, reason: "others" },
        }),
      ),
    steps: [HOLD, click(CONTINUE)],
  },

  /* RPW-292 + RPW-295: the furniture warning */
  {
    id: "furn-off",
    title: "Q1 without furniture",
    note: "The note “You pack everything yourself” is always under Q1, whatever is chosen.",
    via: "Choose a category other than furniture",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: { ...EMPTY_ELIGIBILITY, items: ["personal"] } })),
  },
  {
    id: "furn-on",
    title: "Q1 with furniture",
    note: "The note gains “, furniture included” and its link becomes “See how to pack furniture”.",
    via: "Choose “Furniture & Large Household Goods”",
    path: PLAN,
    seed: () => seed(planned({ eligibility: { ...EMPTY_ELIGIBILITY, items: ["furniture", "personal"] } })),
  },

  /* RPW-293: Personal Information */
  {
    id: "details-address",
    title: "An address card being changed",
    note: "“Change” swaps the card for its editor in place: the Address (inside its country) and the Detail Address, which is optional.",
    via: "Press “Change” on the origin card",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [click(button(M.details.change, { nth: 0 }))],
  },
  {
    id: "details-date",
    title: "Within 3 months: Pickup Date",
    note: "There's no calendar until the question is answered. Within 3 months: weekdays from tomorrow to day 90, and a date is required. On a phone the calendar is a bottom sheet.",
    via: "Choose “Within 3 months”, open “Pickup date”",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: { ...START_DETAILS, pickupWhen: "soon" } })),
    steps: [click(button(M.details.pickup)), wait(500)],
    view: "screen",
  },
  {
    id: "details-later",
    title: "More than 3 months: the date is optional",
    note: "The calendar starts on day 91, with no end. An empty date is a finished answer, not a mistake.",
    via: "Choose “More than 3 months”",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: { ...START_DETAILS, pickupWhen: "later" } })),
  },
  {
    id: "details-filled",
    title: "Your details filled in",
    note: "Name, email, phone (the dial code from the origin country), when to collect and the Pickup Date; a Detail Address on both cards.",
    via: "Fill in everything",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [click(part("details"))],
  },
  {
    id: "details-left",
    title: "A field left while it's wrong",
    note: "The error shows once the field is left, not on the button: “Enter an email like name@domain.com.”",
    via: "Type a wrong email, move on",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [
      fill({ label: M.details.email }, "alex@rimkirim"),
      { do: "leave", on: { label: M.details.email } },
      { do: "leave", on: { label: M.details.fullName } },
    ],
  },
  {
    id: "details-required",
    title: "Continue with nothing filled in",
    note: "“Required.” on each field, “Choose one to continue.” on when to collect, and a toast counts what's missing.",
    via: "Press “Continue” without filling in",
    from: "plan-part-done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [HOLD, click(CONTINUE)],
  },
  {
    id: "details-cleared",
    title: "Answer changed, the date cleared",
    note: "The two ranges never meet, so a date picked for the old answer is cleared, and that's said: “We cleared … because it's outside the dates this option allows.”",
    via: "With a date picked, switch to “More than 3 months”",
    from: "details-date",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: { ...d.details, fullName: "" } })),
    steps: [click({ role: "radio", name: M.details.whenLater, contains: true }), wait(500)],
  },
  {
    id: "details-pickup-past",
    title: "The Pickup Date has passed",
    note: "A draft from days ago: its date can't be used any more, and that's said at once.",
    via: "Come back to an old draft",
    from: null,
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: { ...d.details, pickupDate: days(-2) } })),
  },
  {
    id: "details-changed",
    title: "Address changed on Check Rate",
    note: "That side's Detail Address is cleared, so the courier isn't sent to the old Address's unit; its card says so.",
    via: "Change the destination Address on Check Rate",
    from: null,
    path: PLAN,
    seed: () =>
      seed(planned({ eligibility: d.eligibility, details: START_DETAILS, addressChanged: { origin: false, destination: true } })),
  },
  {
    id: "details-address-pick",
    title: "Saving an address without picking one",
    note: "“Pick an address from the list, so we get its postal code.”",
    via: "Clear the address, press “Save address”",
    from: "details-address",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility })),
    steps: [
      click(button(M.details.change, { nth: 0 })),
      click(button(M.rates.addressClear)),
      click(button(M.details.save)),
    ],
  },

  /* RPW-295: the Packages */
  {
    id: "pack-start",
    title: "Package 1, not filled in",
    note: "The plan's last part. It starts with one package; its size is picked first, then its weight and what's inside.",
    via: "Your details is done",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
  },
  {
    id: "pack-category",
    title: "Choosing what's inside",
    note: "Sixteen categories with examples, searchable. “Others” asks what it is.",
    via: "Open “Category”",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [click({ text: M.packing.categoryPh }), wait(300)],
  },
  {
    id: "pack-filled",
    title: "Two packages filled in",
    note: "One Medium Box, one Custom (a suitcase). The totals are under them, and the estimate now uses the packages' weight.",
    via: "Fill in size, weight and contents",
    from: "pack-start",
    path: PLAN,
    seed: () => seed(planned(ALL_DONE)),
    steps: [click(part("packing"))],
  },
  {
    id: "pack-missing",
    title: "Confirm with a package unfinished",
    note: "“Choose a package size.” and “Required.” where they apply; a folded package unfolds.",
    via: "Press “Confirm application”",
    from: "pack-start",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [HOLD, click(CONFIRM)],
  },
  {
    id: "pack-odd",
    title: "An unlikely size or weight",
    note: "A side over 300 cm or a weight over 500 kg is asked about, never refused. Both numbers are still placeholders.",
    via: "Enter 400 cm and 600 kg",
    from: "pack-filled",
    path: PLAN,
    seed: () =>
      seed(
        planned({
          ...ALL_DONE,
          packing: { currency: "", packages: [pkg("odd", { weight: "600", length: "400", width: "60", height: "60" })] },
        }),
      ),
    steps: [click(part("packing"))],
  },
  {
    id: "pack-remove",
    title: "Removing a package",
    note: "Asked first: its size, weight and contents go too, and it can't be undone.",
    via: "Press “Remove” on Package 2",
    from: "pack-filled",
    path: PLAN,
    seed: () => seed(planned(ALL_DONE)),
    steps: [click(part("packing")), wait(400), click(button(M.packing.removePackage.replace("{n}", "2"))), wait(500)],
    view: "screen",
  },
  {
    id: "pack-category-empty",
    title: "A category search with no match",
    note: "“Others” always stays in the list, so a search that matches nothing still has a way on: pick Others, then say what it is.",
    via: "Search for a category that isn't there",
    from: "pack-category",
    path: PLAN,
    seed: () => seed(planned({ eligibility: d.eligibility, details: d.details })),
    steps: [click({ text: M.packing.categoryPh }), wait(300), fill({ placeholder: M.packing.categorySearch }, "zzz")],
  },
  {
    id: "pack-below-tier",
    title: "Packages below the Special Rate's first tier",
    note: "The packages' weight (5 kg) isn't in the Special Rate yet, so the estimate stays at the weight checked (30 kg).",
    via: "Packages lighter than 21 kg",
    from: "pack-filled",
    path: PLAN,
    seed: () =>
      seed(planned({ ...ALL_DONE, packing: { currency: "", packages: [pkg("light", { box: "A", weight: "5" })] } })),
    steps: [click(part("packing"))],
  },

  /* the team's addition: changing the service on the plan */
  {
    id: "service-change",
    title: "Change your service",
    note: "Every service for the route, the Special Rate first, then cheapest first. The one in use is marked “Selected”.",
    via: "Press “Change” on Selected service",
    from: "plan-start",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [click(button(M.service.changeTitle)), wait(600)],
    view: "screen",
  },
  {
    id: "service-changed",
    title: "Service changed",
    note: "The answers stay; the estimate is priced again, and a toast says which service is now in use.",
    via: "Press “Select this rate” on another service",
    path: PLAN,
    seed: () => seed(planned()),
    steps: [
      click(button(M.service.changeTitle)),
      wait(600),
      HOLD,
      click(button(M.rates.select, { contains: true, within: "[role='dialog']", nth: 0 })),
      wait(600),
    ],
    view: "screen",
  },

  /* edge data */
  {
    id: "plan-worst",
    title: "Worst case",
    note: "The longest value each field accepts: a 120-character name, an email that can't wrap, sizes typed in the wrong unit.",
    from: null,
    path: PLAN,
    seed: () => seed(dataset("worst")),
    steps: [click(part("details"))],
  },
  {
    id: "plan-many",
    title: "40 packages",
    note: "A whole house, package by package. The finished ones start folded.",
    from: null,
    path: PLAN,
    seed: () => seed(dataset("many")),
    steps: [click(part("packing"))],
  },

  /* RPW-294, on the plan's side */
  {
    id: "plan-confirming",
    title: "Confirming…",
    note: "Submitting: the plan stands still under a button that says what's happening.",
    via: "Press “Confirm application”",
    from: "plan-all-done",
    path: PLAN,
    seed: () => seed(planned(ALL_DONE)),
    steps: [{ do: "hold", over: 1000 }, click(CONFIRM)],
    view: "screen",
  },
  {
    id: "plan-confirm-failed",
    title: "Confirm fails",
    note: "The error state RPW-294 asks for: nothing is registered, the draft is as it was, and a toast says to check the answers. Without a server, it's reached here through the data: an Address with no postal code.",
    via: "The application can't be registered",
    from: "plan-confirming",
    path: PLAN,
    // every part is in, but the origin is a place the booking can't take
    seed: () => seed(planned({ ...ALL_DONE, check: { ...d.check, origin: placeOf("AU", "syd", 0) } })),
    steps: [HOLD, click(CONFIRM), wait(1900)],
    view: "screen",
  },
];

const FURNITURE_PACKAGES: Gap = {
  gap: true,
  id: "furn-packages",
  title: "Furniture warning in Shipment Information",
  note: "Asked by the brief: the same callout again when furniture is declared in a package. In the prototype, choosing the “Furniture” category shows nothing.",
  via: "Choose the “Furniture” category in a package",
};

/* ----------------------------------------------------------- Booking Summary */

const bookingScenes: Scene[] = [
  {
    id: "booking-fresh",
    title: "Just confirmed",
    note: "The “Booking received” head draws its check once, then the dialog “We'll contact you within 1 working day”.",
    via: "The booking is registered",
    from: "plan-confirming",
    path: booking(NUMBER),
    seed: () => seed(booked("demo"), { justBooked: NUMBER }),
    steps: [{ do: "see", on: DIALOG }, wait(700)],
    view: "screen",
  },
  {
    id: "booking-summary",
    title: "Booking Summary",
    note: "The booking number, What happens next (three steps, the invoice later), then the record of the order. The Customs Category never shows.",
    via: "Press “Got it”",
    path: booking(NUMBER),
    seed: () => seed(booked("demo")),
  },
  {
    id: "booking-later",
    title: "Pickup more than 3 months away",
    note: "No date: the pickup reads “To be confirmed, more than 3 months from now”, and step three says the date is agreed closer to the time.",
    via: "A booking with “More than 3 months” and no date",
    from: null,
    path: booking(NUMBER),
    seed: () => {
      const state = booked("demo");
      return seed({
        ...state,
        bookings: state.bookings.map((b) => ({ ...b, details: { ...b.details, pickupWhen: "later" as const, pickupDate: undefined } })),
      });
    },
  },
  {
    id: "booking-docs",
    title: "Documents to get ready",
    note: "The three Customs Paths with their documents, folded under the step that asks for them.",
    via: "Open “Documents to get ready”",
    from: "booking-summary",
    path: booking(NUMBER),
    seed: () => seed(booked("demo")),
    steps: [click(button(M.customs.docsTitle, { contains: true })), wait(500)],
  },
  {
    id: "booking-not-found",
    title: "Booking not found",
    note: "A booking exists only on the device that made it (mock). An unknown number is pointed to Check Rate.",
    via: "Open a booking link on another device",
    from: null,
    path: booking("RKNOPE0000"),
    seed: () => seed(draft()),
  },
  {
    id: "booking-no-packages",
    title: "A booking without packages",
    note: "A booking made before the Packages were asked: that part is absent, the rest is whole.",
    from: null,
    path: booking(breakBookingNumber("empty")),
    seed: () => seed(booked("empty")),
  },
  {
    id: "booking-many",
    title: "40 packages",
    note: "The first five show; the rest are behind “Show all 40 packages”.",
    from: null,
    path: booking(breakBookingNumber("many")),
    seed: () => seed(booked("many")),
    steps: [click(button(M.booking.packagesAll.replace("{n}", "40"))), wait(500)],
  },
  {
    id: "booking-worst",
    title: "Worst case",
    note: "What the customer typed is shown as typed; an email or a long word may break anywhere.",
    from: null,
    path: booking(breakBookingNumber("worst")),
    seed: () => seed(booked("worst")),
  },
];

/* --------------------------------------------------------- Internal ticket */

const TICKETS = () =>
  tickets([
    { number: "RKREVIEW01", eligibility: ELIG_INDONESIA },
    { number: "RKPERSONAL", eligibility: ELIG_OTHERS },
  ]);
const EXPAT_TAB: Step = click({ role: "tab", name: OPS.tab });

const ops: Scene[] = [
  {
    id: "ops-tickets",
    title: "A ticket per Customs Category",
    note: "Three bookings, three flags: eligible_pindahan, needs_review, personal_shipment. The flag exists only here, never on the customer's side.",
    via: "Bookings are registered",
    from: null,
    path: SIMULATOR,
    seed: () => seed(TICKETS()),
    steps: [EXPAT_TAB, wait(400)],
  },
  {
    id: "ops-email",
    title: "Confirmation email preview",
    note: "The same email goes to the customer and to hello@rimkirim.com. In the prototype it can only be seen here.",
    via: `Press “${OPS.preview}”`,
    path: SIMULATOR,
    seed: () => seed(TICKETS()),
    steps: [EXPAT_TAB, wait(400), click(button(OPS.preview, { nth: 0 })), wait(700)],
    view: "screen",
  },
  {
    id: "ops-empty",
    title: "No bookings yet",
    note: "Before anything has been confirmed on this device.",
    from: null,
    path: SIMULATOR,
    seed: () => seed(draft()),
    steps: [EXPAT_TAB, wait(400)],
  },
];

/* ------------------------------------------------------------------ Landing */

const labelled = (heading: string) => `section[aria-labelledby='${heading}']`;
/** one section of the landing, whole: the frame is as tall as the section */
const section = (id: string, title: string, note: string, css: string, more: Partial<Scene> = {}): Scene => ({
  id,
  title,
  note,
  from: null,
  path: LANDING,
  seed: () => seed(draft()),
  view: "section",
  focus: { css },
  ...more,
});

const landing: Scene[] = [
  {
    id: "land-hero",
    title: "Hero",
    note: "The first screen: what is shipped, where to, and “Check your rate”.",
    from: null,
    path: LANDING,
    seed: () => seed(draft()),
    steps: [wait(1600)],
    view: "screen",
  },
  section("land-reviews", "Reviews", "Proof from customers who have shipped.", "#reviews"),
  section(
    "land-ship",
    "What you can ship",
    "What can be shipped, the packing guide (the customer always packs, furniture included) and what can't be shipped, which the Eligibility Check's Q1 links to.",
    labelled("ship-heading"),
  ),
  section("land-coordinate", "Who does what", "Rimkirim's part and the customer's.", labelled("coordinate-heading")),
  section("land-why", "Why Rimkirim", "What makes Rimkirim different for a move to Indonesia.", labelled("compare-heading")),
  section(
    "land-pricing",
    "Pricing information",
    "What shapes the price: route, weight, size, and chargeable weight (L × W × H ÷ 5000).",
    labelled("pricing-heading"),
  ),
  section("land-steps", "How it works", "The steps from Check Rate to delivery.", "#how-it-works"),
  section("land-customs", "Customs", "The three Customs Paths. Added after the brief, from ops' review.", labelled("customs-heading"), {
    via: "Scroll on",
    from: undefined,
  }),
  section("land-faq", "FAQ", "Common questions, on the same page.", "#faq"),
  section("land-faq-open", "FAQ: an answer open", "An answer opens in place.", "#faq", {
    via: "Press a question",
    from: undefined,
    steps: [click({ css: "#faq summary", nth: 0 }), wait(600)],
  }),
  section("land-closing", "Closing CTA", "A last way to Check Rate, without scrolling back up.", labelled("closing-heading")),
];

export const EXPAT_SCENES: Scene[] = [...rates, ...plan, ...bookingScenes, ...ops, ...landing];

/* ------------------------------------------------------------------- Boards */

/** the Booking Summary of the last booking made on this device, when there is one */
function lastBooking(): string | null {
  try {
    const raw = ownLocalStorage()?.getItem(DRAFT);
    const number = raw ? (JSON.parse(raw) as { state?: { bookings?: { number?: string }[] } }).state?.bookings?.[0]?.number : undefined;
    return number ? booking(number) : null;
  } catch {
    return null;
  }
}

export const EXPAT_BOARDS: Board[] = [
  {
    id: "overview",
    title: "Overview",
    route: "Expat Relocation order flow",
    // no page of its own: the flow starts at Check Rate
    page: { is: () => false, home: RATES },
    digest: true,
    lead: "The happy path from Check Rate to the Booking Summary, a frame per step. Each page's states are on its own board.",
    lanes: [
      {
        id: "happy",
        ticket: "RPW-280",
        title: "Happy path, end to end",
        story: "Check Rate, Select Rate, then the plan (Eligibility Check, Personal Information, Packages), Confirm application, the Booking Summary.",
        rows: [
          {
            kind: "positive",
            cells: [
              "rates-empty",
              "rates-estimate",
              "plan-start",
              "plan-part-done",
              "pack-start",
              "plan-all-done",
              "plan-confirming",
              "booking-fresh",
              "booking-summary",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rates",
    title: "Check Rate",
    route: RATES,
    page: { is: (p) => p === RATES, home: RATES },
    lead: "Where an order starts: where from, where to, and roughly how heavy. Then one rate, with the others on request.",
    lanes: [
      {
        id: "rpw-290",
        ticket: "RPW-290",
        title: "Rate Check",
        story:
          "As a visitor, I want to enter where I am moving from and to, plus a rough weight, so that I get a price without filling in a long form first.",
        confirm: [ORDER_REVIEW_NOTES.rates],
        rows: [
          { kind: "positive", cells: ["rates-empty", "rates-address", "rates-filled", "rates-checking"] },
          { kind: "negative", cells: ["rates-required", "rates-no-results", "rates-no-postal", NO_SERVICE] },
        ],
      },
      {
        id: "rpw-291",
        ticket: "RPW-291",
        title: "Rate Population",
        story:
          "As a customer, I want one recommended price rather than a wall of options, so that I can decide quickly without comparing everything.",
        differs: [
          "Brief: “final price confirmed at quotation”. Prototype: the Quotation is still an estimate; the final price comes on the Invoice (the team's correction).",
        ],
        rows: [
          { kind: "positive", cells: ["rates-estimate", "rates-more", "rates-normal", "rates-rounded"] },
          { kind: "negative", cells: ["rates-below-tier", "rates-stale"] },
        ],
      },
    ],
  },
  {
    id: "plan",
    title: "Plan",
    route: PLAN,
    page: { is: (p) => p === PLAN, home: PLAN },
    lead: "The Eligibility Check, Personal Information and the Packages: three parts on one page, one open at a time, with one action.",
    lanes: [
      {
        id: "rpw-297",
        ticket: "RPW-297",
        title: "Shell and stepper",
        story:
          "As a customer partway through booking, I want to see which step I am on and move back without losing anything, so that a long form does not feel risky.",
        differs: [
          "Brief: a five-step indicator with back and next. Prototype: no stepper; the plan is one page, and a finished part folds and reopens from “Edit”.",
          "Brief: Shipment Information, then Personal Information. Prototype: Your details first, the Packages last.",
          "No footer anywhere in the flow (the team's call).",
        ],
        rows: [
          { kind: "positive", cells: ["plan-start", "plan-part-done", "plan-all-done", "plan-welcome"] },
          { kind: "negative", cells: ["plan-no-rate", "plan-missing"] },
        ],
      },
      {
        id: "rpw-296",
        ticket: "RPW-296",
        title: "Customs Education Modal",
        story:
          "As a customer, I want to understand the clearance paths and what each needs, so that I know whether to expect duty, and which documents to gather.",
        differs: [
          "Brief: two paths (Moving Goods, Personal Shipment). Prototype: three Customs Paths, with Passenger Goods (decided with the PM).",
          "Brief closes with “Which path applies is confirmed by the Rimkirim team.” Prototype: the team recommends a path at review and the customer decides (ADR 0002).",
        ],
        rows: [{ kind: "positive", cells: ["customs-first", "customs-hint", "customs-reopen"] }],
      },
      {
        id: "rpw-292",
        ticket: "RPW-292",
        title: "Eligibility Check",
        story:
          "As a business, I want the eligibility answers to decide which customs path a booking takes, so that ops can process it correctly without the customer needing to understand Indonesian customs.",
        differs: [
          "Brief: six options in Q1. Prototype: five; “Fine Art & High-Value Items” was dropped on 2026-11-20.",
          "Brief: Q2 “In Indonesia” asks the length of stay. Prototype: a date in both branches (the PM's rule v1).",
          "Under Q1 there's a “Cannot be shipped” block: information, not a question, and it doesn't stop the order.",
        ],
        confirm: [ORDER_REVIEW_NOTES.eligibility],
        rows: [
          { kind: "positive", cells: ["elig-abroad", "elig-indonesia", "elig-others"] },
          { kind: "negative", cells: ["elig-missing", "elig-followups"] },
        ],
      },
      {
        id: "rpw-292-295",
        ticket: "RPW-292 + RPW-295",
        title: "Furniture warning",
        story:
          "As a customer who owns furniture or large items, I want a clear warning as soon as I declare them, so that I am not refused at collection because I assumed Rimkirim would pack them.",
        differs: [
          "Brief: a callout with exact copy (“Please note: Rimkirim does not provide a packing service for furniture or large items…”) that appears when furniture is selected and goes when it's deselected. Prototype: the note “You pack everything yourself” always shows; furniture only adds “, furniture included”.",
          "Brief: the same warning again in Shipment Information. Prototype: not there yet.",
        ],
        rows: [{ kind: "positive", cells: ["furn-off", "furn-on", FURNITURE_PACKAGES] }],
      },
      {
        id: "rpw-293",
        ticket: "RPW-293",
        title: "Personal Information",
        story:
          "As a customer, I want to enter my details and when I am moving, so that Rimkirim can arrange pickup and reach me about the shipment.",
        differs: [
          "Brief: a Detail Address required on both sides, with a map pin. Prototype: optional, no pin (the team's call).",
          "Brief: one relocation date, its first two days closed. Prototype (the PM's revision, RPW-293, 2026-11-23): when to collect is asked first. Within 3 months a date is required, from tomorrow to day 90; more than 3 months, the date is optional. Weekends stay closed.",
          "Brief: “Confirm Application” is enabled only when everything is valid. Prototype: the button is never disabled, and shows what's missing.",
        ],
        confirm: [ORDER_REVIEW_NOTES.details],
        rows: [
          { kind: "positive", cells: ["plan-part-done", "details-address", "details-date", "details-later", "details-filled"] },
          {
            kind: "negative",
            cells: ["details-left", "details-required", "details-address-pick", "details-cleared", "details-pickup-past", "details-changed"],
          },
        ],
      },
      {
        id: "rpw-295",
        ticket: "RPW-295",
        title: "Shipment Information (Packages)",
        story:
          "As a customer, I want to list every package with its size, weight and contents, so that my quote and customs paperwork match what I am actually sending.",
        differs: [
          "Brief: each package's length, width, height and weight. Prototype: pick the closest size (Small, Medium or Large Box) or Custom; only Custom is measured (the team's revision, 2026-11-20).",
          "Brief: a description and a value per item. Prototype: a row per category, with its quantity and its value in total.",
          "Brief: an empty state with “Add package”. Prototype: it starts with Package 1.",
        ],
        confirm: [ORDER_REVIEW_NOTES.packing],
        rows: [
          { kind: "positive", cells: ["pack-start", "pack-category", "pack-filled"] },
          { kind: "negative", cells: ["pack-missing", "pack-category-empty", "pack-odd", "pack-remove", "pack-below-tier"] },
          { kind: "edge", cells: ["plan-worst", "plan-many"] },
        ],
      },
      {
        id: "service",
        ticket: "Team addition",
        title: "Change service",
        story: "Not in the brief: the service can be changed on the plan without going back to Check Rate, and every answer stays.",
        confirm: [ORDER_REVIEW_NOTES.service],
        rows: [{ kind: "positive", cells: ["service-change", "service-changed"] }],
      },
    ],
  },
  {
    id: "booking",
    title: "Booking Summary",
    route: "/expat-relocation/booking/[number]",
    // a summary exists only for a booking made on this device: the last one, else where one starts
    page: { is: (p) => p.startsWith("/expat-relocation/booking/"), home: RATES, resume: lastBooking },
    lead: "What the customer sees after Confirm application: proof the booking landed, and what happens next.",
    lanes: [
      {
        id: "rpw-294",
        ticket: "RPW-294",
        title: "Booking submit and summary",
        story:
          "As a customer who just submitted, I want immediate confirmation and a record of what I booked, so that I know it worked and what happens next.",
        differs: [
          "Not in the brief: the dialog “We'll contact you within 1 working day” on arriving (the team's request, 2026-11-23).",
          "What happens next stops at pickup; the Invoice comes once the belongings reach Rimkirim's warehouse (the team's correction).",
        ],
        confirm: [ORDER_REVIEW_NOTES.booking],
        rows: [
          { kind: "positive", cells: ["plan-confirming", "booking-fresh", "booking-summary", "booking-docs", "booking-later"] },
          { kind: "negative", cells: ["plan-confirm-failed", "booking-not-found"] },
          { kind: "edge", cells: ["booking-no-packages", "booking-many", "booking-worst"] },
        ],
      },
    ],
  },
  {
    id: "ops",
    title: "Internal ticket",
    route: "/simulator · tab “Pesanan expat”",
    page: { is: (p) => p === SIMULATOR, home: SIMULATOR },
    lead: "What reaches the team after Confirm application: a ticket with the answers, the packages, the contact and the Customs Category, and the confirmation email.",
    lanes: [
      {
        id: "rpw-294-ops",
        ticket: "RPW-294",
        title: "Handover to ops",
        story:
          "Everything reaches the internal ticket: eligibility answers, packages and contact details are carried to ops, including the internal customs flag the customer never sees.",
        differs: [
          "The Customs Category here follows the team's dummy rule (five rules, docs/expat-order-flow.md), waiting for ops to confirm.",
          "The ticket and the email are stand-ins: the ticket is kept on the device, the email is only previewed.",
        ],
        rows: [
          { kind: "positive", cells: ["ops-tickets", "ops-email"] },
          { kind: "negative", cells: ["ops-empty"] },
        ],
      },
    ],
  },
  {
    id: "landing",
    title: "Landing",
    route: LANDING,
    page: { is: (p) => p === LANDING, home: LANDING },
    lead: "The Expat Relocation landing, a lane per story. Each frame is a whole section, from its heading to its end; the hero is one screen.",
    lanes: [
      {
        id: "rpw-281",
        ticket: "RPW-281",
        title: "Hero",
        story:
          "As a relocating expat landing on the page, I want to grasp in seconds that Rimkirim ships my belongings to Indonesia, and where to start, so that I can get a quote without hunting around the page.",
        differs: ["Brief: the CTA reads “Get a quote”. Prototype: “Check your rate”, since the figure is an Estimate, not a quote (CONTEXT.md)."],
        confirm: [REVIEW_NOTES.hero, REVIEW_NOTES.cta],
        rows: [{ kind: "positive", cells: ["land-hero"] }],
      },
      {
        id: "rpw-282",
        ticket: "RPW-282",
        title: "Testimonials",
        story:
          "As a cautious first-time shipper, I want to see real customers who already moved their belongings, so that I trust Rimkirim with things I cannot replace.",
        confirm: [REVIEW_NOTES.reviews],
        rows: [{ kind: "positive", cells: ["land-reviews"] }],
      },
      {
        id: "rpw-283",
        ticket: "RPW-283",
        title: "What you can ship",
        story:
          "As a visitor deciding whether Rimkirim fits, I want to see clearly what is allowed and what is not, so that I do not start a booking that will be refused later.",
        differs: [
          "Brief: the cannot-ship list is provisional. Prototype: today's “Not allowed” list (alcohol, cigarettes and vapes, weapons, flammables, cash, jewellery, plants, motor vehicles).",
        ],
        confirm: [REVIEW_NOTES.ship],
        rows: [{ kind: "positive", cells: ["land-ship"] }],
      },
      {
        id: "rpw-284",
        ticket: "RPW-284",
        title: "Who does what",
        story:
          "As a customer, I want to see exactly which parts Rimkirim handles and which are mine, so that nothing surprises me on pickup day.",
        confirm: [REVIEW_NOTES.coordinate],
        rows: [{ kind: "positive", cells: ["land-coordinate"] }],
      },
      {
        id: "rpw-285",
        ticket: "RPW-285",
        title: "Why Rimkirim",
        story:
          "As a customer comparing shipping options, I want to see what makes Rimkirim different for Indonesia specifically, so that I can choose without reading three competitor sites.",
        confirm: [REVIEW_NOTES.compare],
        rows: [{ kind: "positive", cells: ["land-why"] }],
      },
      {
        id: "rpw-286",
        ticket: "RPW-286",
        title: "Pricing information",
        story:
          "As a customer, I want to understand what actually shapes my price, so that the number does not feel arbitrary when I see it.",
        differs: [
          "Brief: “final price confirmed at quotation”. Prototype: the Quotation is still an estimate; the final price comes on the Invoice (the team's correction).",
        ],
        confirm: [REVIEW_NOTES.pricing],
        rows: [{ kind: "positive", cells: ["land-pricing"] }],
      },
      {
        id: "rpw-287",
        ticket: "RPW-287",
        title: "How it works",
        story:
          "As a customer, I want a simple step-by-step of what happens from quote to delivery, so that I know what I am committing to before I start.",
        differs: ["Brief: two duty paths (moving goods, personal shipment). Prototype: three Customs Paths, in a section of their own after the steps."],
        confirm: [REVIEW_NOTES.steps, REVIEW_NOTES.customs],
        rows: [{ kind: "positive", cells: ["land-steps", "land-customs"] }],
      },
      {
        id: "rpw-288",
        ticket: "RPW-288",
        title: "FAQs",
        story:
          "As a customer with specific questions, I want answers to the common questions in one place, so that I do not have to open WhatsApp to learn the basics.",
        confirm: [REVIEW_NOTES.faq],
        rows: [{ kind: "positive", cells: ["land-faq", "land-faq-open"] }],
      },
      {
        id: "rpw-289",
        ticket: "RPW-289",
        title: "Closing CTA",
        story: "As a visitor who has read to the bottom, I want an obvious way to begin, so that I do not have to scroll back to the top to act.",
        confirm: [REVIEW_NOTES.closing],
        rows: [{ kind: "positive", cells: ["land-closing"] }],
      },
    ],
  },
];
