"use client";

import type * as React from "react";
import { BadgePercent, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/shared/Flag";
import { CarrierLogo, CarrierMark } from "./CarrierMark";
import { SurchargeInfoDialog } from "./SurchargeInfoDialog";
import { carrierLogo } from "@/lib/data/carriers";
import { formatIDR } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

export interface OfferCardProps {
  carrier: string;
  service: string;
  /** ISO codes for the route line, e.g. "GB" → "ID" */
  origin: string;
  destination: string;
  etaMin: number;
  etaMax: number;
  /** the weight band this price holds for, e.g. "21–24 kg" or "> 40 kg" */
  band?: string;
  /** beside the band, e.g. a "flat" chip */
  bandNote?: React.ReactNode;
  /** IDR per kg, the card's one big number */
  perKg: number;
  /** the total under it: a tier's entry price ("Starting from … for 21 kg")
   *  or the estimate for the weight entered ("Estimated … for 30 kg") */
  total: { kind: "startingFrom" | "estimated"; amount: number; kg: number };
  special?: boolean;
  /** value badges beside the carrier (Cheapest, Fastest) */
  badges?: React.ReactNode;
  /** the order button; absent when ordering is blocked or the card is only shown */
  cta?: { label: React.ReactNode; onClick: () => void; loading?: boolean };
  /** extra content between the price and the button (a breakdown, a regions table) */
  children?: React.ReactNode;
  /** one column at any width (the landing's small pictures of this card) */
  stacked?: boolean;
  /** no frame of its own, where a picture's card is the frame */
  plain?: boolean;
}

/**
 * The rate card both check-rate pages share, after the live rimkirim.com
 * card: on the left the carrier's logo and service, the route in flags and
 * codes, the transit days and the weight band; on the right the price per
 * kg as the one big figure, the total under it, and the duties-and-
 * surcharges line with the way to the surcharge details; then the order
 * button across the card's foot. A Special Rate wears its tab on the card's
 * top edge and a border that fades from Stop Red at the tab to the hairline
 * (.offer-special): the one place the system's red marks an offer, after
 * the live page. Money is mono (The Numbers-Are-Mono Rule).
 */
export function OfferCard({
  carrier,
  service,
  origin,
  destination,
  etaMin,
  etaMax,
  band,
  bandNote,
  perKg,
  total,
  special = false,
  badges,
  cta,
  children,
  stacked = false,
  plain = false,
}: OfferCardProps) {
  const t = useT();
  const o = (k: string) => t(`offer.${k}`);
  // the tab sits on the card's top edge; in the landing's small pictures
  // (stacked) it rides the carrier's row instead
  const onEdge = special && !stacked && !plain;
  const days = (
    <span className="whitespace-nowrap text-foreground">
      {o("days").replace("{min}", String(etaMin)).replace("{max}", String(etaMax))}
    </span>
  );
  const tab = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-danger/45 bg-[color-mix(in_oklab,var(--danger)_9%,var(--background))] px-3 py-1 font-display text-xs font-semibold text-danger-ink",
        onEdge && "absolute -top-3.5 left-5",
      )}
    >
      <BadgePercent aria-hidden className="size-3.5" /> {o("special")}
    </span>
  );
  return (
    <article
      className={cn(
        "relative",
        !plain && "rounded-lg px-5 pb-5 sm:px-6",
        !plain && (special ? "offer-special" : "border border-[var(--card-border,var(--border))] bg-background"),
        !plain && (onEdge ? "pt-7" : "pt-5"),
      )}
    >
      {onEdge && tab}

      <div className={cn("grid gap-4", !stacked && "sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8")}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {carrierLogo(carrier) ? (
              <CarrierLogo carrier={carrier} k={carrier === "UPS" ? 26 : 22} />
            ) : (
              <CarrierMark carrier={carrier} className="size-7 rounded-xs text-[10px]" />
            )}
            {badges}
            {special && !onEdge && tab}
          </div>
          <p className="mt-1.5 text-sm text-muted">{service}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <p className="flex items-center gap-1.5">
              <Flag code={origin} size={12} />
              <span className="font-medium">{origin}</span>
              <span className="text-muted">{o("to")}</span>
              <Flag code={destination} size={12} />
              <span className="font-medium">{destination}</span>
            </p>
            {/* stacked, the days share the route's line, and the clearance
                note and the band are left to the real card */}
            {stacked && (
              <p className="flex items-center gap-1.5">
                <Clock aria-hidden className="size-3.5 shrink-0 text-muted-2" />
                {days}
              </p>
            )}
          </div>
          {/* the days and the band; the clearance note wraps as a sentence,
              never between the days' number and its unit */}
          {!stacked && (
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <p className="flex min-w-0 items-start gap-1.5">
                <Clock aria-hidden className="mt-[3px] size-3.5 shrink-0 text-muted-2" />
                <span>
                  {days} · {o("clearance")}
                </span>
              </p>
              {band && (
                <p className="flex items-center gap-1.5">
                  <Package aria-hidden className="size-3.5 shrink-0 text-muted-2" />
                  <span className="whitespace-nowrap text-foreground">{band}</span>
                  {bandNote}
                </p>
              )}
            </div>
          )}
        </div>

        {/* narrow enough that the excludes line wraps before it crowds the
            carrier side, as on the live card */}
        <div className={cn(!stacked && "sm:max-w-[21rem] sm:text-right")}>
          <p className="font-mono text-2xl font-bold tracking-tight tabular-nums">
            {formatIDR(perKg)}
            <span className="font-sans text-sm font-medium text-muted">{o("perKg")}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {o(total.kind)}{" "}
            <span className="font-mono font-semibold tabular-nums text-foreground">{formatIDR(total.amount)}</span>{" "}
            {o("forKg").replace("{kg}", String(total.kg))}
          </p>
          <p className="mt-1 text-sm text-muted">
            {o("excludes")}{" "}
            <SurchargeInfoDialog>
              <button type="button" className="link-mark tap-row relative">
                {o("surcharges")}
              </button>
            </SurchargeInfoDialog>
          </p>
        </div>
      </div>

      {children}

      {cta && (
        <Button type="button" size="lg" className="mt-5 w-full" onClick={cta.onClick} loading={cta.loading}>
          {cta.label}
        </Button>
      )}
    </article>
  );
}
