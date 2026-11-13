"use client";

import * as React from "react";
import { RateCard } from "@/components/expat-order/RateCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { expatRates } from "@/lib/pricing/expat-rates";
import { formatNumber } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { at, Bar } from "./SceneParts";

/**
 * The pricing section's four pictures, one a step, working the section's
 * sum on one shipment of three pieces. Each is a short motion graphic and
 * not a still, because a picture this small holds one thing at a time: what
 * moves through it in turn (a weight found, then rounded up; one rate, then
 * another) is what a still would have needed four times the room for. They
 * play as a relay where they sit in a row, each taking its turn (`start`) as
 * the one before lands the figure it hands over, on cards that came up
 * together (`arrive`) and wait; stacked, each plays as it comes into view,
 * with both at 0. What a picture ends on is a whole picture of its own, and
 * it is all a reader without motion or script sees: the pieces that only
 * pass (`.jr-pass`) stand hidden there. QuoteFactors runs the relay;
 * DESIGN.md, Motion, "The section scenes".
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

/** a handling surcharge a piece brings, as the Surcharge Information's
 *  FedEx table has it; `size` is its amount as a filler line's length,
 *  since this page names no amount (Oversize is twice the others) */
const CHARGES = {
  bag: { size: 2.5 },
  overweight: { size: 2.5 },
  oversize: { size: 5 },
} as const;
type Charge = keyof typeof CHARGES;

/**
 * The shipment: a box light for its size (its size counts), the suitcase
 * from the ops sheet that set the rounding rule (its weight counts, 20.97
 * kg, so 21), and a heavy box of books, over 25 kg and over 50 kg, so two
 * surcharges and only the higher one charged. `charges` is what each one
 * brings, in the order it's found.
 */
const PIECES = [
  { key: "box1", kg: 8.4, dims: [50, 40, 38], charges: [] as Charge[] },
  { key: "suitcase", kg: 20.97, dims: [64.5, 47.5, 27], charges: ["bag"] as Charge[] },
  { key: "box2", kg: 51.6, dims: [60, 50, 45], charges: ["overweight", "oversize"] as Charge[] },
] as const;
type Piece = (typeof PIECES)[number];
/** the piece step 1 works through */
const MEASURED = PIECES[0];

/** length × width × height ÷ 5000, as the calculator works it */
const volumetric = (p: Piece) => (p.dims[0] * p.dims[1] * p.dims[2]) / 5000;
/** the higher of the two, as it comes off the sheet */
const higher = (p: Piece) => Math.max(p.kg, volumetric(p));
/** rounded up to the next whole kilo, a piece at a time, before the pieces
 *  are added (the ops sheet's ROUNDUP(MAX(actual, volumetric), 0)) */
const chargeable = (p: Piece) => Math.ceil(higher(p));
const TOTAL = PIECES.reduce((sum, p) => sum + chargeable(p), 0);

const CARD =
  "jr jr-arrive absolute inset-x-[1em] top-[1em] h-[30em] rounded-[1em] bg-background p-[1em] shadow-float";
const LABEL = "block text-[0.75em] font-semibold uppercase tracking-[0.06em] text-muted";

/** a piece that holds the stage for `len` ms from `ms`, then gives it up */
const pass = (ms: number, len: number) => ({ "--d": `${ms}ms`, "--len": `${len}ms` }) as React.CSSProperties;

function useScene() {
  const { t, locale } = useLanguage();
  return {
    k: (key: string) => t(`expat.scenes.pricing.${key}`),
    /** a weight as the sheet gives it, to two places at most */
    kg: (n: number) => `${formatNumber(n, 2, locale)} kg`,
    num: (n: number) => formatNumber(n, 2, locale),
  };
}

/* ------------------------------------------------------------------ */
/*  1: one piece's chargeable weight                                   */
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

/**
 * The one piece measured, worked through on its sheet: what it weighs and
 * measures, typed in; its sides multiplied, over 5000; the two weights side
 * by side, the higher marked. Then the foot takes the higher one, 15.2 kg,
 * and rounds it up to the next kilo, 16 kg, which is what step 2 starts
 * from. A box light for its size, so its size is what counts, the case that
 * surprises; and 15.2 going to 16, not 15, says it's always up.
 */
export function ChargeableScene({ start, arrive }: Turn) {
  const { k, kg } = useScene();
  const p = MEASURED;
  const vol = volumetric(p);
  const from = start + 200;
  /** the higher weight comes down into the foot, then is rounded up */
  const found = from + 1300;
  const round = from + 1900;
  return (
    <div className={CARD} style={at(arrive)}>
      <span className={LABEL}>{k(p.key)}</span>
      <div className="mt-[0.45em] grid grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] gap-[0.4em]">
        {[kg(p.kg), `${p.dims.join(" × ")} cm`].map((v, j) => (
          <span key={v} className="flex h-[2.1em] items-center rounded-[0.5em] bg-surface-2 px-[0.6em]">
            <span className="jr jr-type whitespace-nowrap text-[0.8em] tabular-nums" style={at(from + 150 + j * 150)}>
              {v}
            </span>
          </span>
        ))}
      </div>
      <p className="jr jr-rise mt-[0.55em] whitespace-nowrap text-[0.78em] tabular-nums text-muted" style={at(from + 550)}>
        {p.dims.join(" × ")} ÷ 5000 = <span className="font-medium text-foreground">{kg(vol)}</span>
      </p>
      <div className="mt-[0.5em] grid grid-cols-2 gap-[0.4em]">
        <Weight label={k("actual")} value={kg(p.kg)} wins={vol <= p.kg} ms={from + 700} />
        <Weight label={k("volumetric")} value={kg(vol)} wins={vol > p.kg} ms={from + 700} />
      </div>
      <div className="mt-[0.7em] flex items-end justify-between gap-[1em] border-t border-border pt-[0.55em]">
        <span className="min-w-0">
          <span className="block text-[0.8em] font-medium">{k("chargeable")}</span>
          <span className="jr jr-rise block text-[0.75em] tabular-nums text-muted" style={at(round + 50)} data-scene-end="">
            {k("roundedUp").replace("{kg}", kg(higher(p)))}
          </span>
        </span>
        {/* the higher weight, then the same place rounded up: the one
            fades as the other comes in, on the same line */}
        <span className="grid justify-items-end font-display text-[1.5em] font-semibold tabular-nums tracking-tight [&>*]:[grid-area:1/1]">
          <span className="jr-pass whitespace-nowrap" style={pass(found, round - found)}>
            {kg(higher(p))}
          </span>
          <span className="jr jr-swap whitespace-nowrap" style={at(round)}>
            {kg(chargeable(p))}
          </span>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2: the pieces added up                                             */
/* ------------------------------------------------------------------ */

/** the three pieces, each with the weight off its sheet and that weight
 *  rounded up, coming down a row at a time (the first is step 1's answer),
 *  then a line is drawn under them and the total lands: the section's one
 *  big number, a sum of whole kilos */
export function SumScene({ start, arrive }: Turn) {
  const { k, kg, num } = useScene();
  return (
    <div className={CARD} style={at(arrive)}>
      <ul className="grid gap-[0.4em]">
        {PIECES.map((p, i) => (
          <li
            key={p.key}
            className="flex items-baseline justify-between gap-[1em] rounded-[0.5em] bg-surface-2 px-[0.7em] py-[0.5em] text-[0.85em]"
          >
            <span className="truncate">{k(p.key)}</span>
            <span className="jr jr-drop shrink-0 whitespace-nowrap tabular-nums" style={at(start + 250 + i * 250)}>
              <span className="text-[0.88em] text-muted-2">{num(higher(p))} →</span>{" "}
              <span className="font-medium">{kg(chargeable(p))}</span>
            </span>
          </li>
        ))}
      </ul>
      <span className="jr jr-grow mt-[0.7em] block h-px origin-left bg-border-strong" style={at(start + 1050)} />
      <div className="mt-[0.6em] flex items-baseline justify-between gap-[1em]">
        <span className="text-[0.8em] font-medium">{k("chargeable")}</span>
        <span
          className="jr jr-rise font-display text-[1.5em] font-semibold tabular-nums tracking-tight"
          style={at(start + 1350)}
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
/** how long one takes to come in over another (globals.css, jr-pass-in):
 *  the one under it leaves only once it's covered */
const SWAP_MS = 300;

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

/** one surcharge a piece brings: its name and why, and its amount as a
 *  filler line. `dropped`: the piece brings a higher one too, so this one
 *  is struck through and goes quiet at `ms`, with the higher one left */
function ChargeLine({ charge, ms, dropped }: { charge: Charge; ms: number; dropped?: number }) {
  const { k } = useScene();
  const line = (quiet: boolean) => (
    <span className={cn("flex items-center justify-between gap-[1em]", quiet && "text-muted-2")}>
      <span className="min-w-0 truncate text-[0.78em]">{k(charge)}</span>
      {/* the rate card's own filler price (RateCard, figures={false}) */}
      <Bar
        w={`${CHARGES[charge].size}em`}
        className={cn("h-[0.6em]", quiet ? "bg-foreground/[0.07]" : "bg-foreground/15")}
      />
    </span>
  );
  return (
    <span className="jr jr-rise mt-[0.3em] block" style={at(ms)}>
      {dropped === undefined ? (
        line(false)
      ) : (
        <span className="relative grid [&>*]:[grid-area:1/1]">
          <span className="jr-pass" style={pass(ms, dropped - ms)}>
            {line(false)}
          </span>
          <span className="jr jr-swap" style={at(dropped)}>
            {line(true)}
          </span>
          <span
            className="jr jr-grow h-px self-center origin-left bg-muted-2"
            style={at(dropped)}
            data-scene-end=""
          />
        </span>
      )}
    </span>
  );
}

/**
 * The same three pieces as they'd stand in the quotation, checked a piece
 * at a time, since a surcharge is charged per piece: the box needs none;
 * the suitcase brings one, for being a suitcase; the box of books brings
 * two, over 25 kg and over 50 kg, and the lower is struck through, since
 * only the highest one applies to a piece. Each amount is a filler line as
 * long as it is high, as the rate is in step 3.
 */
export function SurchargeScene({ start, arrive }: Turn) {
  const { k } = useScene();
  /** when a piece is checked */
  const check = [start + 300, start + 900, start + 1500];
  return (
    <div className={CARD} style={at(arrive)}>
      <span className={LABEL}>{k("surchargeHead")}</span>
      <ul className="mt-[0.35em] divide-y divide-border">
        {PIECES.map((p, i) => (
          <li key={p.key} className="py-[0.5em]">
            <span className="flex items-baseline justify-between gap-[1em]">
              <span className="text-[0.85em] font-medium">{k(p.key)}</span>
              {p.charges.length === 0 && (
                <span className="jr jr-rise text-[0.78em] text-muted-2" style={at(check[i])}>
                  {k("none")}
                </span>
              )}
            </span>
            {p.charges.map((c, j) => (
              <ChargeLine
                key={c}
                charge={c}
                ms={check[i] + j * 500}
                // the lower of two goes once the higher has come in
                dropped={p.charges.length > 1 && j === 0 ? check[i] + 1100 : undefined}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
