"use client";

import { ChevronUp } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { at, Bar } from "./SceneParts";
import { ShipArt } from "./ShipArt";

/**
 * The pictures of What you can send's bento (WhatYouCanShip), one kind per
 * tile so no two neighbours say the same thing the same way (the stageshow
 * bento rules): the Packing List's own package, clothes listed in it (the
 * hero); the one number books are about (BooksStat, page text); the home's
 * things, drawn (ShipArt); the size rule as a measured case (a diagram);
 * and what people ask about (a collection). Each is drawn at 1:1 in px and
 * pinned to its tile's edge, so a wider tile shows more ground or more of
 * a bleed, never larger type. The pieces carry the journey's entrances
 * (`.jr-*`, `at(ms)`) and build once, on the tile's SceneStage; everything
 * but the stat is decorative, since the tile's words carry the meaning.
 */

/* ------------------------------------------------------------------ */
/*  Clothes: a package of the Packing List, its clothes listed          */
/* ------------------------------------------------------------------ */

/** what's in it, as a customer lists it: by name, how many, each one's
 *  value left as the field's quiet line; then the rows still to fill,
 *  quiet lines all, where the crop falls */
const PACKED = [
  { key: "coats", qty: 3, value: "4.5rem" },
  { key: "jeans", qty: 5, value: "3.5rem" },
  { key: "trainers", qty: 2, value: "4rem" },
] as const;
const TO_FILL = [
  ["6rem", "3rem"],
  ["4.5rem", "4rem"],
  ["7rem", "3.5rem"],
] as const;

/** a row of the list: its name, how many, its value, in fixed tracks so
 *  the columns line up and a wider card adds ground, not gaps */
const ROW = "grid grid-cols-[minmax(0,1fr)_2.5rem_5rem] items-center gap-3";

/**
 * Clothes, folded and listed per box (the card's customs rule), on the
 * Packing List's own package, open: its head with what it's packed in,
 * then what's inside, a row at a time. From md it hangs off the tile's
 * right edge, beside the words, and runs off its foot; stacked over them,
 * it's inset and fades out at the picture's foot (the hero tile's mask).
 */
export function PackedPicture() {
  const t = useT();
  const p = (k: string) => t(`expatOrder.packing.${k}`);
  return (
    <div
      className="jr jr-arrive absolute inset-x-5 top-5 mx-auto max-w-[26rem] rounded-[14px] bg-background p-4 shadow-float md:-right-[4.5rem] md:left-[max(20rem,44%)] md:top-8 md:mx-0 md:max-w-none md:p-5"
      style={at(0)}
    >
      <div className="flex items-center gap-2">
        <ChevronUp aria-hidden className="size-4 shrink-0 text-muted-2" />
        <span className="shrink-0 font-display text-sm font-semibold">{p("packageN").replace("{n}", "1")}</span>
        <span className="truncate text-sm text-muted">{p("types.suitcase")}</span>
      </div>
      <span className="mt-4 block text-xs font-medium">{p("inside")}</span>
      {/* from md the card runs 4.5rem past the tile's edge; the list stops
          a gutter short of it, so the values read whole */}
      <ul className="mt-1 divide-y divide-border md:mr-[4.75rem]">
        {/* the rows stand from the start; what's in them is filled in, a
            row at a time */}
        {PACKED.map((it, i) => (
          <li key={it.key} className={cn(ROW, "py-2.5 text-sm")}>
            <span className="jr jr-rise truncate" style={at(450 + i * 220)}>
              {t(`expat.scenes.packed.${it.key}`)}
            </span>
            <span className="jr jr-rise text-right tabular-nums" style={at(500 + i * 220)}>
              {it.qty}
            </span>
            <span className="jr jr-rise justify-self-end" style={at(550 + i * 220)}>
              <Bar w={it.value} />
            </span>
          </li>
        ))}
        {TO_FILL.map(([name, value]) => (
          <li key={name} className={cn(ROW, "py-[1.0625rem]")}>
            <Bar w={name} />
            <span />
            <Bar w={value} className="justify-self-end" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Books: the one number                                              */
/* ------------------------------------------------------------------ */

/** the duty books pay, as the customs table states it, at the Display
 *  role's top size (DESIGN.md, Typography): page text, not a picture, so
 *  it's read as well as seen */
export function BooksStat() {
  const t = useT();
  return (
    <div className="px-6 pt-6">
      <p className="text-sm font-medium text-tone-ink">{t("expat.ship.books.stat.lead")}</p>
      <p className="mt-2 whitespace-nowrap font-display text-[4.75rem] font-medium leading-[1.05] tracking-[-0.02em] text-tone-ink tabular-nums">
        {t("expat.customs.rates.books.duty")}
      </p>
      <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-muted">{t("expat.ship.books.stat.label")}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Home: the things themselves                                        */
/* ------------------------------------------------------------------ */

export function HomePicture() {
  return (
    <div className="jr jr-rise absolute left-6 top-6" style={at(0)}>
      <ShipArt name="home" className="h-[8.5rem] w-[12.75rem] sm:h-[9.5rem] sm:w-[14.25rem]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sports & hobbies: the size rule, measured                          */
/* ------------------------------------------------------------------ */

/** where the case starts, where 121 cm falls, and the case's middle line,
 *  in the picture's px */
const CASE = { x: 24, mark: 236, y: 112 };

/** a guitar's hard case, lying head to the right, its middle line at 0: the
 *  lower bout, the waist, the upper bout, the shoulders into the neck, and
 *  the head's flare at the far end, one outline mirrored top to bottom */
const GUITAR_CASE =
  "M0 0C0-24 18-40 42-40C62-40 72-30 88-30C102-30 110-35 126-34C150-33 158-14 178-13" +
  "H436C440-13 442-18 448-18H500Q512-18 512-6V6Q512 18 500 18H448C442 18 440 13 436 13" +
  "H178C158 14 150 33 126 34C110 35 102 30 88 30C72 30 62 40 42 40C18 40 0 24 0 0Z";

/**
 * A guitar's hard case lying along a measure: 121 cm runs from its end to
 * a mark, and the case goes on past the mark and off the tile. The rule a
 * long thing meets, shown on the thing.
 */
export function RulerPicture() {
  const { x, mark, y } = CASE;
  return (
    <>
      <svg
        viewBox="0 0 560 176"
        className="jr jr-rise ship-art absolute left-0 top-0 h-[176px] w-[560px]"
        style={at(0)}
        aria-hidden
      >
        <ellipse cx={x + 250} cy={y + 41} rx={250} ry={4} className="fill-(--art-ground)" />
        <path d={GUITAR_CASE} transform={`translate(${x} ${y})`} className="fill-(--art-ink)" />
      </svg>
      {/* the measure: from the case's end to 121 cm, with the mark's line
          dropped through the case */}
      <div className="absolute" style={{ left: x, top: 34, width: mark - x }}>
        <span className="jr jr-rise block text-center font-display text-sm font-semibold text-tone-ink" style={at(900)}>
          121 cm
        </span>
        <span className="mt-1.5 flex items-center">
          <span className="h-3 w-px shrink-0 bg-tone-ink" />
          <span className="jr jr-grow h-px flex-1 origin-left bg-tone-ink" style={at(350)} />
          <span className="h-3 w-px shrink-0 bg-tone-ink" />
        </span>
      </div>
      <span
        className="jr jr-drop absolute w-0 border-l border-dashed border-tone-ink/60"
        style={{ left: mark - 0.5, top: 58, height: 112, ...at(800) }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Anything else: what people ask about                               */
/* ------------------------------------------------------------------ */

/** the questions, in rows set off each other like a pile of notes */
const ASKS = [
  { keys: ["a", "b"], indent: "0rem" },
  { keys: ["c"], indent: "2.25rem" },
  { keys: ["d"], indent: "0.75rem" },
] as const;

export function AsksPicture() {
  const t = useT();
  let n = 0;
  return (
    <div className="absolute left-6 right-6 top-6 grid gap-2.5">
      {ASKS.map((row, i) => (
        <div key={i} className="flex gap-2" style={{ paddingLeft: row.indent }}>
          {row.keys.map((k) => (
            <span
              key={k}
              className="jr jr-drop whitespace-nowrap rounded-full bg-background px-3.5 py-2 text-sm shadow-float"
              style={at(250 + n++ * 140)}
            >
              {t(`expat.scenes.asks.${k}`)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
