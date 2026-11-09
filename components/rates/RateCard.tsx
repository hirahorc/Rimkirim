"use client";

import { Zap, BadgePercent } from "lucide-react";
import type { RouteInfo, VendorQuote } from "@/lib/pricing/quote";
import { Badge } from "@/components/ui/badge";
import { PriceBreakdown } from "./PriceBreakdown";
import { OfferCard } from "./OfferCard";
import { useStartOrder } from "@/components/order/useStartOrder";
import { useT } from "@/lib/i18n/LanguageProvider";

interface RateCardProps {
  quote: VendorQuote;
  chargeableWeight: number;
  /** the corridor, for the card's route line */
  route: RouteInfo;
  /** value badges only — the choice stays the customer's */
  cheapest?: boolean;
  fastest?: boolean;
  /** hide the order CTA (e.g. domestic price unavailable → order via support) */
  orderBlocked?: boolean;
}

/**
 * One carrier option on the Advance check-rate page, in the card both
 * check-rate pages share (OfferCard, after the live rimkirim.com card): the
 * estimate for the chargeable weight, the Cheapest/Fastest badge beside the
 * carrier, and the price breakdown folded between the price and the button.
 */
export function RateCard({
  quote,
  chargeableWeight,
  route,
  cheapest,
  fastest,
  orderBlocked,
}: RateCardProps) {
  const t = useT();
  const startOrder = useStartOrder();
  const { vendor } = quote;
  return (
    <OfferCard
      carrier={vendor.carrier}
      service={vendor.service}
      origin={route.origin?.code ?? ""}
      destination={route.destination?.code ?? ""}
      etaMin={quote.etaMin}
      etaMax={quote.etaMax}
      perKg={quote.pricePerKg}
      total={{ kind: "estimated", amount: quote.total, kg: chargeableWeight }}
      special={quote.isSpecial}
      badges={
        <>
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
        </>
      }
      cta={
        orderBlocked
          ? undefined
          : {
              label: `${t("rateCard.pilih")} ${vendor.carrier}`,
              onClick: () =>
                startOrder({
                  perKg: quote.baseRatePerKg,
                  label: `${vendor.carrier} ${vendor.service}`,
                  total: quote.total,
                  etaMin: quote.etaMin,
                  etaMax: quote.etaMax,
                }),
            }
      }
    >
      {/* the breakdown runs to the card's edges, a fold between two hairlines */}
      <div className="-mx-5 mt-5 border-b border-border sm:-mx-6">
        <PriceBreakdown quote={quote} chargeableWeight={chargeableWeight} />
      </div>
    </OfferCard>
  );
}
