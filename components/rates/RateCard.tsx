"use client";

import { Clock, Package, Zap, BadgePercent, Info, Sparkles } from "lucide-react";
import type { VendorQuote, RouteInfo } from "@/lib/pricing/quote";
import { Flag } from "@/components/shared/Flag";
import { CarrierMark } from "./CarrierMark";
import { formatIDR, formatNumber } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceBreakdown } from "./PriceBreakdown";
import { SurchargeInfoDialog } from "./SurchargeInfoDialog";
import { useStartOrder } from "@/components/order/useStartOrder";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

interface RateCardProps {
  quote: VendorQuote;
  route: RouteInfo;
  chargeableWeight: number;
  cheapest?: boolean;
  fastest?: boolean;
  /** hide the order CTA (e.g. domestic price unavailable → order via support) */
  orderBlocked?: boolean;
}

export function RateCard({
  quote,
  route,
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
          <span className="text-muted-2">· {t("rateCard.etaClearanceNote")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="size-3.5" /> {formatNumber(chargeableWeight)} kg
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
        <p className="mt-2 text-xs text-muted-2">{t("rateCard.taxNote")}</p>
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
                className="link-mark"
              >
                {t("rateCard.lihatRincian")}
              </button>
            </SurchargeInfoDialog>
          </span>
        </p>
        {!orderBlocked && (
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
        )}
      </div>
    </Card>
  );
}
