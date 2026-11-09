import { getCountry } from "@/lib/data/countries";
import { dialCodeFor } from "@/lib/data/dial-codes";
import { placeLine } from "@/lib/data/expat-places";
import type { ExpatBooking } from "@/lib/order/expat-order";
import { messages } from "@/lib/i18n/messages";
import { formatIDR } from "@/lib/utils/currency";

type T = (path: string) => string;

/** the English catalog, for what leaves in English whatever the reader's
 *  language: the email an expat receives, previewed in the Indonesian ops
 *  simulator */
export const englishT: T = (path) => {
  let node: unknown = messages.en;
  for (const p of path.split(".")) {
    if (node && typeof node === "object" && p in node) node = (node as Record<string, unknown>)[p];
    else return path;
  }
  return typeof node === "string" ? node : path;
};

/** "Monday 16 November 2026", local, from "YYYY-MM-DD" */
export function longDate(iso: string | undefined): string {
  const m = iso && /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}

/**
 * What a Booking Summary says, worked out once for the page and the email so
 * the two can never disagree. Never the Customs Category: it stays internal.
 */
export function bookingFacts(b: ExpatBooking, t: T) {
  const bk = (k: string) => t(`expatOrder.booking.${k}`);
  const e = (k: string) => t(`expatOrder.eligibility.${k}`);
  const { check, rate, eligibility: a, details: d } = b;

  const items = a.items.map((c) => (c === "others" && a.itemsOther.trim() ? `${e("items.others")}: ${a.itemsOther.trim()}` : e(`items.${c}`)));
  const yesNo = (v: boolean | undefined) => (v === undefined ? "" : v ? e("yes") : e("no"));

  const answers: [string, string][] = [
    [bk("location"), a.location === "abroad" ? e("abroad") : a.location === "indonesia" ? e("indonesia") : ""],
    a.location === "abroad" ? [bk("arrival"), longDate(a.arrivalDate)] : [bk("stay"), a.stayLength ? e(`stays.${a.stayLength}`) : ""],
    [bk("visa"), yesNo(a.hasVisa)],
    ...(a.hasVisa ? ([[bk("vitas"), yesNo(a.hasVitas)], [bk("itas"), yesNo(a.hasItas)]] as [string, string][]) : []),
    [bk("reason"), a.reason === "others" ? `${e("reasons.others")}: ${a.reasonOther.trim()}` : a.reason ? e(`reasons.${a.reason}`) : ""],
  ];

  return {
    number: b.number,
    from: {
      country: getCountry(check.originCountry)?.name ?? check.originCountry,
      address: placeLine(check.origin),
      detail: d.originDetail.trim(),
    },
    to: {
      country: "Indonesia",
      address: placeLine(check.destination),
      detail: d.destinationDetail.trim(),
    },
    shipping: {
      service: `${rate.carrier} ${rate.service}`,
      special: rate.special,
      transit: t("expatOrder.service.transitValue").replace("{min}", String(rate.etaMin)).replace("{max}", String(rate.etaMax)),
      weight: t("expatOrder.service.weightValue").replace("{kg}", String(rate.chargedKg)),
      estimate: formatIDR(rate.total),
    },
    items,
    packReminder: bk("packReminder").replace("{furniture}", a.items.includes("furniture") ? bk("packFurniture") : ""),
    pickup: longDate(d.pickupDate),
    contact: {
      name: d.fullName.trim(),
      email: d.email.trim(),
      phone: `${dialCodeFor(d.dialIso) ?? ""} ${d.phone.trim()}`.trim(),
    },
    answers,
    next: [
      { title: bk("next1Title"), body: bk("next1Body") },
      { title: bk("next2Title"), body: bk("next2Body") },
      {
        title: bk("next3Title"),
        body: bk("next3Body").replace("{date}", longDate(d.pickupDate)),
      },
    ],
  };
}

export type BookingFacts = ReturnType<typeof bookingFacts>;
