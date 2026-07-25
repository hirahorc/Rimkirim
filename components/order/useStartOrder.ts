"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * Starts the customer order flow from a price-card CTA.
 * Back For Good → seed order context + go to the questionnaire.
 * Moving Abroad → "coming soon" toast (flow not built yet).
 */
export function useStartOrder() {
  const router = useRouter();
  const t = useT();
  const submitted = useCalculatorStore((s) => s.submitted);
  const startOrder = useOrderStore((s) => s.startOrder);

  return () => {
    if (!submitted) return;
    if (submitted.service !== "bfg") {
      toast(t("order.maComingSoon"));
      return;
    }
    startOrder({
      service: "bfg",
      originCountry: submitted.origin.country,
      destCountry: submitted.destination.country,
    });
    router.push("/pesan");
  };
}
