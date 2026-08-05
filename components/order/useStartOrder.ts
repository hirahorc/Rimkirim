"use client";

import { useRouter } from "next/navigation";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { useOrderStore, type SelectedRate } from "@/lib/store/useOrderStore";
import { useCurrentUser } from "@/lib/store/useAuthStore";

/**
 * Starts the customer order flow from a price-card CTA, carrying the rate the
 * user picked (used later for the order's shipping total). Seeds the order
 * context with the calculator's service (Back For Good or Moving Abroad) and
 * goes to the questionnaire.
 *
 * Orders belong to a signed-in user, so when the visitor isn't logged in the
 * start is stashed (pendingStart) and they're sent to /masuk; after signing in
 * the /pesan shell consumes the stash and resumes into the questionnaire.
 */
export function useStartOrder() {
  const router = useRouter();
  const submitted = useCalculatorStore((s) => s.submitted);
  const startOrder = useOrderStore((s) => s.startOrder);
  const setPendingStart = useOrderStore((s) => s.setPendingStart);
  const user = useCurrentUser();

  return (rate?: SelectedRate) => {
    if (!submitted) return;
    const ctx = {
      service: submitted.service,
      originCountry: submitted.origin.country,
      destCountry: submitted.destination.country,
    };
    if (!user) {
      setPendingStart({ context: ctx, rate: rate ?? null });
      router.push("/masuk?next=/pesan");
      return;
    }
    startOrder(ctx, rate ?? null);
    router.push("/pesan");
  };
}
