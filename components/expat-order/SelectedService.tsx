"use client";

import * as React from "react";
import { BadgePercent, ChevronDown } from "lucide-react";
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
 * The picked rate beside every plan step, after the live page's "Selected
 * service": carrier and service, from and to, transit, the charged weight and
 * the estimated price, read only. Once the packages are measured, the
 * weight and price are the packages' (packedPricing), and the weight says so.
 * A white card on the field that stays in view on a wide screen; on a phone a
 * one-line strip over the form (service and price) that opens to the rest.
 */
export function SelectedService({
  check,
  rate,
  packed = false,
}: {
  check: CheckRateInput;
  rate: ExpatRate;
  /** the rate was priced again on the packages' weight */
  packed?: boolean;
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
      <p className="text-xs text-muted">{s("estimate")}</p>
      <p className="mt-0.5 font-display text-2xl font-bold tracking-tight tabular-nums">{formatIDR(rate.total)}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{s("note")}</p>
    </div>
  );

  return (
    <aside
      aria-labelledby="selected-service"
      className="rounded-lg border border-[var(--card-border,var(--border))] bg-[var(--card-surface,var(--surface))] px-5 py-5"
    >
      <h2 id="selected-service" className="text-xs font-medium text-muted">
        {s("title")}
      </h2>

      {/* a phone: the service and price on one line, the rest folded */}
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="service-details"
          onClick={() => setOpen((o) => !o)}
          className="mt-3 flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
        >
          {head}
          <span className="flex shrink-0 items-center gap-2">
            <span className="font-display text-base font-bold tabular-nums">{formatIDR(rate.total)}</span>
            <ChevronDown aria-hidden className={cn("size-4 text-muted-2 transition-transform", open && "rotate-180")} />
            <span className="sr-only">{open ? s("hide") : s("show")}</span>
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
