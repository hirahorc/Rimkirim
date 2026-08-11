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
      {/* the backdrop sits in an oversized box so it has room to drift without
          exposing an edge; the inner element keeps its own load-in fade */}
      <div className="hero-drift pointer-events-none absolute inset-x-0 -inset-y-12">
        <div className="grid-backdrop reveal-bg size-full" />
      </div>
      <div className="hero-settle relative">
        <div className="reveal-stagger mx-auto max-w-4xl px-4 pt-20 text-center sm:px-6 sm:pt-28">
        <Badge variant="brand" className="mx-auto mb-6">
          {t("hero.badge")}
        </Badge>
        {/* display type runs 38px -> 76px; medium weight keeps it editorial
            rather than shouty at the large end */}
        <h1 className="hero-headline font-display text-[clamp(2.375rem,6.5vw,4.75rem)] font-medium leading-[1.05] tracking-[-0.02em]">
          <Words text={line} startIndex={0} />
          <br />
          <span className="hero-mark">
            <Words text={highlight} startIndex={lineCount} />
          </span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-foreground" /> {t("hero.trustClearance")}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe2 className="size-4 text-foreground" /> {t("hero.trustCountries")}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-foreground" /> {t("hero.trustInstant")}
          </span>
        </div>
        </div>
      </div>
    </section>
  );
}
