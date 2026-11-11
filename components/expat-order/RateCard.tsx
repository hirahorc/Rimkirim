"use client";

import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OfferCard } from "@/components/rates/OfferCard";
import type { ExpatRate } from "@/lib/pricing/expat-rates";
import { useT } from "@/lib/i18n/LanguageProvider";

/**
 * One rate at Check Rate, in the card both check-rate pages share
 * (OfferCard, after the live rimkirim.com card): the estimate is for the
 * weight entered, rounded up, so its total reads "Estimated … for 30 kg".
 * The landing shows this very card in its pictures: `display` drops the
 * button, `stacked` keeps the phone's one-column layout at any width, and
 * `plain` drops the card's own frame where the picture's card is the frame.
 * Where the service is changed on the plan, `selected` marks the rate the
 * order carries: it says so beside the carrier and has no button of its own.
 */
export function RateCard({
  rate,
  origin,
  onSelect,
  loading = false,
  selected = false,
  display = false,
  stacked = false,
  plain = false,
}: {
  rate: ExpatRate;
  /** the origin country's ISO code, for the route line */
  origin: string;
  /** kept for the lead card's call site; every card wears the same button */
  lead?: boolean;
  onSelect?: () => void;
  /** the rate was picked and its next page is on the way */
  loading?: boolean;
  selected?: boolean;
  display?: boolean;
  stacked?: boolean;
  plain?: boolean;
}) {
  const t = useT();
  return (
    <OfferCard
      carrier={rate.carrier}
      service={rate.service}
      origin={origin}
      destination="ID"
      etaMin={rate.etaMin}
      etaMax={rate.etaMax}
      band={rate.band}
      perKg={rate.perKg}
      total={{ kind: "estimated", amount: rate.total, kg: rate.chargedKg }}
      special={rate.special}
      badges={
        selected ? (
          <Badge variant="brand">
            <Check aria-hidden className="size-3.5" strokeWidth={3} /> {t("expatOrder.service.selected")}
          </Badge>
        ) : undefined
      }
      stacked={stacked}
      plain={plain}
      cta={
        display || selected || !onSelect
          ? undefined
          : {
              label: (
                <>
                  {t("expatOrder.rates.select")} <ArrowRight />
                </>
              ),
              onClick: onSelect,
              loading,
            }
      }
    />
  );
}
