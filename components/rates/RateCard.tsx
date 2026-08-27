"use client";

import { Clock, Zap, BadgePercent } from "lucide-react";
import type { VendorQuote } from "@/lib/pricing/quote";
import { CarrierLogo, CarrierMark } from "./CarrierMark";
import { carrierLogo } from "@/lib/data/carriers";
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
  /** value badges only — the card frame and CTA stay neutral either way */
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
    // the frame and CTA stay neutral for every option — value signals live
    // only in the Termurah/Tercepat badges, the choice stays the customer's
    <Card className="rounded-md overflow-hidden transition-colors hover:border-border-strong">
      {/* header: the official logo IS the carrier name (its alt keeps the
          accessible one) — repeating it in text would say DHL twice. Carriers
          without a logo file keep the monogram tile + text identity. */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
        {carrierLogo(vendor.carrier) ? (
          <div>
            <CarrierLogo carrier={vendor.carrier} />
            <p className="mt-2 text-xs text-muted">{vendor.service}</p>
          </div>
        ) : (
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
        )}
        <div className="flex flex-col items-end gap-1">
          {/* "Special Rate" is a type marker, not a value claim — neutral chip.
              Lime stays reserved for Termurah (the real value signal). */}
          {quote.isSpecial && <Badge variant="neutral">{t("special.badge")}</Badge>}
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
      <div className="px-4 pb-3 text-xs text-muted sm:px-5 sm:pb-4">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> {quote.etaMin}–{quote.etaMax} {t("rateCard.hari")}
        </span>
      </div>

      {/* price */}
      <div className="border-t border-border px-4 py-3.5 sm:px-5 sm:py-4">
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
        <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
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
