"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PROOF } from "@/lib/data/proof";
import { StepRail } from "./StepRail";

const STEPS = ["s1", "s2", "s3", "s4", "s5"] as const;

const countryName = (code: string, locale: string) =>
  new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;

/**
 * The whole order, start to finish, so a first-time visitor knows the site
 * can carry it without a chat. Each step names the customer's part and ours;
 * step 3 states the one guarantee a cold visitor needs most: nothing moves
 * until they approve a quotation.
 */
export function HowItWorks() {
  const { t, locale } = useLanguage();
  return (
    <section id="cara-kerja" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {t("how.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("how.heading")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{t("how.subtitle")}</p>
        </div>

        <StepRail
          steps={STEPS.map((s) => ({ title: t(`how.${s}Title`), body: t(`how.${s}Body`) }))}
          className="mt-12 sm:grid-cols-2 lg:grid-cols-5"
        />

        {/* only real, confirmed numbers: lib/data/proof.ts stays empty until
            marketing fills it, and then this row simply appears */}
        {PROOF.durations.length > 0 && (
          <div className="mt-10 rounded-md bg-surface-2 px-5 py-4">
            <p className="font-display text-xs font-medium uppercase tracking-[0.14em] text-muted">
              {t("how.durationsTitle")}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {PROOF.durations.map((d) => (
                <li key={d.country}>
                  {countryName(d.country, locale)}{" "}
                  <span className="text-muted">
                    {t("how.durationDays")
                      .replace("{min}", String(d.min))
                      .replace("{max}", String(d.max))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button asChild variant="secondary">
            <Link href="/#kalkulator">
              {t("how.cta")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
