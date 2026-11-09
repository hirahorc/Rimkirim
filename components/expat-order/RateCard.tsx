"use client";

import { ArrowRight, BadgePercent, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/shared/Flag";
import { CarrierLogo } from "@/components/rates/CarrierMark";
import type { ExpatRate } from "@/lib/pricing/expat-rates";
import { formatIDR } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * One rate at Check Rate, after the live page's card: the carrier and service,
 * the route, the transit days, and the price per kg as the one big number with
 * the estimated total for the charged weight under it. The lead card carries
 * the page's one lime button; the rest under "See more rates" take the quiet
 * one, so a long list never splits the voice. The landing shows this very
 * card in its pictures: `display` drops the button, `stacked` keeps the
 * phone's one-column layout at any width, and `plain` drops the card's own
 * frame where the picture's card is the frame.
 */
export function RateCard({
  rate,
  origin,
  lead = false,
  onSelect,
  display = false,
  stacked = false,
  plain = false,
}: {
  rate: ExpatRate;
  /** the origin country's ISO code, for the route line */
  origin: string;
  lead?: boolean;
  onSelect?: () => void;
  display?: boolean;
  stacked?: boolean;
  plain?: boolean;
}) {
  const t = useT();
  const r = (k: string) => t(`expatOrder.rates.${k}`);
  return (
    <article
      className={cn(
        "relative",
        !plain && "rounded-lg border bg-background px-5 py-5 sm:px-6",
        // the lead card framed in Ink, as a chosen option is
        !plain && (lead ? "border-foreground shadow-[inset_0_0_0_1px_var(--foreground)]" : "border-border-strong"),
      )}
    >
      {rate.special && !stacked && <SpecialPill label={r("special")} className="mb-3" />}
      <div className={cn("flex flex-col", stacked ? "gap-3" : "gap-4 sm:flex-row sm:items-start sm:justify-between")}>
        <div className="min-w-0">
          {/* stacked (the landing's small pictures), the pill rides the
              carrier's row, so the price stays clear of the picture's fade */}
          <div className={cn("flex items-center gap-3", stacked && "flex-wrap gap-y-2")}>
            <CarrierLogo carrier={rate.carrier} k={rate.carrier === "UPS" ? 26 : 22} />
            {/* stacked, the name takes what's left and the pill wraps under
                when a narrow card has no room for it */}
            <h3 className={cn("font-display text-base font-semibold tracking-tight", stacked && "min-w-0 grow basis-24")}>
              {rate.service}
            </h3>
            {rate.special && stacked && <SpecialPill label={r("special")} className="shrink-0" />}
          </div>
          <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted", stacked ? "mt-2" : "mt-3")}>
            <span className="inline-flex items-center gap-1.5">
              <Flag code={origin} size={12} />
              {origin}
              <ArrowRight aria-hidden className="size-3.5 text-muted-2" />
              <Flag code="ID" size={12} />
              ID
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="size-3.5 text-muted-2" />
              {r("eta").replace("{min}", String(rate.etaMin)).replace("{max}", String(rate.etaMax))}
              {/* the landing's small pictures keep route and days on one line */}
              {!stacked && <span className="text-muted-2">· {r("etaNote")}</span>}
            </span>
          </p>
        </div>
        <div className={cn(!stacked && "sm:text-right")}>
          <p className="font-display text-2xl font-bold tracking-tight tabular-nums">
            {formatIDR(rate.perKg)}
            <span className="text-sm font-medium text-muted">{r("perKg")}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            <span className="mr-1.5 rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium text-foreground">
              {r("estimated")}
            </span>
            <span className="font-medium text-foreground tabular-nums">{formatIDR(rate.total)}</span>{" "}
            {r("totalFor").replace("{kg}", String(rate.chargedKg))}
          </p>
        </div>
      </div>
      {!display && (
        <div className="mt-5">
          <Button
            type="button"
            variant={lead ? "brand" : "secondary"}
            size={lead ? "lg" : "md"}
            onClick={onSelect}
            className="w-full sm:w-auto"
          >
            {r("select")}
            {lead && <ArrowRight />}
          </Button>
        </div>
      )}
    </article>
  );
}

/** the Special Rate's mark: the chapter's ink, solid */
function SpecialPill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-tone-ink px-2.5 py-1 font-display text-xs font-semibold text-background",
        className,
      )}
    >
      <BadgePercent aria-hidden className="size-3.5" /> {label}
    </span>
  );
}
