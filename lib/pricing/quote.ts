/**
 * Quote engine — the single place where a real rate/3PL API would plug in.
 * Combines corridor rate × chargeable weight + surcharges per vendor.
 */

import { getCountry, type Country } from "@/lib/data/countries";
import { VENDORS, type Vendor } from "@/lib/data/vendors";
import { ZONE_RATES } from "@/lib/pricing/corridor-rates";
import {
  findSpecialRate,
  startingPriceOf,
  serviceOf,
  type SpecialRateEntry,
  type RateDirection,
} from "@/lib/pricing/special-rates";
import {
  aggregateSurcharges,
  type SurchargeLine,
  type PackageWithFlags,
} from "@/lib/pricing/surcharge-engine";
import { totalChargeableWeight } from "@/lib/utils/chargeable-weight";

export type ServiceType = "bfg" | "moving-abroad";
export type CalcMode = "base" | "advance";

export interface QuoteInput {
  service: ServiceType;
  mode: CalcMode;
  originCountry: string; // ISO code
  destCountry: string; // ISO code
  packages: PackageWithFlags[];
}

export interface RouteInfo {
  origin: Country | undefined;
  destination: Country | undefined;
  /** the non-Indonesia endpoint that drives zone pricing */
  foreign: Country | undefined;
}

export interface VendorQuote {
  vendor: Vendor;
  baseRatePerKg: number;
  baseRate: number;
  surcharges: SurchargeLine[];
  surchargeTotal: number;
  total: number;
  pricePerKg: number;
  etaMin: number;
  etaMax: number;
}

/** One weight tier of a special rate, priced as its own offer. */
export interface SpecialRateTierQuote {
  /** verbatim range label, e.g. "21–24 kg" */
  display: string;
  minKg: number;
  maxKg?: number;
  flat?: boolean;
  pricePerKg: number;
  /** minKg × pricePerKg — the entry price for this tier */
  startingTotal: number;
}

export interface SpecialRateQuote {
  entry: SpecialRateEntry;
  /** carrier + service fulfilling this rate */
  carrier: string;
  service: string;
  /** one entry per weight tier; rendered as separate cards */
  tiers: SpecialRateTierQuote[];
  /** minimum accepted weight for this corridor */
  minWeightKg: number;
  /** per-kg rate that applies at the minimum weight */
  startingPerKg: number;
  /** minWeightKg × startingPerKg */
  startingTotal: number;
  etaMin: number;
  etaMax: number;
}

/** Why no special rate could be shown. */
export type SpecialRateUnavailable = "no-rate-for-country";

export interface QuoteResult {
  route: RouteInfo;
  chargeableWeight: number;
  /** Base-mode special offer; null when the corridor has none. */
  special: SpecialRateQuote | null;
  /** Set when `special` is null. */
  specialUnavailable?: SpecialRateUnavailable;
  /** Advance-mode vendor comparison (empty in Base mode). */
  options: VendorQuote[];
}

/** Resolve which endpoint is the foreign (zone-driving) country. */
export function resolveRoute(input: QuoteInput): RouteInfo {
  const origin = getCountry(input.originCountry);
  const destination = getCountry(input.destCountry);
  const foreign = input.service === "bfg" ? origin : destination;
  return { origin, destination, foreign };
}

function computeVendorQuote(
  vendor: Vendor,
  perKgBase: number,
  chargeableWeight: number,
  surcharges: SurchargeLine[],
  surchargeTotal: number,
  etaMin: number,
  etaMax: number,
): VendorQuote {
  const baseRatePerKg = Math.round(perKgBase * vendor.rateMultiplier);
  const baseRate = baseRatePerKg * chargeableWeight;
  const total = baseRate + surchargeTotal;
  const pricePerKg = chargeableWeight > 0 ? total / chargeableWeight : baseRatePerKg;
  return {
    vendor,
    baseRatePerKg,
    baseRate,
    surcharges,
    surchargeTotal,
    total,
    pricePerKg,
    etaMin: Math.max(1, etaMin + vendor.etaModifier),
    etaMax: Math.max(2, etaMax + vendor.etaModifier),
  };
}

export function calculateQuotes(input: QuoteInput): QuoteResult {
  const route = resolveRoute(input);
  const zone = route.foreign?.zone;
  const zoneRate = zone ? ZONE_RATES[zone] : ZONE_RATES.ASEAN;

  const chargeableWeight = totalChargeableWeight(input.packages ?? []);

  // Import (Back For Good) and export (Moving Abroad) have separate rate tables.
  const direction: RateDirection = input.service === "bfg" ? "import" : "export";
  let special: SpecialRateQuote | null = null;
  let specialUnavailable: SpecialRateUnavailable | undefined;

  const entry = findSpecialRate(route.foreign?.code, zone, direction);
  if (!entry) {
    specialUnavailable = "no-rate-for-country";
  } else {
    const start = startingPriceOf(entry);
    special = {
      entry,
      ...serviceOf(entry),
      tiers: entry.tiers.map((t) => ({
        display: t.display,
        minKg: t.minKg,
        maxKg: t.maxKg,
        flat: t.flat,
        pricePerKg: t.pricePerKg,
        startingTotal: t.pricePerKg * t.minKg,
      })),
      minWeightKg: start.minWeightKg,
      startingPerKg: start.pricePerKg,
      startingTotal: start.total,
      etaMin: zoneRate.etaMin,
      etaMax: zoneRate.etaMax,
    };
  }

  let options: VendorQuote[] = [];
  if (input.mode === "advance" && chargeableWeight > 0) {
    const { lines, total: surchargeTotal } = aggregateSurcharges(input.packages);
    options = VENDORS.map((v) =>
      computeVendorQuote(
        v,
        zoneRate.perKg,
        chargeableWeight,
        lines,
        surchargeTotal,
        zoneRate.etaMin,
        zoneRate.etaMax,
      ),
    ).sort((a, b) => a.total - b.total);
  }

  return { route, chargeableWeight, special, specialUnavailable, options };
}
