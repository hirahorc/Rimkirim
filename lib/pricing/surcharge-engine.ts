/**
 * Surcharge engine — implemented directly from Rimkirim's
 * "Updated Surcharges & Conditions" reference (AHS = Additional Handling Surcharge).
 *
 * A package is first classified as either "Parcels/Express" or "Large",
 * then the relevant Additional Handling Surcharges are applied.
 *
 * Girth (standard carrier definition): 2 × (second-longest side + shortest side).
 * The single longest side is excluded from girth.
 *
 * Surcharges are per-package; the caller multiplies by quantity.
 */

import type { PackageDims } from "@/lib/utils/chargeable-weight";

export type ShipmentClass = "parcel" | "large";

export interface SurchargeLine {
  code: string;
  label: string;
  amount: number; // IDR, per single package
  /** true if driven by an optional user flag rather than dimensions */
  optional?: boolean;
}

export interface PackageAssessment {
  shipmentClass: ShipmentClass;
  longest: number;
  secondLongest: number;
  shortest: number;
  girth: number;
  volume: number; // cm³
  surcharges: SurchargeLine[];
  /** sum of surcharge amounts for one package */
  surchargeTotal: number;
}

/** Optional, condition-based flags that cannot be derived from dimensions. */
export interface SurchargeFlags {
  /** outer packaging not corrugated cardboard / fully taped / wrapped */
  nonStandardPackaging?: boolean;
  /** package cannot be stacked */
  nonStackable?: boolean;
}

// --- Surcharge amounts (IDR) ---------------------------------------------
export const SURCHARGE = {
  // Parcels / Express
  OVERSIZE: 1_072_000,
  OVERDIMENSION: 495_000,
  OVERWEIGHT: 495_000,
  PACKAGING: 495_000,
  // Large
  FREIGHT: 2_944_000,
  NON_STACKABLE: 3_700_000,
  UNAUTHORIZED_FREIGHT: 7_306_000,
} as const;

function sortedDims(p: PackageDims) {
  const [shortest, secondLongest, longest] = [p.length, p.width, p.height].sort(
    (a, b) => a - b,
  );
  return { shortest, secondLongest, longest };
}

/** Girth = 2 × (second longest + shortest). */
export function girthOf(p: PackageDims): number {
  const { secondLongest, shortest } = sortedDims(p);
  return 2 * (secondLongest + shortest);
}

/**
 * Classify a package.
 * Large if: girth > 330 cm OR actual weight > 68 kg OR longest side > 274 cm.
 * Otherwise Parcels/Express.
 */
export function classifyPackage(p: PackageDims): ShipmentClass {
  const { longest } = sortedDims(p);
  const girth = girthOf(p);
  if (girth > 330 || p.weight > 68 || longest > 274) return "large";
  return "parcel";
}

/** Full per-package assessment: class + applicable surcharges. */
export function assessPackage(p: PackageDims, flags: SurchargeFlags = {}): PackageAssessment {
  const { shortest, secondLongest, longest } = sortedDims(p);
  const girth = 2 * (secondLongest + shortest);
  const volume = p.length * p.width * p.height;
  const shipmentClass = classifyPackage(p);
  const surcharges: SurchargeLine[] = [];

  if (shipmentClass === "parcel") {
    // 1. Oversize
    if (longest > 243 || volume > 283_168 || p.weight > 50) {
      surcharges.push({
        code: "OVERSIZE",
        label: "Additional Handling — Oversize",
        amount: SURCHARGE.OVERSIZE,
      });
    }
    // 2. Overdimension
    if (girth > 266 || longest > 121 || secondLongest > 76 || volume > 169_901) {
      surcharges.push({
        code: "OVERDIMENSION",
        label: "Additional Handling — Overdimension",
        amount: SURCHARGE.OVERDIMENSION,
      });
    }
    // 3. Overweight
    if (p.weight > 25) {
      surcharges.push({
        code: "OVERWEIGHT",
        label: "Additional Handling — Overweight",
        amount: SURCHARGE.OVERWEIGHT,
      });
    }
    // 4. Packaging (optional flag)
    if (flags.nonStandardPackaging) {
      surcharges.push({
        code: "PACKAGING",
        label: "Additional Handling — Packaging",
        amount: SURCHARGE.PACKAGING,
        optional: true,
      });
    }
  } else {
    // LARGE
    // 1. Freight
    if (longest > 157) {
      surcharges.push({
        code: "FREIGHT",
        label: "Additional Handling — Freight",
        amount: SURCHARGE.FREIGHT,
      });
    }
    // 2. Non-Stackable (optional flag)
    if (flags.nonStackable) {
      surcharges.push({
        code: "NON_STACKABLE",
        label: "Non-Stackable Surcharge",
        amount: SURCHARGE.NON_STACKABLE,
        optional: true,
      });
    }
    // 3. Unauthorized Freight
    if (girth > 762 || longest > 302 || p.weight > 1_995) {
      surcharges.push({
        code: "UNAUTHORIZED_FREIGHT",
        label: "Unauthorized Freight Charge",
        amount: SURCHARGE.UNAUTHORIZED_FREIGHT,
      });
    }
  }

  // Only ONE Additional Handling Surcharge applies per package — the highest.
  // If several are triggered, keep the most expensive line (first wins on ties).
  const highest = surcharges.reduce<SurchargeLine | null>(
    (max, l) => (max === null || l.amount > max.amount ? l : max),
    null,
  );
  const appliedSurcharges = highest ? [highest] : [];
  const surchargeTotal = highest ? highest.amount : 0;

  return {
    shipmentClass,
    longest,
    secondLongest,
    shortest,
    girth,
    volume,
    surcharges: appliedSurcharges,
    surchargeTotal,
  };
}

/** A package plus its own optional condition flags. */
export type PackageWithFlags = PackageDims & SurchargeFlags;

/**
 * Aggregate surcharges across all package rows (× quantity),
 * returning combined line items keyed by code with a summed amount.
 * Optional condition flags are read PER PACKAGE, not shared across the shipment.
 */
export function aggregateSurcharges(packages: PackageWithFlags[]): {
  lines: SurchargeLine[];
  total: number;
} {
  const byCode = new Map<string, SurchargeLine>();

  for (const p of packages) {
    const qty = Math.max(1, p.quantity);
    const { surcharges } = assessPackage(p, {
      nonStandardPackaging: p.nonStandardPackaging,
      nonStackable: p.nonStackable,
    });
    for (const line of surcharges) {
      const existing = byCode.get(line.code);
      const add = line.amount * qty;
      if (existing) {
        existing.amount += add;
      } else {
        byCode.set(line.code, { ...line, amount: add });
      }
    }
  }

  const lines = [...byCode.values()];
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { lines, total };
}
