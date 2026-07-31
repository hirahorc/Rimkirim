"use client";

import { Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * Banner shown above the price cards when the domestic (Indonesia-side) leg for
 * a Back For Good route isn't priced online yet: the international estimate
 * still shows, but ordering is blocked and the user is pointed to support.
 */
export function ManualQuoteNotice({
  origin,
  city,
}: {
  origin: string;
  city: string;
}) {
  const t = useT();
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-brand/30 bg-brand/5 p-4 sm:flex-row sm:items-center">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
        <Headset className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{t("rates.manualTitle")}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted">
          {t("rates.manualBodyPre")}
          <span className="font-medium text-foreground">{city}</span>
          {t("rates.manualBodyMid")}
          <span className="font-medium text-foreground">{origin}</span>
          {t("rates.manualBodyMid2")}
          <span className="font-medium text-foreground">{city}</span>
          {t("rates.manualBodyPost")}
        </p>
      </div>
      <Button asChild variant="brand" size="sm" className="shrink-0 sm:self-center">
        <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
          {t("rates.manualCta")}
        </a>
      </Button>
    </div>
  );
}
