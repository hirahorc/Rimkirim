"use client";

import { ArrowRight, BadgePercent, Check, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/shared/Flag";
import { CarrierLogo, CarrierMark } from "@/components/rates/CarrierMark";
import { SurchargeInfoDialog } from "@/components/rates/SurchargeInfoDialog";
import { carrierLogo } from "@/lib/data/carriers";
import type { ExpatRate } from "@/lib/pricing/expat-rates";
import { formatIDR } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { Chip, TYPE } from "./kit";

/**
 * One rate at Check Rate: what the offer card says (OfferCard, after the
 * live rimkirim.com card), in the same words and the same order, set on the
 * flow's own system. On the left the carrier's logo and service, the route
 * in flags and codes, the transit days and the weight band. On the right the
 * price per kg as the card's one figure, the estimate for the weight entered
 * ("Estimated … for 30 kg"), what it excludes with the way to the surcharge
 * details, and the lime button under them, as wide as the price and no
 * wider (across the card on a phone). A Special Rate wears an Ink tab on the
 * card's top edge. The landing shows this very card in its pictures:
 * `display` drops the button, `stacked` keeps the phone's one column at any
 * width, and `plain` drops the card's own frame where the picture's card is
 * the frame; `figures={false}` draws the price per kg as a filler line, as
 * long as the rate is high, and leaves the estimate out, for the pricing
 * picture, which shows that a rate differs by route and service and names
 * no price. Where the service is changed on the plan, `selected` marks the
 * rate the order carries: it says so beside the carrier and has no button
 * of its own.
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
  figures = true,
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
  figures?: boolean;
}) {
  const t = useT();
  const o = (k: string) => t(`offer.${k}`);
  // the tab sits on the card's top edge; in the landing's small pictures
  // (stacked) it rides the carrier's row instead
  const onEdge = rate.special && !stacked && !plain;
  const days = (
    <span className="whitespace-nowrap text-foreground">
      {o("days").replace("{min}", String(rate.etaMin)).replace("{max}", String(rate.etaMax))}
    </span>
  );
  const tab = (
    <Chip className={cn(onEdge && "absolute -top-3 left-4 sm:left-6")}>
      <BadgePercent aria-hidden /> {o("special")}
    </Chip>
  );
  return (
    <article
      className={cn(
        "relative",
        // inside the field a card has no line; on a dialog's paper it wears
        // its hairline again (--card-border)
        !plain && "rounded-lg border border-[var(--card-border,var(--border))] bg-background p-4 sm:p-6",
        // room for the tab that rides the edge
        onEdge && "pt-6",
      )}
    >
      {onEdge && tab}

      <div className={cn("grid grid-cols-1 gap-4", !stacked && "sm:grid-cols-[minmax(0,1fr)_16rem] sm:gap-6")}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {carrierLogo(rate.carrier) ? (
              <CarrierLogo carrier={rate.carrier} k={rate.carrier === "UPS" ? 26 : 22} />
            ) : (
              <CarrierMark carrier={rate.carrier} className="size-7 rounded-xs text-xs" />
            )}
            {selected && (
              <Chip tone="wash">
                <Check aria-hidden strokeWidth={3} /> {t("expatOrder.service.selected")}
              </Chip>
            )}
            {rate.special && !onEdge && tab}
          </div>
          <p className="mt-2 text-sm font-medium">{rate.service}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <p className="flex items-center gap-1">
              <Flag code={origin} size={12} />
              <span>{origin}</span>
              <span className="text-muted">{o("to")}</span>
              <Flag code="ID" size={12} />
              <span>ID</span>
            </p>
            {/* stacked, the days share the route's line, and the clearance
                note and the band are left to the real card */}
            {stacked && (
              <p className="flex items-center gap-1">
                <Clock aria-hidden className="size-3.5 shrink-0 text-muted" />
                {days}
              </p>
            )}
          </div>
          {/* the days and the band; the clearance note wraps as a sentence,
              never between the days' number and its unit */}
          {!stacked && (
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <p className="flex min-w-0 gap-1">
                <span className="flex h-5 shrink-0 items-center">
                  <Clock aria-hidden className="size-3.5" />
                </span>
                <span>
                  {days} · {o("clearance")}
                </span>
              </p>
              <p className="flex items-center gap-1">
                <Package aria-hidden className="size-3.5 shrink-0" />
                <span className="whitespace-nowrap text-foreground">{rate.band}</span>
              </p>
            </div>
          )}
        </div>

        <div className={cn(!stacked && "sm:text-right")}>
          <p className={cn(TYPE.figure, !figures && "flex items-center gap-1.5")}>
            {figures ? (
              formatIDR(rate.perKg)
            ) : (
              // the figure's place, kept: a line as long as the rate is high
              <span
                className="block h-3 rounded-full bg-foreground/15"
                style={{ width: `${(rate.perKg / 55_000).toFixed(2)}rem` }}
              />
            )}
            <span className="font-sans text-sm font-normal tracking-normal text-muted">{o("perKg")}</span>
          </p>
          {figures && (
            <>
              <p className="mt-1 text-sm text-muted">
                {o("estimated")}{" "}
                <span className="font-mono font-semibold tabular-nums text-foreground">{formatIDR(rate.total)}</span>{" "}
                {o("forKg").replace("{kg}", String(rate.chargedKg))}
              </p>
              <p className="mt-1 text-xs text-muted">
                {o("excludes")}{" "}
                <SurchargeInfoDialog>
                  <button type="button" className="link-mark tap-row relative">
                    {o("surcharges")}
                  </button>
                </SurchargeInfoDialog>
              </p>
            </>
          )}
          {!display && !selected && onSelect && (
            <Button type="button" size="lg" className="mt-4 w-full" onClick={onSelect} loading={loading}>
              {t("expatOrder.rates.select")} <ArrowRight />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
