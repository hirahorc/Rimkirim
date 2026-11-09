/**
 * Expat Relocation rates (Check Rate), mock. Import only: a foreign country
 * to Indonesia, priced on the entered weight alone (the epic asks for no
 * dimensions at this step).
 *
 * Population rules, from the epic and the team's decisions:
 * - The weight is rounded up to a whole kg before pricing (a dummy rule; dev
 *   sets the real one), so 24.5 kg prices as 25 kg and never falls between
 *   two tiers.
 * - A Special Rate is shown first whenever the country has one with a tier
 *   for that weight, even when a Normal Rate would be cheaper. Below its
 *   first tier the country has no Special Rate for this weight, and the
 *   cheapest Normal Rate leads instead.
 * - Every other rate follows, cheapest first, under "See more rates".
 *
 * The Normal Rates are dummy carrier services (FedEx and UPS, as on the live
 * page), banded by weight like the live ones, and always dearer per kg than
 * the country's Special Rate so the demo never contradicts the priority.
 * Swap this module for the real rate API; callers only read `ExpatRates`.
 */

import { getCountry, type Zone } from "@/lib/data/countries";
import {
  findSpecialRate,
  minWeightOf,
  serviceOf,
  tierForWeight,
} from "@/lib/pricing/special-rates";

export interface ExpatRate {
  /** stable per route and weight, e.g. "special" or "ups-expedited" */
  id: string;
  carrier: string;
  service: string;
  special: boolean;
  /** IDR per charged kg */
  perKg: number;
  /** the rounded-up weight the price is worked on */
  chargedKg: number;
  /** perKg × chargedKg, IDR */
  total: number;
  /** transit days, clearance excluded */
  etaMin: number;
  etaMax: number;
}

export interface ExpatRates {
  /** the weight as priced: the entered weight rounded up */
  chargedKg: number;
  /** the rate shown first, then the rest cheapest first */
  rates: ExpatRate[];
  /** set when the country has a Special Rate but not for this weight: the
   *  weight it starts at */
  specialFromKg?: number;
}

/** dummy Normal Rate base per kg at 21–44 kg, by the foreign zone (IDR) */
const NORMAL_BASE: Record<Zone, number> = {
  ASEAN: 168_000,
  EAST_ASIA: 196_000,
  SOUTH_ASIA: 214_000,
  OCEANIA: 232_000,
  EUROPE: 268_000,
  MIDDLE_EAST: 254_000,
  AFRICA: 296_000,
  NORTH_AMERICA: 286_000,
  LATIN_AMERICA: 318_000,
};

/** the dummy services, each a multiple of the base and its transit days */
const SERVICES = [
  { id: "ups-expedited", carrier: "UPS", service: "Expedited", factor: 1, etaMin: 3, etaMax: 5 },
  { id: "fedex-economy", carrier: "FedEx", service: "International Economy", factor: 1.01, etaMin: 3, etaMax: 6 },
  { id: "ups-saver", carrier: "UPS", service: "Express Saver", factor: 1.06, etaMin: 2, etaMax: 4 },
  { id: "fedex-priority", carrier: "FedEx", service: "International Priority", factor: 1.13, etaMin: 2, etaMax: 3 },
  { id: "ups-express", carrier: "UPS", service: "Worldwide Express", factor: 1.24, etaMin: 1, etaMax: 3 },
] as const;

/** Special Rate transit days, FedEx International Economy on every corridor */
const SPECIAL_ETA = { etaMin: 4, etaMax: 8 } as const;

/** light shipments cost more per kg, heavy ones less, as on the live bands */
function bandFactor(kg: number): number {
  if (kg < 21) return 1.16;
  if (kg < 45) return 1;
  return 0.92;
}

/** the rounding rule: up to the next whole kg (dummy) */
export function chargedWeight(kg: number): number {
  return Math.max(1, Math.ceil(kg));
}

export function expatRates(originCountry: string, weightKg: number): ExpatRates {
  const country = getCountry(originCountry);
  const chargedKg = chargedWeight(weightKg);
  const entry = findSpecialRate(country?.code, country?.zone, "import");
  const tier = entry ? tierForWeight(entry, chargedKg) : undefined;

  // keep every Normal Rate above the country's dearest Special Rate tier
  const specialCeiling = entry ? Math.max(...entry.tiers.map((t) => t.pricePerKg)) : 0;
  const base = Math.max(NORMAL_BASE[country?.zone ?? "ASEAN"], Math.round(specialCeiling * 1.2));
  const band = bandFactor(chargedKg);

  const normal: ExpatRate[] = SERVICES.map((s) => {
    const perKg = Math.round((base * s.factor * band) / 100) * 100;
    return {
      id: s.id,
      carrier: s.carrier,
      service: s.service,
      special: false,
      perKg,
      chargedKg,
      total: perKg * chargedKg,
      etaMin: s.etaMin,
      etaMax: s.etaMax,
    };
  }).sort((a, b) => a.total - b.total);

  if (entry && tier) {
    const { carrier, service } = serviceOf(entry);
    const special: ExpatRate = {
      id: "special",
      carrier,
      service,
      special: true,
      perKg: tier.pricePerKg,
      chargedKg,
      total: tier.pricePerKg * chargedKg,
      ...SPECIAL_ETA,
    };
    return { chargedKg, rates: [special, ...normal] };
  }

  return {
    chargedKg,
    rates: normal,
    specialFromKg: entry ? minWeightOf(entry) : undefined,
  };
}
