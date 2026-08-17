/**
 * Mock Rimkirim Packing List registry + validator.
 *
 * There's no backend yet, so `validatePackingCode` simulates a lookup against a
 * small in-memory registry with a short delay, and also accepts codes of the
 * standalone packing lists the current user created in this app. Swap the body
 * for a real API call later — the call sites only await a boolean.
 *
 * Sample valid codes (for demo/testing): the placeholder RK-PL-000123 is valid.
 */
import { findOwnedByCode } from "@/lib/store/usePackingListStore";

const REGISTRY = new Set<string>([
  "RK-PL-000123",
  "RK-PL-000456",
  "RK-PL-100001",
]);

/** Returns true if the packing-list code exists in the registry or belongs to the user. */
export function validatePackingCode(
  code: string,
  ownerEmail?: string | null,
): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          REGISTRY.has(normalized) || Boolean(findOwnedByCode(ownerEmail, normalized)),
        ),
      650,
    );
  });
}
