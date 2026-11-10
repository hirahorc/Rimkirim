"use client";

import { ChevronUp } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { at, Bar } from "./SceneParts";
import { BooksObjects, ClothesObjects, HobbyObjects, HomeObjects, RecordPlayerObjects } from "./ShipObjects";

/**
 * The pictures of What you can send's bento (WhatYouCanShip): on every tile
 * the things themselves, drawn in the round (ShipObjects), and beside them
 * the one thing the tile says, a different kind on each so no two
 * neighbours say it the same way (the stageshow bento rules): the Packages
 * step's own package, its clothes listed (the hero); the one number books
 * are about (BooksStat, page text); what people ask about (a collection).
 * The home's things and the hobby things stand alone, each one group
 * centred over its words. Text is pinned to its tile's edge at 1:1, so a
 * wider tile shows more ground, never larger type. The pieces carry the journey's entrances
 * (`.jr-*`, `at(ms)`) and build once, on the tile's SceneStage; everything
 * but the stat is decorative, since the tile's words carry the meaning.
 */

/* ------------------------------------------------------------------ */
/*  Clothes: a package of the Packages step, its clothes listed        */
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
 * Packages step's own package, open: its head with what it's packed in,
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

/**
 * The clothes themselves, in front of the package (WhatYouCanShip lays them
 * on a stage of their own, past the package's fade): from md under the
 * list's left edge, between it and the words; stacked, at the picture's
 * foot on the right, over the rows still to fill. They land once the
 * list has filled.
 */
export function ClothesPicture() {
  return (
    <div
      className="jr jr-rise absolute bottom-1 right-3 w-[13rem] md:right-auto md:left-[calc(max(20rem,44%)_-_7rem)] md:w-[18rem]"
      style={at(700)}
    >
      <ClothesObjects className="h-auto w-full" />
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

/** the books themselves, beside the number in the tile's top right corner,
 *  clear of its line and of the words under it (WhatYouCanShip lays them on
 *  a stage of their own over the stat) */
export function BooksPicture() {
  return (
    <div className="jr jr-rise absolute right-5 top-7 w-[9.5rem] sm:w-[10rem]" style={at(200)}>
      <BooksObjects className="h-auto w-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Home: the things themselves                                        */
/* ------------------------------------------------------------------ */

/** the home's things as one group, centred over the words: a lamp at the
 *  back, a pot, bowls in front */
export function HomePicture() {
  return (
    <div className="absolute inset-x-6 bottom-2 flex justify-center">
      <div className="jr jr-rise w-[15.5rem] max-w-full sm:w-[17rem]" style={at(0)}>
        <HomeObjects className="h-auto w-full" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sports & hobbies: the things themselves                            */
/* ------------------------------------------------------------------ */

/** the hobby things as one pile, centred over the words as the home's
 *  group is: a guitar, a racket crossed behind it, a shuttlecock and a
 *  golf ball in front */
export function HobbyPicture() {
  return (
    <div className="absolute inset-x-6 bottom-2 flex justify-center">
      <div className="jr jr-rise w-[15.5rem] max-w-full sm:w-[17rem]" style={at(0)}>
        <HobbyObjects className="h-auto w-full" />
      </div>
    </div>
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

/**
 * What people ask about, as the questions themselves, and one of the odd
 * things they ask about in the corner: a record player. On a tile too
 * narrow for both (under 20rem) the questions keep the room.
 */
export function AsksPicture() {
  const t = useT();
  let n = 0;
  return (
    <>
      <div className="jr jr-rise absolute bottom-1 right-4 w-[9.5rem] @max-xs:hidden" style={at(0)}>
        <RecordPlayerObjects className="h-auto w-full" />
      </div>
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
    </>
  );
}
