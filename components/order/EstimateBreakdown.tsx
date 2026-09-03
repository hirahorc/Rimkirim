"use client";

import type { Estimate } from "@/lib/voucher/estimate";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

/**
 * The estimate's arithmetic, in the same order the official QuotationCard
 * uses — base, discount, surcharge, total — so the number a customer sees
 * before submitting and the one ops issues afterwards have the same shape.
 * Chrome-free: the hub card and the items form each supply their own.
 */
export function EstimateBreakdown({
  estimate,
  compact = false,
  className,
}: {
  estimate: Estimate;
  /** smaller rows and no total line — the host already shows the total */
  compact?: boolean;
  className?: string;
}) {
  const t = useT();
  const { locale } = useLanguage();
  const { quotation: qu, outcome, campaign } = estimate;
  const row = cn("flex items-baseline justify-between gap-3", compact ? "text-xs" : "text-sm");

  return (
    <div className={cn(compact ? "space-y-1.5" : "space-y-3", className)}>
      <div className={row}>
        <span className="text-muted">
          {t("order.estBase")}{" "}
          <span className="text-muted-2">
            (<span className="font-mono tabular-nums">{formatIDR(qu.perKg)}</span>
            {" × "}
            {formatNumber(qu.chargeableKg, 1, locale)} kg)
          </span>
        </span>
        <span className="shrink-0 font-mono font-medium tabular-nums">{formatIDR(qu.baseRate)}</span>
      </div>

      {qu.discount > 0 && qu.voucherCode && (
        <div className={row}>
          <span className="text-muted">
            {t("order.estDiscount")}{" "}
            <span className="font-mono text-muted-2">({qu.voucherCode})</span>
          </span>
          <span className="shrink-0 font-mono font-medium tabular-nums text-success-ink">
            −{formatIDR(qu.discount)}
          </span>
        </div>
      )}

      {/* the rule is told early, with the way to satisfy it in the same breath */}
      {outcome === "min-weight" && campaign && (
        <p className={cn("text-warning-ink", compact ? "text-xs" : "text-xs")} role="status">
          {t("order.estMinWeight")
            .replace("{code}", campaign.code)
            .replace("{kg}", String(campaign.minWeightKg))
            .replace("{have}", formatNumber(qu.chargeableKg, 1, locale))}
        </p>
      )}

      {qu.surchargeTotal > 0 && (
        <div className={row}>
          <span className="text-muted">{t("order.estSurcharge")}</span>
          <span className="shrink-0 font-mono font-medium tabular-nums">
            {formatIDR(qu.surchargeTotal)}
          </span>
        </div>
      )}

      {!compact && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm font-semibold">
          <span>{t("order.estTotal")}</span>
          <span className="font-mono tabular-nums">{formatIDR(qu.total)}</span>
        </div>
      )}
    </div>
  );
}
