"use client";

import Link from "next/link";
import {
  Sparkles,
  Clock,
  Info,
  ArrowRight,
  MessageCircle,
  Globe2,
} from "lucide-react";
import type {
  SpecialRateQuote,
  SpecialRateTierQuote,
  RouteInfo,
} from "@/lib/pricing/quote";
import { Flag } from "@/components/shared/Flag";
import { CarrierLogo, CarrierMark } from "./CarrierMark";
import { carrierLogo } from "@/lib/data/carriers";
import { formatIDR } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RouteArrow } from "@/components/ui/route-arrow";
import { Button } from "@/components/ui/button";
import { useStartOrder } from "@/components/order/useStartOrder";
import { useT } from "@/lib/i18n/LanguageProvider";
import { WA_URL } from "@/lib/contact";

function RouteLine({ route }: { route: RouteInfo }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      {route.origin && <Flag code={route.origin.code} size={14} />}
      <span>{route.origin?.name ?? "–"}</span>
      <RouteArrow />
      {route.destination && <Flag code={route.destination.code} size={14} />}
      <span>{route.destination?.name ?? "–"}</span>
    </div>
  );
}

/** One card per weight tier of a corridor's special rate. */
export function SpecialRateCard({
  special,
  tier,
  route,
  orderBlocked,
}: {
  special: SpecialRateQuote;
  tier: SpecialRateTierQuote;
  route: RouteInfo;
  /** hide the order CTA (e.g. domestic price unavailable → order via support) */
  orderBlocked?: boolean;
}) {
  const t = useT();
  const startOrder = useStartOrder();
  const regions = special.entry.regions;

  return (
    <Card className="relative rounded-md overflow-hidden border-brand/40">
      <div className="relative p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="brand">
            <Sparkles className="size-3.5" /> {t("special.badge")}
          </Badge>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="size-3.5" /> {special.etaMin}–{special.etaMax}{" "}
            {t("special.hari")}
          </span>
        </div>

        <div className="mt-4">
          <RouteLine route={route} />
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          {/* inline brand mark before the sentence, like the flags in the
              route line; the name stays in text — the sentence needs it */}
          {carrierLogo(special.carrier) ? (
            <CarrierLogo carrier={special.carrier} k={16} />
          ) : (
            <CarrierMark
              carrier={special.carrier}
              className="size-6 rounded-xs text-[10px]"
            />
          )}
          <span>
            {t("special.dilayani")}{" "}
            <span className="font-medium text-foreground">
              {special.carrier} {special.service}
            </span>
          </span>
        </div>

        {/* weight tier this card prices */}
        <div className="mt-5 flex items-center gap-2">
          <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
            {tier.display}
          </span>
          {tier.flat && (
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-display text-[10px] uppercase tracking-wide text-muted">
              {t("special.flat")}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-4xl font-bold tracking-tight tabular-nums text-foreground">
            {formatIDR(tier.pricePerKg)}
          </span>
          <span className="text-muted">{t("special.perKgUnit")}</span>
        </div>

        <p className="mt-2 text-sm text-muted">
          {t("special.mulaiDari")}{" "}
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {formatIDR(tier.startingTotal)}
          </span>{" "}
          {t("special.untukKg")} {tier.minKg} kg
        </p>

        {/* rate varies by destination region (e.g. Malaysia West / East) */}
        {regions && regions.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-sm border border-border">
            <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span>{t("special.wilayahTujuan")}</span>
              <span>{t("special.hargaPerKg")}</span>
            </div>
            <ul className="divide-y divide-border">
              {regions.map((r) => (
                <li
                  key={r.label}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="text-muted">{r.label}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatIDR(r.pricePerKg)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!orderBlocked && (
          <Button
            className="mt-5 w-full"
            onClick={() =>
              startOrder({
                perKg: tier.pricePerKg,
                label: `${special.carrier} ${special.service}`,
                etaMin: special.etaMin,
                etaMax: special.etaMax,
              })
            }
          >
            {t("special.lanjutPesan")} <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

/**
 * Shared footer for the special-rate cards: the corridor's condition note plus
 * the Advance CTA — kept out of the cards so it isn't repeated per tier.
 */
export function SpecialRateFooter({ special }: { special: SpecialRateQuote }) {
  const t = useT();
  return (
    <div className="mt-5 space-y-3">
      {special.entry.note && (
        <div className="flex items-start gap-2 rounded-sm border border-warning/25 bg-warning/10 p-3 text-xs text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>{t(special.entry.note)}</p>
        </div>
      )}
      <div className="flex items-start gap-2 rounded-sm border border-border bg-surface-2/60 p-3 text-xs text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-foreground" />
        <p>
          {t("special.footerInfo")}{" "}
          <span className="font-medium text-foreground">
            {t("special.footerInfoMode")}
          </span>
          .
        </p>
      </div>
      <Button asChild variant="secondary" className="w-full">
        <Link href="/#kalkulator">{t("special.estimasiDetail")}</Link>
      </Button>
    </div>
  );
}

/** Shown when the corridor has no published special rate. */
export function SpecialRateUnavailableCard({
  route,
  isExport,
}: {
  route: RouteInfo;
  /** true when the foreign endpoint is the destination (Moving Abroad) */
  isExport: boolean;
}) {
  const t = useT();
  const country =
    (isExport ? route.destination?.name : route.origin?.name) ??
    t("special.negaraIni");

  return (
    <Card className="relative rounded-md overflow-hidden">
      <div className="p-4 sm:p-5">
        <Badge variant="neutral">
          <Globe2 className="size-3.5" /> {t("special.unavailBadge")}
        </Badge>

        <div className="mt-4">
          <RouteLine route={route} />
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
          {t("special.unavailTitlePre")} {country}
        </h3>
        <p className="mt-2 text-sm text-muted">{t("special.unavailBody")}</p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button asChild className="w-full">
            <Link href="/#kalkulator">
              {t("special.estimasiViaAdvance")} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <a href={WA_URL} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> {t("special.mintaPenawaran")}
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
