"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateQuotes, type QuoteInput } from "@/lib/pricing/quote";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatIDR, formatNumber } from "@/lib/utils/currency";

/**
 * Two ordinary moving boxes from the UK. Light for their size, so the
 * volumetric weight wins and the example shows why chargeable weight exists.
 */
const BOX = { weight: 14, length: 60, width: 40, height: 40, quantity: 1 };
const EXAMPLE: QuoteInput = {
  service: "bfg",
  mode: "advance",
  originCountry: "GB",
  destCountry: "ID",
  packages: [BOX, BOX].map((b) => ({ ...b, nonStandardPackaging: false, nonStackable: false })),
};

/**
 * "Harga transparan" shown instead of claimed: one worked example run through
 * the same engine as the calculator, so the figure moves when the rates do and
 * can never drift into a number nobody can reproduce. Labelled an example
 * (PRODUCT.md, "Estimasi disebut estimasi").
 */
export function PriceProof() {
  const { t, locale } = useLanguage();
  const { quote, chargeable, actual, volumetric } = React.useMemo(() => {
    const result = calculateQuotes(EXAMPLE);
    const cheapest = [...result.options].sort((a, b) => a.total - b.total)[0];
    const pkgs = EXAMPLE.packages;
    return {
      quote: cheapest,
      chargeable: result.chargeableWeight,
      actual: pkgs.reduce((s, p) => s + p.weight, 0),
      volumetric: pkgs.reduce((s, p) => s + (p.length * p.width * p.height) / 5000, 0),
    };
  }, []);
  if (!quote) return null;

  const from = new Intl.DisplayNames([locale], { type: "region" }).of("GB") ?? "GB";
  const kg = (n: number) => formatNumber(n, 1, locale);

  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl items-end gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-x-16 lg:gap-y-8">
        <div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {t("proof.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("proof.heading")}
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            {t("proof.subtitle").replace("{from}", from).replace("{boxes}", String(EXAMPLE.packages.length))}
          </p>
        </div>

        {/* phones read the numbers before the button; lg tucks the button
            under the copy, beside the card */}
        <Card className="proof-card rounded-lg p-6 sm:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {/* rows arrive in the order the sum is built: weight, base, surcharge,
              total (globals.css, .proof-row) */}
          <dl className="space-y-4 text-sm">
            <div className="proof-row" style={{ "--i": 0 } as React.CSSProperties}>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">{t("proof.chargeable")}</dt>
                <dd className="shrink-0 font-medium">{kg(chargeable)} kg</dd>
              </div>
              <p className="mt-1 text-xs leading-snug text-muted-2">
                {t("proof.chargeableHint")
                  .replace("{actual}", kg(actual))
                  .replace("{vol}", kg(volumetric))}
              </p>
            </div>
            <div className="proof-row flex items-baseline justify-between gap-3" style={{ "--i": 1 } as React.CSSProperties}>
              <dt className="text-muted">
                {t("proof.base")}{" "}
                <span className="text-muted-2">
                  (<span className="font-mono tabular-nums">{formatIDR(quote.baseRatePerKg)}</span> × {kg(chargeable)} kg)
                </span>
              </dt>
              <dd className="shrink-0 font-mono font-medium tabular-nums">{formatIDR(quote.baseRate)}</dd>
            </div>
            <div className="proof-row flex items-baseline justify-between gap-3" style={{ "--i": 2 } as React.CSSProperties}>
              <dt className="text-muted">{t("proof.surcharge")}</dt>
              <dd className="shrink-0 text-muted-2">
                {quote.surchargeTotal > 0 ? (
                  <span className="font-mono tabular-nums text-foreground">{formatIDR(quote.surchargeTotal)}</span>
                ) : (
                  t("proof.noSurcharge")
                )}
              </dd>
            </div>
            <div className="proof-row flex items-baseline justify-between gap-3 border-t border-border pt-4" style={{ "--i": 3 } as React.CSSProperties}>
              <dt className="font-semibold">
                {t("proof.total")}
                <span className="block text-xs font-normal text-muted-2">
                  {t("proof.via").replace("{carrier}", quote.vendor.carrier)}
                </span>
              </dt>
              <dd className="shrink-0 font-mono text-lg font-semibold tabular-nums">{formatIDR(quote.total)}</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-snug text-muted-2">{t("proof.note")}</p>
        </Card>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <Button asChild variant="secondary">
            <Link href="/#kalkulator">
              {t("proof.cta")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
