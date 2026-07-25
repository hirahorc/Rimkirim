/**
 * Mock Rimkirim Packing List registry + validator.
 *
 * There's no backend yet, so `validatePackingCode` simulates a lookup against a
 * small in-memory registry with a short delay. Swap the body for a real API call
 * later — the call sites only await a boolean.
 *
 * Sample valid codes (for demo/testing): the placeholder RK-PL-000123 is valid.
 */
const REGISTRY = new Set<string>([
  "RK-PL-000123",
  "RK-PL-000456",
  "RK-PL-100001",
]);

/** Returns true if the packing-list code exists in the registry. */
export function validatePackingCode(code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  return new Promise((resolve) => {
    setTimeout(() => resolve(REGISTRY.has(normalized)), 650);
  });
}
