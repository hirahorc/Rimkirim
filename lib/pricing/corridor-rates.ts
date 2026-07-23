/**
 * Mock corridor rate table.
 *
 * Rates are keyed by shipping `Zone` (the non-Indonesia endpoint's zone),
 * giving a base per-kg rate (IDR) and a baseline ETA range in days.
 * The corridor is symmetric for this mock (import vs export use the same zone
 * rate); a real table would differentiate direction.
 */

import type { Zone } from "@/lib/data/countries";

export interface ZoneRate {
  /** base rate per chargeable kg, IDR — before vendor multiplier */
  perKg: number;
  etaMin: number; // days
  etaMax: number; // days
}

export const ZONE_RATES: Record<Zone, ZoneRate> = {
  ASEAN: { perKg: 62_000, etaMin: 2, etaMax: 4 },
  EAST_ASIA: { perKg: 78_000, etaMin: 3, etaMax: 5 },
  SOUTH_ASIA: { perKg: 88_000, etaMin: 4, etaMax: 7 },
  OCEANIA: { perKg: 96_000, etaMin: 4, etaMax: 6 },
  EUROPE: { perKg: 118_000, etaMin: 5, etaMax: 8 },
  MIDDLE_EAST: { perKg: 104_000, etaMin: 4, etaMax: 7 },
  AFRICA: { perKg: 132_000, etaMin: 6, etaMax: 10 },
  NORTH_AMERICA: { perKg: 126_000, etaMin: 5, etaMax: 8 },
  LATIN_AMERICA: { perKg: 148_000, etaMin: 7, etaMax: 11 },
};

/** Base "special rate" offer shown in Base mode. */
export const SPECIAL_RATE = {
  perKg: 135_000,
  minWeightKg: 21,
} as const;
