"use client";

import * as React from "react";
import { BadgePercent, ChevronDown, ChevronUp } from "lucide-react";
import { CollapseHeight } from "@/components/ui/disclosure";
import { CarrierLogo } from "@/components/rates/CarrierMark";
import { getCountry } from "@/lib/data/countries";
import { placeLine } from "@/lib/data/expat-places";
import type { ExpatRate } from "@/lib/pricing/expat-rates";
import type { CheckRateInput } from "@/lib/order/expat-order";
import { formatIDR } from "@/lib/utils/currency";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { Chip, PRESS, TYPE } from "./kit";

/**
 * The picked rate beside the plan, after the live page's "Selected
 * service": carrier and service, from and to, transit, the chargeable weight and
 * the estimated price. Once the packages are measured, the weight and price
 * are the packages' (packedPricing), and the weight says so. The card itself
 * is read only; the service changes from `action`, beside its title (the
 * plan's ServicePicker). A paper card on the field that stays in view on a
 * wide screen; on a phone a strip over the form, the service on one line,
 * that opens to the rest (the price itself is always in the bar at the
 * screen's foot there, so the strip doesn't say it twice). `flash` counts the times the estimate
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
    <dl className="grid grid-cols-1 gap-2 text-sm">
      {[
        [s("from"), from],
        [s("to"), to],
        [s("transit"), s("transitValue").replace("{min}", String(rate.etaMin)).replace("{max}", String(rate.etaMax))],
        [s("weight"), s("weightValue").replace("{kg}", String(rate.chargedKg)), packed ? s("weightPacked") : ""],
      ].map(([k, v, note]) => (
        <div key={k} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3">
          <dt className="text-muted">{k}</dt>
          <dd className="font-medium">
            {v}
            {note && <span className="block text-xs font-normal text-muted">{note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );

  const service = (
    <span className="flex min-w-0 items-center gap-2">
      <CarrierLogo carrier={rate.carrier} k={rate.carrier === "UPS" ? 22 : 18} />
      <span className="text-sm font-medium">{rate.service}</span>
    </span>
  );

  const special = rate.special && (
    <Chip className="justify-self-start">
      <BadgePercent aria-hidden /> {t("expatOrder.rates.special")}
    </Chip>
  );

  // the card's one figure, under its only hairline
  const price = (
    <div className="border-t border-border pt-4">
      <p className="text-xs text-muted">{updating ? s("updating") : s("estimate")}</p>
      <p
        aria-busy={updating || undefined}
        className={cn(TYPE.figure, "mt-1 transition-opacity duration-150", updating && "opacity-50")}
      >
        <span key={flash} className={flash ? "estimate-flash" : undefined}>
          {formatIDR(rate.total)}
        </span>
      </p>
      <p className="mt-1 text-xs text-muted">{s("note")}</p>
    </div>
  );

  return (
    <aside
      aria-labelledby="selected-service"
      className="rounded-lg border border-[var(--card-border,var(--border))] bg-[var(--card-surface,var(--surface))] p-4 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="selected-service" className={TYPE.subhead}>
          {s("title")}
        </h2>
        {action}
      </div>

      {/* a phone: the service on a line of its own, so its name reads whole;
          the rest folded */}
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="service-details"
          onClick={() => setOpen((o) => !o)}
          className={cn(PRESS, "mt-3 flex w-full items-center justify-between gap-3 rounded-sm text-left")}
        >
          {service}
          {/* swap, never rotate: the shared disclosure idiom */}
          {open ? (
            <ChevronUp aria-hidden className="size-4 shrink-0 text-muted" />
          ) : (
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted" />
          )}
          <span className="sr-only">{open ? s("hide") : s("show")}</span>
        </button>
        <CollapseHeight open={open} id="service-details">
          <div className="grid grid-cols-1 gap-4 pt-4">
            {special}
            {rows}
            {price}
          </div>
        </CollapseHeight>
      </div>

      {/* a wide screen: everything, in view beside the form */}
      <div className="mt-4 hidden gap-4 lg:grid">
        <div className="grid grid-cols-1 gap-2">
          {service}
          {special}
        </div>
        {rows}
        {price}
      </div>
    </aside>
  );
}
