"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackageX } from "lucide-react";
import { useCalculatorStore } from "@/lib/store/useCalculatorStore";
import { calculateQuotes, type QuoteInput } from "@/lib/pricing/quote";
import type { CalculatorValues } from "@/lib/schemas/calculator";
import { RateInputSummary } from "./RateInputSummary";
import { SpecialRateCard } from "./SpecialRateCard";
import { RateCard } from "./RateCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function toQuoteInput(v: CalculatorValues): QuoteInput {
  return {
    service: v.service,
    mode: v.mode,
    originCountry: v.origin.country,
    destCountry: v.destination.country,
    packages: v.packages.map((p) => ({
      weight: Number(p.weight) || 0,
      length: Number(p.length) || 0,
      width: Number(p.width) || 0,
      height: Number(p.height) || 0,
      quantity: Number(p.quantity) || 1,
    })),
    flags: {
      nonStandardPackaging: v.nonStandardPackaging,
      nonStackable: v.nonStackable,
    },
  };
}

export function CheckRatesClient() {
  const router = useRouter();
  const submitted = useCalculatorStore((s) => s.submitted);
  const hydrated = useCalculatorStore((s) => s.hydrated);

  React.useEffect(() => {
    if (hydrated && !submitted) router.replace("/");
  }, [hydrated, submitted, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (!submitted) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <PackageX className="size-10 text-muted-2" />
        <h2 className="mt-4 font-display text-xl font-semibold">
          Belum ada data pengiriman
        </h2>
        <p className="mt-2 text-sm text-muted">
          Isi kalkulator dulu untuk melihat estimasi tarif.
        </p>
        <Button asChild className="mt-5">
          <Link href="/#kalkulator">Ke Kalkulator</Link>
        </Button>
      </div>
    );
  }

  const quote = calculateQuotes(toQuoteInput(submitted));
  const isAdvance = submitted.mode === "advance" && quote.options.length > 0;
  const cheapestId = quote.options[0]?.vendor.id;
  const fastestId = [...quote.options].sort(
    (a, b) => a.etaMax - b.etaMax || a.etaMin - b.etaMin,
  )[0]?.vendor.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {isAdvance ? "Bandingkan tarif" : "Special rate untukmu"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isAdvance
            ? "Harga sudah termasuk chargeable weight & surcharge sesuai detail paketmu."
            : "Penawaran flat rate untuk semua negara. Pakai Advance untuk harga final."}
        </p>
      </header>

      <div className="mb-6">
        <RateInputSummary
          input={submitted}
          route={quote.route}
          chargeableWeight={quote.chargeableWeight}
        />
      </div>

      {isAdvance ? (
        <div className="grid gap-4">
          {quote.options.map((opt) => (
            <RateCard
              key={opt.vendor.id}
              quote={opt}
              route={quote.route}
              chargeableWeight={quote.chargeableWeight}
              cheapest={opt.vendor.id === cheapestId}
              fastest={opt.vendor.id === fastestId && opt.vendor.id !== cheapestId}
            />
          ))}
        </div>
      ) : (
        <SpecialRateCard special={quote.special} route={quote.route} />
      )}

      <p className="mt-8 text-center text-xs text-muted-2">
        Estimasi tarif dapat berubah sesuai verifikasi dimensi & berat aktual saat
        pickup. Butuh bantuan?{" "}
        <a
          href="https://wa.me/6281234567890"
          className="text-brand hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Chat tim Rimkirim
        </a>
        .
      </p>
    </div>
  );
}
