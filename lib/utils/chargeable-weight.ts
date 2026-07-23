/**
 * Volumetric / chargeable weight helpers.
 *
 * Carriers charge on the space a package occupies, not only its mass.
 *   Volumetric Weight (kg) = (L × W × H cm) / 5000
 *   Chargeable Weight (kg) = max(Actual Weight, Volumetric Weight)
 */

export const VOLUMETRIC_DIVISOR = 5000;

export interface PackageDims {
  /** actual weight per single package, kg */
  weight: number;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  /** number of identical packages */
  quantity: number;
}

export function volumetricWeight(p: Pick<PackageDims, "length" | "width" | "height">): number {
  return (p.length * p.width * p.height) / VOLUMETRIC_DIVISOR;
}

/** Chargeable weight for a single package (before quantity). */
export function chargeableWeight(p: PackageDims): number {
  return Math.max(p.weight, volumetricWeight(p));
}

/** Which measure is being charged — for transparency in the UI. */
export function chargedBasis(p: PackageDims): "actual" | "volumetric" {
  return volumetricWeight(p) > p.weight ? "volumetric" : "actual";
}

/** Chargeable weight for a package row including its quantity. */
export function rowChargeableWeight(p: PackageDims): number {
  return chargeableWeight(p) * Math.max(1, p.quantity);
}

/** Sum of chargeable weight across all package rows. */
export function totalChargeableWeight(packages: PackageDims[]): number {
  return packages.reduce((sum, p) => sum + rowChargeableWeight(p), 0);
}
