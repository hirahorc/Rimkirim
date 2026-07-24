"use client";

import * as React from "react";
import { ShieldCheck, Globe2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/LanguageProvider";

/** Start delay + per-word step for the headline word cascade (seconds). */
const WORD_BASE = 0.12;
const WORD_STEP = 0.07;

/** Render a phrase as individually-animated words, continuing from `startIndex`. */
function Words({ text, startIndex }: { text: string; startIndex: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span
            className="hero-word"
            style={{ animationDelay: `${WORD_BASE + (startIndex + i) * WORD_STEP}s` }}
          >
            {word}
          </span>{" "}
        </React.Fragment>
      ))}
    </>
  );
}

export function Hero() {
  const t = useT();
  const line = t("hero.titleLine");
  const highlight = t("hero.titleHighlight");
  const lineCount = line.split(" ").length;
  return (
    <section className="relative overflow-hidden">
      <div className="grid-backdrop reveal-bg pointer-events-none absolute inset-0" />
      <div className="brand-glow reveal-bg pointer-events-none absolute inset-x-0 top-0 h-72" />
      <div className="reveal-stagger relative mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
        <Badge variant="brand" className="mx-auto mb-5">
          <Sparkles className="size-3.5" /> {t("hero.badge")}
        </Badge>
        <h1 className="hero-headline font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          <Words text={line} startIndex={0} />
          <br />
          <span className="reveal-glow text-brand">
            <Words text={highlight} startIndex={lineCount} />
          </span>
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
