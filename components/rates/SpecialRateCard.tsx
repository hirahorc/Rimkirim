"use client";

import Link from "next/link";
import { Sparkles, Clock, Info, ArrowRight } from "lucide-react";
import type { SpecialRateQuote, RouteInfo } from "@/lib/pricing/quote";
import { flagEmoji } from "@/lib/data/countries";
import { formatIDR } from "@/lib/utils/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SpecialRateCard({
  special,
  route,
}: {
  special: SpecialRateQuote;
  route: RouteInfo;
}) {
  return (
    <Card className="relative overflow-hidden border-brand/40">
      <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-32" />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <Badge variant="brand">
            <Sparkles className="size-3.5" /> Special Rate
          </Badge>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="size-3.5" /> {special.etaMin}–{special.etaMax} hari
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          {route.origin && <span>{flagEmoji(route.origin.code)}</span>}
          <span>{route.origin?.name ?? "—"}</span>
          <span className="text-muted-2">→</span>
          {route.destination && <span>{flagEmoji(route.destination.code)}</span>}
          <span>{route.destination?.name ?? "—"}</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold tracking-tight text-brand">
            {formatIDR(special.perKg)}
          </span>
          <span className="text-muted">/ kg</span>
        </div>

        <p className="mt-2 text-sm text-muted">
          Minimum pengiriman{" "}
          <span className="font-medium text-foreground">{special.minWeightKg} kg</span>{" "}
          — mulai dari{" "}
          <span className="font-semibold text-foreground">
            {formatIDR(special.minTotal)}
          </span>
        </p>

        <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-surface-2/60 p-3 text-xs text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-brand" />
          <p>
            Special rate berlaku flat untuk semua negara. Untuk harga final termasuk
            chargeable weight & surcharge sesuai dimensi paket, gunakan mode{" "}
            <span className="font-medium text-foreground">Advance</span>.
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button className="w-full">
            Lanjut pesan <ArrowRight className="size-4" />
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/#kalkulator">Hitung akurat (Advance)</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
