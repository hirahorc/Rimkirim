"use client";

import * as React from "react";
import { ShieldCheck, DoorOpen, Truck } from "lucide-react";
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
        {/* neutral, not brand: the fold's lime budget belongs to the header CTA
            and the headline mark — a third lime pill (and an inert one, at that)
            makes the marker read as wallpaper. See DESIGN.md, The One-Voice Rule */}
        <Badge variant="neutral" className="mx-auto mb-5 sm:mb-6">
          {t("hero.badge")}
        </Badge>
        {/* display type runs 32px -> 76px; the 7.5vw slope keeps it fluid across
            the phone range (the old 38px floor pinned every phone to one heavy
            size and crowded the margins) while the ceiling holds desktop at 76px.
            Medium weight keeps it editorial rather than shouty at the large end */}
        <h1 className="hero-headline font-display text-[clamp(2rem,7.5vw,4.75rem)] font-medium leading-[1.05] tracking-[-0.02em]">
          <Words text={line} startIndex={0} />
          <br />
          <span className="hero-mark">
            <Words text={highlight} startIndex={lineCount} />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:mt-7 sm:text-xl">
          {t("hero.subtitle")}
        </p>
        {/* phones stack the three claims as a left-aligned block centred on the
            page: wrapping a 3-item row at 390px orphaned the last chip on its
            own centred line, which read as a rendering fault */}
        <div className="mx-auto mt-7 flex w-fit flex-col items-start gap-2 text-sm text-muted-2 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-foreground" /> {t("hero.trustClearance")}
          </span>
          <span className="flex items-center gap-1.5">
            <DoorOpen className="size-4 text-foreground" /> {t("hero.trustDoorToDoor")}
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="size-4 text-foreground" /> {t("hero.trustPickup")}
          </span>
        </div>
        </div>
      </div>
    </section>
  );
}
