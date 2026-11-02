"use client";

import { BedDouble, BookOpen, CookingPot, Lamp, Puzzle, Shirt } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { at, SceneTitle } from "./SceneParts";

/**
 * The section illustrations of the expat page, each the product moment its
 * section describes, built once on a SceneStage: so far the commercial
 * invoice and packing list for one box (what you can ship).
 *
 * Framed as the journey's scenes are (the stageshow rules): one hero
 * surface, inset a gutter from the top and sides and running off the
 * bottom, so only filler is cropped, and at most one satellite. Every size
 * is in em, a share of the stage's width; each scene names its compact
 * container query, where the gutter tightens and the type stays at 10px or
 * more. A piece that moves carries a `jr-*` class naming its entrance and
 * `at(ms)`, when it starts once the scene builds.
 */

function useScene(group: string) {
  const { t, locale } = useLanguage();
  return { k: (key: string) => t(`expat.scenes.${group}.${key}`), locale };
}

/* ------------------------------------------------------------------ */
/*  What you can ship: the CIPL for one box                            */
/* ------------------------------------------------------------------ */

/** the list's rows: the section's own goods, with the same icons, each as
 *  a line of the customs packing list, values in the origin's currency */
const ITEMS = [
  { key: "coats", Icon: Shirt, qty: 2, value: 120 },
  { key: "books", Icon: BookOpen, qty: 14, value: 70 },
  { key: "pans", Icon: CookingPot, qty: 3, value: 45 },
  { key: "sheets", Icon: BedDouble, qty: 4, value: 32 },
  { key: "games", Icon: Puzzle, qty: 2, value: 30 },
  { key: "lamp", Icon: Lamp, qty: 1, value: 25 },
] as const;

/** a sheet of the stack: inset a gutter from the top and sides, off the bottom */
const SHEET =
  "absolute inset-x-[2.6em] top-[2.6em] h-[40em] bg-background shadow-float @max-[24rem]:inset-x-[1.6em] @max-[24rem]:top-[1.6em]";

/** one column template for the head and every row, so the columns line up */
const LIST_COLS = "grid grid-cols-[1.75em_minmax(0,1fr)_2.1em_2.7em] items-center gap-x-[0.6em]";

/**
 * The commercial invoice and packing list for the last of eight boxes, the
 * document customs reads, alone on its ground: the things the section
 * lists going in row by row, then the total, the shipper's signature, and
 * Rimkirim's "Checked" stamp, every box reviewed. It is paper, not a screen, so
 * it has no rounded corner anywhere, and everything on it is printed, in
 * black and white: each piece carries `print-ink` (globals.css), toner on
 * paper, every colour a grey, its edges a fraction of a pixel ragged and
 * its ink a little thin in places, by the filter drawn here. Only the
 * signature and the stamp, put on the printout afterwards, keep a colour. The
 * filter sits on each piece, not on the sheet, so the grain travels with a
 * row as it rises instead of the row sliding through a still grain. Under
 * the sheet lie the sheets of the other boxes, their edges showing; a mouse
 * on the card fans them further (the stage's `cipl-stack`).
 */
export function PackingScene() {
  const { k } = useScene("packing");
  const total = ITEMS.reduce((s, i) => s + i.value, 0);
  return (
    <>
      <svg className="absolute size-0" aria-hidden>
        <filter id="print-ink" x="-2%" y="-10%" width="104%" height="120%" colorInterpolationFilters="sRGB">
          {/* a black and white printer: every colour comes out a grey */}
          <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="mono" />
          {/* the grain: toner is never even */}
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="7" result="grain" />
          {/* the edges, pushed a fraction of a pixel by the grain */}
          <feDisplacementMap in="mono" in2="grain" scale="0.5" xChannelSelector="R" yChannelSelector="G" result="ragged" />
          {/* where the toner missed: a finer grain read as a mask, solid but
              for its few brightest specks, so small type stays legible */}
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="3" result="specks" />
          <feColorMatrix in="specks" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -20 14" result="thin" />
          <feComposite in="ragged" in2="thin" operator="in" />
        </filter>
        <filter id="stamp-ink" x="-5%" y="-10%" width="110%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="11" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="1" xChannelSelector="R" yChannelSelector="G" result="ragged" />
          {/* rubber never inks evenly: patches, coarser than the toner's specks */}
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" seed="5" result="patches" />
          <feColorMatrix in="patches" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.5" result="thin" />
          <feComposite in="ragged" in2="thin" operator="in" />
        </filter>
      </svg>
      {/* the other boxes' sheets, a degree askew under this one, fanned
          further by a mouse (globals.css, .cipl-stack); blank, since only
          their edges ever show */}
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          data-side={side}
          className={cn(SHEET, "cipl-under jr jr-arrive")}
          style={at(0)}
        />
      ))}
      <div className={cn(SHEET, "cipl-sheet jr jr-arrive p-[1.2em] @max-[24rem]:p-[1em]")} style={at(0)}>
        <span className="print-ink block text-balance">
          <SceneTitle>{k("title")}</SceneTitle>
        </span>
        <span
          className="print-ink jr jr-drop mt-[0.45em] block w-fit whitespace-nowrap border border-foreground/60 px-[0.55em] py-[0.15em] text-[0.74em] font-semibold"
          style={at(350)}
        >
          {k("box")}
        </span>
        <div className={cn(LIST_COLS, "print-ink jr jr-rise mt-[0.9em] border-b border-border pb-[0.4em]")} style={at(450)}>
          <span />
          {[k("item"), k("qty"), k("value")].map((h, i) => (
            <span
              key={h}
              className={cn("text-[0.74em] font-medium uppercase tracking-[0.04em] text-muted-2", i > 0 && "text-right")}
            >
              {h}
            </span>
          ))}
        </div>
        <ul>
          {ITEMS.map(({ key, Icon, qty, value }, i) => (
            <li key={key} className={cn(LIST_COLS, "print-ink jr jr-rise border-b border-border py-[0.5em]")} style={at(600 + i * 170)}>
              <Icon className="size-[1.05em]" strokeWidth={1.75} />
              <span className="truncate text-[0.8em]">{k(key)}</span>
              <span className="text-right text-[0.8em] tabular-nums text-muted">{qty}</span>
              <span className="text-right text-[0.8em] tabular-nums">£{value}</span>
            </li>
          ))}
        </ul>
        <div className={cn(LIST_COLS, "print-ink jr jr-rise pt-[0.6em]")} style={at(1600)}>
          <span />
          <span className="text-[0.8em] font-semibold">{k("total")}</span>
          <span />
          <span className="text-right text-[0.8em] font-semibold tabular-nums">£{total}</span>
        </div>
        <div className="mt-[0.9em] flex items-end justify-between gap-[1em]">
          {/* signed by the shipper, last, in pen in the chapter's ink */}
          <div className="w-[9em]">
            <svg
              viewBox="0 0 120 34"
              className="block h-[2.1em] w-full overflow-visible text-tone-ink"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path
                className="jr jr-ring"
                style={at(1750)}
                pathLength={100}
                d="M6 26C9 18 12 6 16 6c4 0 1 14-2 20-2 4 4 4 8-4 3-6 5-6 6 0 1 5 5 4 7-2 2-5 5-4 5 1 0 5 4 5 7-1 2-4 5-3 5 2 0 5 5 4 8-3 2-5 3-11 1-11-3 0-3 12 1 17 3 4 8-1 11-6 2-3 5-2 6 3 1 4 7 3 11-2 4-5 10-6 14-3-8 13-44 16-80 14"
              />
            </svg>
            <span className="print-ink block whitespace-nowrap border-t border-foreground/40 pt-[0.35em] text-[0.74em] font-medium uppercase tracking-[0.03em] text-muted-2">
              {k("signed")}
            </span>
          </div>
          {/* checked by Rimkirim: the team's stamp on the last box's sheet,
              in the same ink as the signature, since only what a hand puts
              on the printout keeps a colour */}
          <span
            className="cipl-stamp mb-[0.35em] mr-[0.3em] flex shrink-0 flex-col items-center border-[0.13em] border-current px-[0.75em] pb-[0.3em] pt-[0.25em] text-tone-ink outline outline-[0.07em] outline-offset-[0.16em] outline-current"
          >
            <span className="text-[0.58em] font-semibold uppercase leading-tight tracking-[0.2em]">Rimkirim</span>
            <span className="font-display text-[1.1em] font-bold uppercase leading-none tracking-[0.1em]">{k("stamp")}</span>
          </span>
        </div>
      </div>
    </>
  );
}
