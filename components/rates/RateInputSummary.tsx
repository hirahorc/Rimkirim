"use client";

import Link from "next/link";
import { Pencil, Home, Plane, Package } from "lucide-react";
import type { CalculatorValues } from "@/lib/schemas/calculator";
import type { RouteInfo } from "@/lib/pricing/quote";
import { Flag } from "@/components/shared/Flag";
import { formatNumber } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/LanguageProvider";

export function RateInputSummary({
  input,
  route,
  chargeableWeight,
}: {
  input: CalculatorValues;
  route: RouteInfo;
  chargeableWeight: number;
}) {
  const t = useT();
  const ServiceIcon = input.service === "bfg" ? Home : Plane;
  const serviceLabel =
    input.service === "bfg" ? t("calc.serviceBfg") : t("calc.serviceMa");
  const pkgCount = input.packages.reduce((n, p) => n + (Number(p.quantity) || 1), 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <ServiceIcon className="size-4 text-brand" />
          {serviceLabel}
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          {route.origin && <Flag code={route.origin.code} size={12} />}
          {route.origin?.name ?? "—"}
          <span className="text-muted-2">→</span>
          {route.destination && <Flag code={route.destination.code} size={12} />}
          {route.destination?.name ?? "—"}
        </span>
        <Badge variant={input.mode === "advance" ? "brand" : "neutral"}>
          {input.mode === "advance" ? t("calc.modeAdvance") : t("calc.modeBase")}
        </Badge>
        {input.mode === "advance" && (
          <span className="flex items-center gap-1.5 text-muted">
            <Package className="size-3.5" />
            {pkgCount} {t("summary.paketUnit")} · {formatNumber(chargeableWeight)} kg
          </span>
        )}
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link href="/#kalkulator">
          <Pencil className="size-3.5" /> {t("summary.ubah")}
        </Link>
      </Button>
    </div>
  );
}
