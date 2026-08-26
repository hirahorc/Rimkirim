/**
 * Mock Rimkirim Packing List registry + validator.
 *
 * There's no backend yet, so `validatePackingCode` simulates a lookup against a
 * small in-memory registry with a short delay, and also accepts codes of the
 * standalone packing lists the current user created in this app. Swap the body
 * for a real API call later — the call sites only await a boolean.
 *
 * Sample valid codes (for demo/testing): the placeholder RKPL000123 is valid.
 */
import { findOwnedByCode } from "@/lib/store/usePackingListStore";

const REGISTRY = new Set<string>(["RKPL000123", "RKPL000456", "RKPL100001"]);

/** Returns true if the packing-list code exists in the registry or belongs to the user. */
export function validatePackingCode(
  code: string,
  ownerEmail?: string | null,
): Promise<boolean> {
  // dashes/spaces are stripped so codes typed in the old dashed style still match
  const normalized = code.trim().toUpperCase().replace(/[\s-]/g, "");
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
