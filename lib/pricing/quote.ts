/**
 * Quote engine — the single place where a real rate/3PL API would plug in.
 * Combines corridor rate × chargeable weight + surcharges per vendor.
 */

import { getCountry, type Country } from "@/lib/data/countries";
import { VENDORS, type Vendor } from "@/lib/data/vendors";
import { ZONE_RATES, SPECIAL_RATE } from "@/lib/pricing/corridor-rates";
import {
  aggregateSurcharges,
  type SurchargeFlags,
  type SurchargeLine,
} from "@/lib/pricing/surcharge-engine";
import {
  totalChargeableWeight,
  type PackageDims,
} from "@/lib/utils/chargeable-weight";

export type ServiceType = "bfg" | "moving-abroad";
export type CalcMode = "base" | "advance";

export interface QuoteInput {
  service: ServiceType;
  mode: CalcMode;
  originCountry: string; // ISO code
  destCountry: string; // ISO code
  packages: PackageDims[];
  flags?: SurchargeFlags;
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

export interface SpecialRateQuote {
  perKg: number;
  minWeightKg: number;
  minTotal: number;
  etaMin: number;
  etaMax: number;
}

export interface QuoteResult {
  route: RouteInfo;
  chargeableWeight: number;
  /** Base-mode special offer (always computable). */
  special: SpecialRateQuote;
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

  const special: SpecialRateQuote = {
    perKg: SPECIAL_RATE.perKg,
    minWeightKg: SPECIAL_RATE.minWeightKg,
    minTotal: SPECIAL_RATE.perKg * SPECIAL_RATE.minWeightKg,
    etaMin: zoneRate.etaMin,
    etaMax: zoneRate.etaMax,
  };

  let options: VendorQuote[] = [];
  if (input.mode === "advance" && chargeableWeight > 0) {
    const { lines, total: surchargeTotal } = aggregateSurcharges(
      input.packages,
      input.flags ?? {},
    );
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

  return { route, chargeableWeight, special, options };
}
