"use client";

import { Clock, Zap, BadgePercent, Sparkles } from "lucide-react";
import type { VendorQuote } from "@/lib/pricing/quote";
import { CarrierMark } from "./CarrierMark";
import { formatIDR } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceBreakdown } from "./PriceBreakdown";
import { useStartOrder } from "@/components/order/useStartOrder";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

interface RateCardProps {
  quote: VendorQuote;
  chargeableWeight: number;
  cheapest?: boolean;
  fastest?: boolean;
  /** hide the order CTA (e.g. domestic price unavailable → order via support) */
  orderBlocked?: boolean;
}

export function RateCard({
  quote,
  chargeableWeight,
  cheapest,
  fastest,
  orderBlocked,
}: RateCardProps) {
  const t = useT();
  const startOrder = useStartOrder();
  const { vendor } = quote;
  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors",
        cheapest || quote.isSpecial
          ? "border-brand/50"
          : "hover:border-border-strong",
      )}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          {quote.isSpecial ? (
            <span className="grid size-10 place-items-center rounded-md bg-brand text-xs font-bold text-brand-ink">
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
        <div className="flex flex-col items-end gap-1">
          {quote.isSpecial && (
            <Badge variant="brand">
              <Sparkles className="size-3" /> {t("special.badge")}
            </Badge>
          )}
          {cheapest && (
            <Badge variant="brand">
              <BadgePercent className="size-3" /> {t("rateCard.termurah")}
            </Badge>
          )}
          {fastest && (
            <Badge variant="info">
              <Zap className="size-3" /> {t("rateCard.tercepat")}
            </Badge>
          )}
        </div>
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
            variant={cheapest ? "brand" : "secondary"}
            onClick={() =>
              startOrder({
                perKg: quote.baseRatePerKg,
                label: `${vendor.carrier} ${vendor.service}`,
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
