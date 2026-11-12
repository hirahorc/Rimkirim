"use client";

import * as React from "react";
import { RateCard } from "@/components/expat-order/RateCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { expatRates } from "@/lib/pricing/expat-rates";
import { formatNumber } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { at } from "./SceneParts";

/**
 * The pricing section's four pictures, one a step, working the section's
 * sum on one example: a box light for its size and a suitcase heavy for its
 * size. Each is a short motion graphic and not a still, because a picture
 * this small holds one thing at a time: what moves through it in turn (one
 * worked piece, then the other; one rate, then another) is what a still
 * would have needed four times the room for. They play as a relay where
 * they sit in a row, each taking its turn (`start`) as the one before lands
 * the figure it hands over, on cards that came up together (`arrive`) and
 * wait; stacked, each plays as it comes into view, with both at 0. What a
 * picture ends on is a whole picture of its own, and it is all a reader
 * without motion or script sees: the pieces that only pass (`.jr-pass`)
 * stand hidden there. QuoteFactors runs the relay; DESIGN.md, Motion, "The
 * section scenes".
 *
 * Framed as every scene on the page is: one white card a gutter from the
 * top and sides and off the foot, every size in em, a share of the
 * picture's width. The piece a picture ends on carries `data-scene-end`.
 */

type Turn = {
  /** ms into the run when this picture's own work begins */
  start: number;
  /** ms into the run when its card comes up */
  arrive: number;
};

/** `cardboard: false` is what brings a handling surcharge */
const BOX = { key: "box", kg: 12, dims: [60, 40, 40], cardboard: true } as const;
const SUITCASE = { key: "suitcase", kg: 24, dims: [75, 50, 30], cardboard: false } as const;
type Piece = typeof BOX | typeof SUITCASE;
const PIECES = [BOX, SUITCASE] as const;

/** length × width × height ÷ 5000, as the calculator works it */
const volumetric = (p: Piece) => (p.dims[0] * p.dims[1] * p.dims[2]) / 5000;
const chargeable = (p: Piece) => Math.max(p.kg, volumetric(p));
const TOTAL = chargeable(BOX) + chargeable(SUITCASE);

const CARD =
  "jr jr-arrive absolute inset-x-[1em] top-[1em] h-[30em] rounded-[1em] bg-background p-[1em] shadow-float";

/** a piece that holds the stage for `len` ms from `ms`, then gives it up */
const pass = (ms: number, len: number) => ({ "--d": `${ms}ms`, "--len": `${len}ms` }) as React.CSSProperties;
/** how long one takes to come in over another (globals.css, jr-pass-in):
 *  the one under it leaves only once it's covered */
const SWAP_MS = 300;

function useScene() {
  const { t, locale } = useLanguage();
  return {
    k: (key: string) => t(`expat.scenes.pricing.${key}`),
    kg: (n: number) => `${formatNumber(n, 1, locale)} kg`,
  };
}

/* ------------------------------------------------------------------ */
/*  1: each piece's chargeable weight                                  */
/* ------------------------------------------------------------------ */

/** one of a piece's two weights; the higher one is the one that counts, and
 *  is marked as it's found */
function Weight({ label, value, wins, ms }: { label: string; value: string; wins: boolean; ms: number }) {
  return (
    <div className="relative rounded-[0.5em] bg-surface-2 px-[0.6em] py-[0.4em]">
      {wins && <span className="jr jr-press absolute inset-0 rounded-[0.5em] bg-(--tone-wash)" style={at(ms + 300)} />}
      <span className="relative block text-[0.75em] font-medium uppercase tracking-[0.04em] text-muted-2">{label}</span>
      <span
        className={cn(
          "jr jr-rise relative mt-[0.1em] block whitespace-nowrap text-[0.85em] tabular-nums",
          wins ? "font-semibold text-tone-ink" : "text-muted-2",
        )}
        style={at(ms)}
      >
        {value}
      </span>
    </div>
  );
}

/** a piece worked through: what it weighs and measures, typed in; its
 *  sides multiplied, over 5000; then the two weights side by side */
function Worksheet({ piece, from }: { piece: Piece; from: number }) {
  const { k, kg } = useScene();
  const vol = volumetric(piece);
  return (
    <>
      <span className="block text-[0.75em] font-semibold uppercase tracking-[0.06em] text-muted">{k(piece.key)}</span>
      <div className="mt-[0.45em] grid grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] gap-[0.4em]">
        {[`${piece.kg} kg`, `${piece.dims.join(" × ")} cm`].map((v, j) => (
          <span key={v} className="flex h-[2.1em] items-center rounded-[0.5em] bg-surface-2 px-[0.6em]">
            <span className="jr jr-type whitespace-nowrap text-[0.8em] tabular-nums" style={at(from + 150 + j * 150)}>
              {v}
            </span>
          </span>
        ))}
      </div>
      <p className="jr jr-rise mt-[0.55em] whitespace-nowrap text-[0.78em] tabular-nums text-muted" style={at(from + 500)}>
        {piece.dims.join(" × ")} ÷ 5000 = <span className="font-medium text-foreground">{kg(vol)}</span>
      </p>
      <div className="mt-[0.5em] grid grid-cols-2 gap-[0.4em]">
        <Weight label={k("actual")} value={kg(piece.kg)} wins={vol <= piece.kg} ms={from + 650} />
        <Weight label={k("volumetric")} value={kg(vol)} wins={vol > piece.kg} ms={from + 650} />
      </div>
    </>
  );
}

/**
 * Both ways the rule can go, one after the other on the same sheet: the
 * suitcase, where the scale wins, then the box, where the size does, which
 * is the one that surprises and so the one the picture ends on. Each drops
 * its answer into the foot, and those two answers are what step 2 adds up.
 */
export function ChargeableScene({ start, arrive }: Turn) {
  const { k, kg } = useScene();
  const suitcase = start + 200;
  const box = start + 1750;
  return (
    <div className={CARD} style={at(arrive)}>
      <div className="grid [&>*]:[grid-area:1/1]">
        <div className="jr-pass" style={pass(suitcase, box + SWAP_MS - suitcase)}>
          <Worksheet piece={SUITCASE} from={suitcase} />
        </div>
        <div className="jr jr-swap bg-background" style={at(box)}>
          <Worksheet piece={BOX} from={box} />
        </div>
      </div>
      <div className="mt-[0.7em] border-t border-border pt-[0.55em]">
        <span className="block text-[0.75em] font-medium text-muted">{k("chargeable")}</span>
        <div className="mt-[0.35em] flex flex-wrap gap-[0.4em]">
          {PIECES.map((p) => {
            const last = p === BOX;
            return (
              <span
                key={p.key}
                className="jr jr-rise whitespace-nowrap rounded-full bg-surface-2 px-[0.65em] py-[0.25em] text-[0.78em]"
                style={at((last ? box : suitcase) + 1050)}
                data-scene-end={last ? "" : undefined}
              >
                {k(p.key)} <span className="font-semibold tabular-nums">{kg(chargeable(p))}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2: the pieces added up                                             */
/* ------------------------------------------------------------------ */

/** step 1's two answers come down into their rows, a line is drawn under
 *  them, and the total lands: the section's one big number */
export function SumScene({ start, arrive }: Turn) {
  const { k, kg } = useScene();
  return (
    <div className={CARD} style={at(arrive)}>
      <ul className="grid gap-[0.4em]">
        {PIECES.map((p, i) => (
          <li
            key={p.key}
            className="flex items-baseline justify-between gap-[1em] rounded-[0.5em] bg-surface-2 px-[0.7em] py-[0.5em] text-[0.85em]"
          >
            <span>
              {i > 0 && <span className="mr-[0.4em] text-muted-2">+</span>}
              {k(p.key)}
            </span>
            <span className="jr jr-drop font-medium tabular-nums" style={at(start + 250 + i * 200)}>
              {kg(chargeable(p))}
            </span>
          </li>
        ))}
      </ul>
      <span className="jr jr-grow mt-[0.7em] block h-px origin-left bg-border-strong" style={at(start + 650)} />
      <div className="mt-[0.6em] flex items-baseline justify-between gap-[1em]">
        <span className="text-[0.8em] font-medium">{k("chargeable")}</span>
        <span
          className="jr jr-rise font-display text-[1.5em] font-semibold tabular-nums tracking-tight"
          style={at(start + 950)}
          data-scene-end=""
        >
          {kg(TOTAL)}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3: times the rate per kilo                                         */
/* ------------------------------------------------------------------ */

/** a rate from the flow's own table at the example's weight, by its id */
const rateOf = (origin: string, id: string) => {
  const { rates } = expatRates(origin, TOTAL);
  return rates.find((r) => r.id === id) ?? rates[0];
};

/** the rates the picture turns through. One thing changes at a time: where
 *  it ships from, then the service, ending on the card Check Rate leads
 *  with from the UK */
const RATES = [
  { origin: "AU", rate: rateOf("AU", "ups-expedited") },
  { origin: "GB", rate: rateOf("GB", "ups-expedited") },
  { origin: "GB", rate: rateOf("GB", "special") },
];

/**
 * The rate, as Check Rate shows one: the flow's own card, shown and not
 * used, on the app's neutrals (.tone-none), with its price as a filler line
 * as long as the rate is high (`figures={false}`), since this page names no
 * price. The first card stands from the moment the picture's card comes up;
 * at the picture's turn the origin changes, then the service, and the line
 * changes length each time, which is the step's whole point. Then the
 * weight from step 2 meets it.
 */
export function RateScene({ start, arrive }: Turn) {
  const { k, kg } = useScene();
  return (
    <div className={CARD} style={at(arrive)}>
      <div className="grid [&>*]:[grid-area:1/1]">
        {RATES.map(({ origin, rate }, i) => {
          const turn = (n: number) => (n === 0 ? arrive : start + 50 + n * 700);
          const last = i === RATES.length - 1;
          return (
            <div
              key={`${origin}-${rate.id}`}
              inert
              // on a row-sized picture the card is drawn a step smaller, to
              // the scale of the three pictures beside it
              className={cn("tone-none bg-background @max-[17rem]:[zoom:0.82]", last ? "jr jr-swap" : "jr-pass")}
              style={last ? at(turn(i)) : pass(turn(i), turn(i + 1) + SWAP_MS - turn(i))}
            >
              <RateCard rate={rate} origin={origin} display stacked plain figures={false} />
            </div>
          );
        })}
      </div>
      <p
        className="jr jr-rise mt-[0.8em] flex flex-wrap items-baseline gap-x-[0.4em] border-t border-border pt-[0.6em]"
        style={at(start + 1900)}
        data-scene-end=""
      >
        <span className="font-display text-[1.15em] font-semibold tabular-nums tracking-tight">{kg(TOTAL)}</span>
        <span className="text-[0.85em] text-muted">{k("rate")}</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  4: plus a handling surcharge, if a piece needs one                 */
/* ------------------------------------------------------------------ */

/** what a piece has to meet to go without one, in the step's own order */
const TESTS = [
  { key: "maxWeight", met: (p: Piece) => p.kg <= 25 },
  { key: "maxSide", met: (p: Piece) => Math.max(...p.dims) <= 120 },
  { key: "cardboard", met: (p: Piece) => p.cardboard },
] as const;

const GRID = "grid grid-cols-[minmax(0,1fr)_4.6em_4.6em] items-center";

/** a test's answer for a piece, drawn as it's checked: a quiet tick where
 *  it's met, a cross in the chapter's ink where it isn't, since that one
 *  is the news */
function Mark({ met, ms }: { met: boolean; ms: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("mx-auto size-[1.05em]", met ? "text-muted-2" : "text-tone-ink")}
      fill="none"
      stroke="currentColor"
      strokeWidth={met ? 2.5 : 3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path className="jr jr-check" pathLength={24} d={met ? "M4 12.5l5 5L20 6.5" : "M6 6l12 12M18 6L6 18"} style={at(ms)} />
    </svg>
  );
}

/**
 * The same two pieces against the three things that bring a surcharge, a
 * piece at a time, so it reads as it's charged: per piece. The box meets
 * all three; the suitcase meets the first two and isn't a cardboard box,
 * which is the one answer the picture is for.
 */
export function SurchargeScene({ start, arrive }: Turn) {
  const { k } = useScene();
  /** when a piece's column is gone through */
  const column = (j: number) => start + 300 + j * 1100;
  return (
    <div className={CARD} style={at(arrive)}>
      <div className={cn(GRID, "gap-y-[0.6em]")}>
        <span />
        {PIECES.map((p) => (
          <span key={p.key} className="text-center text-[0.75em] font-semibold uppercase tracking-[0.04em] text-muted">
            {k(p.key)}
          </span>
        ))}
        {TESTS.map((test, i) => (
          <React.Fragment key={test.key}>
            <span className="text-[0.8em]">{k(test.key)}</span>
            {PIECES.map((p, j) => (
              <Mark key={p.key} met={test.met(p)} ms={column(j) + i * 200} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className={cn(GRID, "mt-[0.7em] border-t border-border pt-[0.6em]")}>
        <span className="text-[0.8em] font-medium">{k("surcharge")}</span>
        {PIECES.map((p, j) => {
          const due = TESTS.some((test) => !test.met(p));
          return (
            <span
              key={p.key}
              className={cn("jr jr-rise text-center text-[0.8em]", due ? "font-semibold text-tone-ink" : "text-muted-2")}
              style={at(column(j) + 700)}
              data-scene-end={j === PIECES.length - 1 ? "" : undefined}
            >
              {k(due ? "yes" : "no")}
            </span>
          );
        })}
      </div>
    </div>
  );
}
