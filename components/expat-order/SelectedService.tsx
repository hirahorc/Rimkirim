"use client";

import * as React from "react";
import { BadgePercent, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapseHeight } from "@/components/ui/disclosure";
import { CarrierLogo } from "@/components/rates/CarrierMark";
import { getCountry } from "@/lib/data/countries";
import { placeLine } from "@/lib/data/expat-places";
import type { ExpatRate } from "@/lib/pricing/expat-rates";
import type { CheckRateInput } from "@/lib/order/expat-order";
import { formatIDR } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/**
 * The picked rate beside the plan, after the live page's "Selected
 * service": carrier and service, from and to, transit, the chargeable weight and
 * the estimated price. Once the packages are measured, the weight and price
 * are the packages' (packedPricing), and the weight says so. The card itself
 * is read only; the service changes from `action`, beside its title (the
 * plan's ServicePicker). A white card on the field that stays in view on a
 * wide screen; on a phone a strip over the form (the service, then the
 * price) that opens to the rest. `flash` counts the times the estimate
 * changed what it's priced on: each one washes the figure once. While the
 * packages it follows are still being typed it's `updating`: the figure
 * stands back until the new one lands.
 */
export function SelectedService({
  check,
  rate,
  packed = false,
  flash = 0,
  updating = false,
  action,
}: {
  check: CheckRateInput;
  rate: ExpatRate;
  /** the rate was priced again on the packages' weight */
  packed?: boolean;
  flash?: number;
  updating?: boolean;
  /** what changes the service, beside the title */
  action?: React.ReactNode;
}) {
  const t = useT();
  const s = (k: string) => t(`expatOrder.service.${k}`);
  const [open, setOpen] = React.useState(false);
  const from = [getCountry(check.originCountry)?.name, check.origin && placeLine(check.origin)].filter(Boolean).join(" · ");
  const to = check.destination ? placeLine(check.destination) : "Indonesia";

  const rows = (
    <dl className="space-y-3 text-sm">
      {[
        [s("from"), from],
        [s("to"), to],
        [s("transit"), s("transitValue").replace("{min}", String(rate.etaMin)).replace("{max}", String(rate.etaMax))],
        [s("weight"), s("weightValue").replace("{kg}", String(rate.chargedKg)), packed ? s("weightPacked") : ""],
      ].map(([k, v, note]) => (
        <div key={k} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
          <dt className="text-muted">{k}</dt>
          <dd className="font-medium">
            {v}
            {note && <span className="block text-xs font-normal text-muted">{note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );

  const head = (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <CarrierLogo carrier={rate.carrier} k={rate.carrier === "UPS" ? 22 : 18} />
        <p className="truncate font-display text-sm font-semibold">{rate.service}</p>
      </div>
      {rate.special && (
        <Badge variant="brand" className="mt-2">
          <BadgePercent aria-hidden className="size-3.5" /> {t("expatOrder.rates.special")}
        </Badge>
      )}
    </div>
  );

  const price = (
    <div className="rounded-md bg-surface-2 px-4 py-3">
      <p className="text-xs text-muted">{updating ? s("updating") : s("estimate")}</p>
      <p
        aria-busy={updating || undefined}
        className={cn(
          "mt-0.5 font-display text-2xl font-bold tracking-tight tabular-nums transition-opacity duration-150",
          updating && "opacity-50",
        )}
      >
        <span key={flash} className={flash ? "estimate-flash" : undefined}>
          {formatIDR(rate.total)}
        </span>
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{s("note")}</p>
    </div>
  );

  return (
    <aside
      aria-labelledby="selected-service"
      className="rounded-lg border border-[var(--card-border,var(--border))] bg-[var(--card-surface,var(--surface))] px-5 py-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="selected-service" className="text-xs font-medium text-muted">
          {s("title")}
        </h2>
        {action}
      </div>

      {/* a phone: the service on a line of its own, so its name reads whole,
          the price under it; the rest folded */}
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="service-details"
          onClick={() => setOpen((o) => !o)}
          // the press is answered at once, in colour (and let go of over 150ms)
          className="relative mt-3 flex w-full flex-col gap-2 rounded-sm text-left after:-inset-x-2 after:-inset-y-1.5 after:absolute after:rounded-sm after:transition-colors active:after:bg-foreground/[0.04] active:after:duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          <span className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <CarrierLogo carrier={rate.carrier} k={rate.carrier === "UPS" ? 22 : 18} />
              <span className="font-display text-sm font-semibold">{rate.service}</span>
            </span>
            {/* swap, never rotate: the shared disclosure idiom */}
            {open ? (
              <ChevronUp aria-hidden className="size-4 shrink-0 text-muted-2" />
            ) : (
              <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-2" />
            )}
            <span className="sr-only">{open ? s("hide") : s("show")}</span>
          </span>
          <span className="flex items-center justify-between gap-3">
            <span>
              {rate.special && (
                <Badge variant="brand">
                  <BadgePercent aria-hidden className="size-3.5" /> {t("expatOrder.rates.special")}
                </Badge>
              )}
            </span>
            <span
              className={cn(
                "font-display text-base font-bold tabular-nums transition-opacity duration-150",
                updating && "opacity-50",
              )}
            >
              <span key={flash} className={flash ? "estimate-flash" : undefined}>
                {formatIDR(rate.total)}
              </span>
            </span>
          </span>
        </button>
        <CollapseHeight open={open} id="service-details">
          <div className="space-y-4 pt-4">
            {rows}
            {price}
          </div>
        </CollapseHeight>
      </div>

      {/* a wide screen: everything, in view beside the form */}
      <div className="hidden space-y-4 pt-4 lg:block">
        {head}
        {rows}
        {price}
      </div>
    </aside>
  );
}
