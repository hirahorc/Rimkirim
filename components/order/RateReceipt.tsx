"use client";

import { CheckCircle2, Clock } from "lucide-react";
import type { OrderContext, SelectedRate } from "@/lib/store/useOrderStore";
import { getCountry } from "@/lib/data/countries";
import { formatIDR } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The user's rate decision, echoed back above the login form so the sign-in
 * wall doesn't swallow the choice they just made on /cek-tarif.
 */
export function RateReceipt({
  context,
  rate,
  className,
}: {
  context: OrderContext;
  rate: SelectedRate | null;
  className?: string;
}) {
  const t = useT();
  const origin = getCountry(context.originCountry)?.name ?? context.originCountry;
  const dest = getCountry(context.destCountry)?.name ?? context.destCountry;

  return (
    <div
      className={cn("rounded-md border border-border bg-surface-2/60 p-4", className)}
    >
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <CheckCircle2 className="size-4 text-success" />
        {t("order.receiptSaved")}
      </p>
      <p className="mt-1.5 text-sm text-muted">
        {origin} → {dest}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {rate && <span className="font-medium text-foreground">{rate.label}</span>}
        {rate && (
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {rate.total != null ? formatIDR(rate.total) : `${formatIDR(rate.perKg)}/kg`}
          </span>
        )}
        {rate?.etaMin != null && rate.etaMax != null && (
          <span className="flex items-center gap-1 text-muted">
            <Clock className="size-3.5" />
            {rate.etaMin}–{rate.etaMax} {t("rateCard.hari")}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-2">{t("order.receiptSigninNote")}</p>
    </div>
  );
}
