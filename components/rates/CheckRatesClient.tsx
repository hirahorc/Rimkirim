"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackageX } from "lucide-react";
import { useCalculatorStore, useStoreHydrated } from "@/lib/store/useCalculatorStore";
import { useT } from "@/lib/i18n/LanguageProvider";
import { calculateQuotes, type QuoteInput } from "@/lib/pricing/quote";
import type { CalculatorValues } from "@/lib/schemas/calculator";
import { RateInputSummary } from "./RateInputSummary";
import {
  SpecialRateCard,
  SpecialRateFooter,
  SpecialRateUnavailableCard,
} from "./SpecialRateCard";
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
      nonStandardPackaging: Boolean(p.nonStandardPackaging),
      nonStackable: Boolean(p.nonStackable),
    })),
  };
}

export function CheckRatesClient() {
  const router = useRouter();
  const t = useT();
  const submitted = useCalculatorStore((s) => s.submitted);
  const hydrated = useStoreHydrated();

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
          {t("rates.emptyTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("rates.emptyBody")}</p>
        <Button asChild className="mt-5">
          <Link href="/#kalkulator">{t("rates.toCalculator")}</Link>
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
      <header className="mb-5">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {isAdvance
            ? t("rates.advanceTitle")
            : quote.special
              ? t("rates.specialTitle")
              : t("rates.noRateTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {isAdvance
            ? t("rates.advanceSub")
            : quote.special
              ? t("rates.specialSub")
              : t("rates.noRateSub")}
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
      ) : quote.special ? (
        <>
          <div className="grid gap-4">
            {quote.special.tiers.map((tier) => (
              <SpecialRateCard
                key={tier.display}
                special={quote.special!}
                tier={tier}
                route={quote.route}
              />
            ))}
          </div>
          <SpecialRateFooter special={quote.special} />
        </>
      ) : (
        <SpecialRateUnavailableCard
          route={quote.route}
          isExport={submitted.service === "moving-abroad"}
        />
      )}

      <p className="mt-8 text-center text-xs text-muted-2">
        {t("rates.footNote")}{" "}
        <a
          href="https://wa.me/6281234567890"
          className="text-brand hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {t("rates.chatLink")}
        </a>
        .
      </p>
    </div>
  );
}
