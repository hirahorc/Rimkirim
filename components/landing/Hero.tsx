"use client";

import { ShieldCheck, Globe2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/LanguageProvider";

export function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0" />
      <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72" />
      <div className="relative mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
        <Badge variant="brand" className="mx-auto mb-5">
          <Sparkles className="size-3.5" /> {t("hero.badge")}
        </Badge>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          {t("hero.titleLine")}
          <br />
          <span className="text-brand">{t("hero.titleHighlight")}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          {t("hero.subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-brand" /> {t("hero.trustClearance")}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe2 className="size-4 text-brand" /> {t("hero.trustCountries")}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-brand" /> {t("hero.trustInstant")}
          </span>
        </div>
      </div>
    </section>
  );
}
