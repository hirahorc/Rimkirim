"use client";

import { Clock, Package, Zap, BadgePercent, Info } from "lucide-react";
import type { VendorQuote, RouteInfo } from "@/lib/pricing/quote";
import { Flag } from "@/components/shared/Flag";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceBreakdown } from "./PriceBreakdown";
import { SurchargeInfoDialog } from "./SurchargeInfoDialog";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

interface RateCardProps {
  quote: VendorQuote;
  route: RouteInfo;
  chargeableWeight: number;
  cheapest?: boolean;
  fastest?: boolean;
}

export function RateCard({
  quote,
  route,
  chargeableWeight,
  cheapest,
  fastest,
}: RateCardProps) {
  const t = useT();
  const { vendor } = quote;
  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors",
        cheapest ? "border-brand/50" : "hover:border-border-strong",
      )}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: vendor.accent }}
          >
            {vendor.code}
          </span>
          <div>
            <p className="font-display font-semibold leading-tight">{vendor.carrier}</p>
            <p className="text-xs text-muted">{vendor.service}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
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

      {/* route + eta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pb-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          {route.origin && <Flag code={route.origin.code} size={12} />}
          {route.origin?.name}
          <span className="text-muted-2">→</span>
          {route.destination && <Flag code={route.destination.code} size={12} />}
          {route.destination?.name}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> {quote.etaMin}–{quote.etaMax} {t("rateCard.hari")}
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="size-3.5" /> {formatNumber(chargeableWeight)} kg
        </span>
      </div>

      {/* price */}
      <div className="flex items-end justify-between border-t border-border px-5 py-4">
        <div>
          <p className="text-xs text-muted-2">{t("rateCard.totalEstimasi")}</p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground">
            {formatIDR(quote.total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-2">{t("rateCard.perKg")}</p>
          <p className="font-medium text-brand">{formatIDR(quote.pricePerKg)}</p>
        </div>
      </div>

      <PriceBreakdown quote={quote} chargeableWeight={chargeableWeight} />

      <div className="space-y-3 p-5 pt-3">
        <p className="flex items-start gap-1.5 text-xs text-muted-2">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {t("rateCard.disclaimer")}{" "}
            <SurchargeInfoDialog>
              <button
                type="button"
                className="font-medium text-brand hover:underline"
              >
                {t("rateCard.lihatRincian")}
              </button>
            </SurchargeInfoDialog>
          </span>
        </p>
        <Button className="w-full" variant={cheapest ? "brand" : "secondary"}>
          {t("rateCard.pilih")} {vendor.carrier}
        </Button>
      </div>
    </Card>
  );
}
