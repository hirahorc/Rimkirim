"use client";

import { useRouter } from "next/navigation";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { useOrderStore, type SelectedRate } from "@/lib/store/useOrderStore";

/**
 * Starts the customer order flow from a price-card CTA, carrying the rate the
 * user picked (used later for the order's shipping total). Seeds the order
 * context with the calculator's service (Back For Good or Moving Abroad) and
 * goes to the questionnaire.
 */
export function useStartOrder() {
  const router = useRouter();
  const submitted = useCalculatorStore((s) => s.submitted);
  const startOrder = useOrderStore((s) => s.startOrder);

  return (rate?: SelectedRate) => {
    if (!submitted) return;
    startOrder(
      {
        service: submitted.service,
        originCountry: submitted.origin.country,
        destCountry: submitted.destination.country,
      },
      rate ?? null,
    );
    router.push("/pesan");
  };
}
