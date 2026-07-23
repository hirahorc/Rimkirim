"use client";

import * as React from "react";
import { ChevronDown, Receipt } from "lucide-react";
import type { VendorQuote } from "@/lib/pricing/quote";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

export function PriceBreakdown({
  quote,
  chargeableWeight,
}: {
  quote: VendorQuote;
  chargeableWeight: number;
}) {
  const t = useT();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-sm text-muted transition-colors hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <Receipt className="size-4" /> {t("breakdown.rincianHarga")}
        </span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="animate-fade-up space-y-2 px-5 pb-4 text-sm">
          <Row
            label={`${t("breakdown.baseRate")} (${formatIDR(quote.baseRatePerKg)}/kg × ${formatNumber(chargeableWeight)} kg)`}
            value={formatIDR(quote.baseRate)}
          />
          {quote.surcharges.map((s) => (
            <Row
              key={s.code}
              label={t(`surchargeLine.${s.code}`)}
              value={formatIDR(s.amount)}
              muted
            />
          ))}
          {quote.surcharges.length === 0 && (
            <p className="text-xs text-muted-2">{t("breakdown.noSurcharge")}</p>
          )}
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2 font-semibold">
            <span>{t("breakdown.total")}</span>
            <span className="text-brand">{formatIDR(quote.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className={cn("text-muted", muted && "text-warning/90")}>{label}</span>
      <span className="shrink-0 font-medium tabular-nums">{value}</span>
    </div>
  );
}
