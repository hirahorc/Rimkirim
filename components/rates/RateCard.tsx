"use client";

import { Clock } from "lucide-react";
import type { VendorQuote } from "@/lib/pricing/quote";
import { CarrierMark } from "./CarrierMark";
import { formatIDR } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceBreakdown } from "./PriceBreakdown";
import { useStartOrder } from "@/components/order/useStartOrder";
import { useT } from "@/lib/i18n/LanguageProvider";

interface RateCardProps {
  quote: VendorQuote;
  chargeableWeight: number;
  /** hide the order CTA (e.g. domestic price unavailable → order via support) */
  orderBlocked?: boolean;
}

export function RateCard({
  quote,
  chargeableWeight,
  orderBlocked,
}: RateCardProps) {
  const t = useT();
  const startOrder = useStartOrder();
  const { vendor } = quote;
  return (
    // every option is presented neutrally: no "cheapest"/"fastest" pick, no
    // lime frame — the choice is the customer's, not the system's
    <Card className="overflow-hidden transition-colors hover:border-border-strong">
      {/* header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          {quote.isSpecial ? (
            <span className="grid size-10 place-items-center rounded-md bg-surface-3 text-xs font-bold text-foreground">
              {vendor.code}
            </span>
          ) : (
            <CarrierMark carrier={vendor.carrier} />
          )}
          <div>
            <p className="font-display font-semibold leading-tight">{vendor.carrier}</p>
            <p className="text-xs text-muted">{vendor.service}</p>
          </div>
        </div>
        {/* "Special Rate" is a type marker, not a value claim — neutral chip */}
        {quote.isSpecial && <Badge variant="neutral">{t("special.badge")}</Badge>}
      </div>

      {/* eta only — route + chargeable weight live once in the recap bar above,
          and the clearance/tax/surcharge caveats live once below the list */}
      <div className="px-5 pb-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> {quote.etaMin}–{quote.etaMax} {t("rateCard.hari")}
        </span>
      </div>

      {/* price */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-2">{t("rateCard.totalEstimasi")}</p>
            <p className="font-mono text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {formatIDR(quote.total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-2">{t("rateCard.perKg")}</p>
            <p className="font-mono font-medium tabular-nums text-foreground">
              {formatIDR(quote.pricePerKg)}
            </p>
          </div>
        </div>
      </div>

      <PriceBreakdown quote={quote} chargeableWeight={chargeableWeight} />

      {!orderBlocked && (
        <div className="p-5 pt-3">
          <Button
            className="w-full"
            variant="secondary"
            onClick={() =>
              startOrder({
                perKg: quote.baseRatePerKg,
                label: `${vendor.carrier} ${vendor.service}`,
                total: quote.total,
                etaMin: quote.etaMin,
                etaMax: quote.etaMax,
              })
            }
          >
            {t("rateCard.pilih")} {vendor.carrier}
          </Button>
        </div>
      )}
    </Card>
  );
}
