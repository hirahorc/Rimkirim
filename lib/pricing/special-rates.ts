/**
 * Special rate table — IMPORT direction only (Back For Good: foreign → Indonesia).
 *
 * Rates differ per country and are tiered by chargeable weight.
 * NOT every country has a special rate.
 *
 * Lookup precedence: an exact country entry always wins over a zone-wide entry
 * (e.g. Serbia / Estonia / Türkiye override the generic "UK / Europe" rate).
 *
 * Export (Moving Abroad) special rates are not published yet.
 */

import type { Zone } from "@/lib/data/countries";

export interface RateTier {
  /** inclusive lower bound, kg */
  minKg: number;
  /** inclusive upper bound, kg; omitted = no upper limit */
  maxKg?: number;
  pricePerKg: number;
  /** verbatim range label from the published rate sheet */
  display: string;
  /** rate sheet marks this tier as a flat rate */
  flat?: boolean;
}

/** Price that varies by destination region rather than by weight (e.g. Malaysia). */
export interface RateRegion {
  label: string;
  pricePerKg: number;
}

export interface SpecialRateEntry {
  /** display name as published, e.g. "Australia & New Zealand" */
  label: string;
  /** ISO codes this entry covers */
  countries?: string[];
  /** or an entire zone (lower precedence than `countries`) */
  zone?: Zone;
  tiers: RateTier[];
  /**
   * When set, the rate depends on the destination region, not the weight.
   * `tiers` then carries the minimum weight at the cheapest region rate,
   * and the UI shows this region table instead of a weight table.
   */
  regions?: RateRegion[];
  /** carrier fulfilling this rate; defaults to FedEx International Economy */
  carrier?: string;
  service?: string;
  /** extra condition shown to the customer */
  note?: string;
}

/** Published minimum for most corridors; some countries start lower (China, Thailand). */
export const DEFAULT_MIN_WEIGHT_KG = 21;

/** Every special rate is fulfilled by FedEx International Economy unless stated. */
export const DEFAULT_SPECIAL_RATE_SERVICE = {
  carrier: "FedEx",
  service: "International Economy",
} as const;

/** Carrier + service for an entry, applying the FedEx Economy default. */
export function serviceOf(entry: SpecialRateEntry): {
  carrier: string;
  service: string;
} {
  return {
    carrier: entry.carrier ?? DEFAULT_SPECIAL_RATE_SERVICE.carrier,
    service: entry.service ?? DEFAULT_SPECIAL_RATE_SERVICE.service,
  };
}

export const IMPORT_SPECIAL_RATES: SpecialRateEntry[] = [
  {
    label: "Australia & New Zealand",
    countries: ["AU", "NZ"],
    tiers: [
      { minKg: 21, maxKg: 24, pricePerKg: 195_000, display: "21–24 kg" },
      { minKg: 25, maxKg: 40, pricePerKg: 175_000, display: "25–40 kg" },
      { minKg: 41, pricePerKg: 165_000, display: "> 40 kg", flat: true },
    ],
  },
  {
    label: "Japan",
    countries: ["JP"],
    tiers: [{ minKg: 21, pricePerKg: 92_000, display: "min. 21 kg" }],
  },
  {
    label: "UK / Europe",
    zone: "EUROPE",
    tiers: [{ minKg: 21, pricePerKg: 135_000, display: "min. 21 kg" }],
  },
  {
    label: "Malaysia",
    countries: ["MY"],
    tiers: [{ minKg: 21, pricePerKg: 82_000, display: "min. 21 kg" }],
  },
  {
    label: "Singapore",
    countries: ["SG"],
    tiers: [{ minKg: 21, pricePerKg: 82_000, display: "min. 21 kg" }],
  },
  {
    label: "United Arab Emirates",
    countries: ["AE"],
    tiers: [
      { minKg: 25, maxKg: 49, pricePerKg: 261_000, display: "25–49 kg" },
      { minKg: 50, pricePerKg: 202_000, display: "≥ 50 kg" },
    ],
  },
  {
    label: "Saudi Arabia",
    countries: ["SA"],
    tiers: [{ minKg: 21, pricePerKg: 280_000, display: "> 21 kg" }],
  },
  {
    label: "USA & Canada",
    countries: ["US", "CA"],
    tiers: [
      { minKg: 21, maxKg: 44, pricePerKg: 208_000, display: "21–44 kg" },
      { minKg: 45, pricePerKg: 145_000, display: "> 45 kg", flat: true },
    ],
  },
  {
    label: "South Korea",
    countries: ["KR"],
    tiers: [
      { minKg: 21, maxKg: 30, pricePerKg: 135_000, display: "21–30 kg" },
      { minKg: 31, pricePerKg: 125_000, display: "> 31 kg" },
    ],
  },
  {
    label: "China",
    countries: ["CN"],
    tiers: [
      { minKg: 10, maxKg: 15, pricePerKg: 209_000, display: "10–15 kg" },
      { minKg: 16, maxKg: 20, pricePerKg: 170_000, display: "16–20 kg" },
      { minKg: 21, pricePerKg: 135_000, display: "> 21 kg" },
    ],
  },
  {
    label: "Serbia",
    countries: ["RS"],
    tiers: [{ minKg: 21, pricePerKg: 280_000, display: "> 21 kg" }],
    // rate sheet marks this corridor as FedEx Priority only
    carrier: "FedEx",
    service: "International Priority",
    note: "note.serbiaPriority",
  },
  {
    label: "Thailand",
    countries: ["TH"],
    tiers: [
      { minKg: 15, maxKg: 20, pricePerKg: 140_000, display: "15–20 kg" },
      { minKg: 21, pricePerKg: 110_000, display: "> 21 kg", flat: true },
    ],
  },
  {
    label: "Estonia",
    countries: ["EE"],
    tiers: [{ minKg: 21, pricePerKg: 100_000, display: "min. 21 kg" }],
  },
  {
    label: "Vietnam",
    countries: ["VN"],
    tiers: [{ minKg: 21, pricePerKg: 140_000, display: "> 21 kg" }],
  },
  {
    label: "Türkiye",
    countries: ["TR"],
    tiers: [{ minKg: 21, pricePerKg: 200_000, display: "> 21 kg" }],
  },
];

/**
 * EXPORT direction (Moving Abroad: Indonesia → destination).
 * Single-rate corridors with a 21 kg minimum, except Malaysia (West & East) and
 * Singapore, whose special rates start from 1 kg.
 */
export const EXPORT_SPECIAL_RATES: SpecialRateEntry[] = [
  {
    label: "Macau",
    countries: ["MO"],
    tiers: [{ minKg: 21, pricePerKg: 120_000, display: "min. 21 kg" }],
  },
  {
    label: "Japan",
    countries: ["JP"],
    tiers: [{ minKg: 21, pricePerKg: 135_000, display: "min. 21 kg" }],
  },
  {
    label: "United Kingdom",
    countries: ["GB"],
    tiers: [{ minKg: 21, pricePerKg: 170_000, display: "min. 21 kg" }],
  },
  {
    label: "Australia",
    countries: ["AU"],
    tiers: [{ minKg: 21, pricePerKg: 160_000, display: "min. 21 kg" }],
  },
  {
    label: "Netherlands",
    countries: ["NL"],
    tiers: [{ minKg: 21, pricePerKg: 170_000, display: "min. 21 kg" }],
  },
  {
    label: "Germany",
    countries: ["DE"],
    tiers: [{ minKg: 21, pricePerKg: 170_000, display: "min. 21 kg" }],
  },
  {
    label: "Saudi Arabia",
    countries: ["SA"],
    tiers: [{ minKg: 21, pricePerKg: 200_000, display: "min. 21 kg" }],
  },
  {
    label: "Thailand",
    countries: ["TH"],
    tiers: [{ minKg: 21, pricePerKg: 110_000, display: "min. 21 kg" }],
  },
  {
    label: "Malaysia",
    countries: ["MY"],
    // rate depends on region; tier holds the cheapest (West) as the baseline
    tiers: [{ minKg: 1, pricePerKg: 90_000, display: "min. 1 kg" }],
    regions: [
      { label: "Malaysia West", pricePerKg: 90_000 },
      { label: "Malaysia East", pricePerKg: 130_000 },
    ],
    note: "note.malaysiaRegion",
  },
  {
    label: "Singapore",
    countries: ["SG"],
    tiers: [{ minKg: 1, pricePerKg: 85_000, display: "min. 1 kg" }],
  },
  {
    label: "Canada",
    countries: ["CA"],
    tiers: [{ minKg: 21, pricePerKg: 220_000, display: "min. 21 kg" }],
  },
  {
    label: "USA",
    countries: ["US"],
    tiers: [{ minKg: 21, pricePerKg: 175_000, display: "min. 21 kg" }],
  },
  {
    label: "Philippines",
    countries: ["PH"],
    tiers: [{ minKg: 21, pricePerKg: 130_000, display: "min. 21 kg" }],
    carrier: "UPS",
    service: "Worldwide Expedited",
  },
  {
    label: "South Africa",
    countries: ["ZA"],
    tiers: [{ minKg: 21, pricePerKg: 175_000, display: "min. 21 kg" }],
  },
  {
    label: "Türkiye",
    countries: ["TR"],
    tiers: [{ minKg: 21, pricePerKg: 200_000, display: "min. 21 kg" }],
  },
];

export type RateDirection = "import" | "export";

/**
 * Resolve the special rate for a foreign country in a given direction.
 * Country-specific entries take precedence over zone-wide entries.
 * Returns undefined when the corridor has no published special rate.
 */
export function findSpecialRate(
  countryCode: string | undefined,
  zone: Zone | undefined,
  direction: RateDirection,
): SpecialRateEntry | undefined {
  if (!countryCode) return undefined;
  const table =
    direction === "import" ? IMPORT_SPECIAL_RATES : EXPORT_SPECIAL_RATES;
  const byCountry = table.find((r) => r.countries?.includes(countryCode));
  if (byCountry) return byCountry;
  if (!zone) return undefined;
  return table.find((r) => r.zone === zone);
}

/** Lowest weight the corridor accepts = lower bound of its first tier. */
export function minWeightOf(entry: SpecialRateEntry): number {
  return Math.min(...entry.tiers.map((t) => t.minKg));
}

/** The tier that applies to a given chargeable weight. */
export function tierForWeight(
  entry: SpecialRateEntry,
  weightKg: number,
): RateTier | undefined {
  return entry.tiers.find(
    (t) => weightKg >= t.minKg && (t.maxKg === undefined || weightKg <= t.maxKg),
  );
}

/** "Mulai dari" price = minimum weight × the rate that applies at that weight. */
export function startingPriceOf(entry: SpecialRateEntry): {
  minWeightKg: number;
  pricePerKg: number;
  total: number;
} {
  const minWeightKg = minWeightOf(entry);
  const tier = tierForWeight(entry, minWeightKg) ?? entry.tiers[0];
  return {
    minWeightKg,
    pricePerKg: tier.pricePerKg,
    total: tier.pricePerKg * minWeightKg,
  };
}
