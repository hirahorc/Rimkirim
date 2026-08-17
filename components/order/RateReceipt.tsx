"use client";

import { CheckCircle2, Clock } from "lucide-react";
import type { OrderContext, SelectedRate } from "@/lib/store/useOrderStore";
import { getCountry } from "@/lib/data/countries";
import { formatIDR } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The user's rate decision, kept in sight after they click "Choose". Two homes:
 * `card` sits above the login form ("your selection is saved — sign in to
 * continue"), `strip` rides along the whole /pesan flow under the stepper.
 */
export function RateReceipt({
  context,
  rate,
  variant,
  className,
}: {
  context: OrderContext;
  rate: SelectedRate | null;
  variant: "card" | "strip";
  className?: string;
}) {
  const t = useT();
  const origin = getCountry(context.originCountry)?.name ?? context.originCountry;
  const dest = getCountry(context.destCountry)?.name ?? context.destCountry;

  const detail = (
    <>
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
    </>
  );

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-surface-2/60 p-4",
          className,
        )}
      >
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <CheckCircle2 className="size-4 text-success" />
          {t("order.receiptSaved")}
        </p>
        <p className="mt-1.5 text-sm text-muted">
          {origin} → {dest}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {detail}
        </div>
        <p className="mt-2 text-xs text-muted-2">{t("order.receiptSigninNote")}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm",
        className,
      )}
    >
      <span className="text-muted">
        {origin} → {dest}
      </span>
      {detail}
    </div>
  );
}
