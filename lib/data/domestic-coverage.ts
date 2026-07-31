/**
 * Mock domestic-coverage lookup. Rimkirim has no carrier API yet — domestic
 * (Indonesia-side) rates are collected manually, so some cities have no price
 * in the system. Those can't be auto-quoted/ordered and must go through
 * customer support. Swap this for a real coverage lookup/API later.
 */

import type { CalculatorValues } from "@/lib/schemas/calculator";

/** Cities whose domestic delivery price isn't in the system yet (dummy). */
export const UNSERVICED_DOMESTIC_CITIES = ["makassar"];

/**
 * For Back For Good (import), the domestic leg delivers to the Indonesian
 * destination city. Returns the entered city when its price isn't available,
 * else null (so ordering can proceed).
 */
export function domesticCoverageGap(
  input: CalculatorValues,
): { city: string } | null {
  if (input.service !== "bfg") return null;
  const city = (input.destination.city ?? "").trim();
  if (!city) return null;
  return UNSERVICED_DOMESTIC_CITIES.includes(city.toLowerCase())
    ? { city }
    : null;
}
