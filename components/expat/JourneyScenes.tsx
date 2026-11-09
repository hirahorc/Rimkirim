"use client";

import * as React from "react";
import { Check, Info, Plane, ShieldCheck, Truck } from "lucide-react";
import { RateCard } from "@/components/expat-order/RateCard";
import { expatRates } from "@/lib/pricing/expat-rates";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { at, Bar, Bubble, ChatHead, SceneFlag, SceneTitle } from "./SceneParts";

/**
 * The four illustrations of the expat "How it works", one per step, built
 * from the site's own pieces (fields, chips, the departure board's tiles,
 * flat flags, and the order flow's own rate card) so each reads as the
 * moment itself: Check Rate and its estimate, the packing list reviewed and
 * the quotation, the flight, the doorstep.
 *
 * Framed as product shots, not screenshots in a box (the stageshow rules):
 * each scene has one hero surface, inset a gutter from the top and sides of
 * the stage and running off its bottom, so only filler is cropped, and at
 * most one small satellite. Every size is in em, a share of the stage's
 * width (JourneySteps), so a scene scales as one piece; below 30rem the
 * stage is square and the scenes take their compact layout (`@max-[30rem]:`),
 * a gutter of 1.6em instead of 3.2em, so the type never drops under 10px.
 *
 * A piece that moves carries a `jr-*` class naming its entrance and `at(ms)`,
 * when it starts once its scene comes up (globals.css, "The journey").
 */

function useScene() {
  const t = useT();
  return (key: string) => t(`expat.steps.scene.${key}`);
}

/** the hero surface: a gutter from the sides, clear of the stage's play
 *  control at the top, and off the bottom */
const HERO =
  "jr jr-arrive absolute inset-x-[3.2em] top-[4em] h-[30em] rounded-[1.1em] bg-background p-[1.4em] shadow-float @max-[30rem]:inset-x-[1.6em] @max-[30rem]:p-[1.15em]";

/** a labelled field of the Check Rate form; without a label it is filler */
function Field({ label, ms, children }: { label?: string; ms: number; children?: React.ReactNode }) {
  return (
    <div className="jr jr-rise" style={at(ms)}>
      {label ? (
        <span className="block text-[0.72em] font-medium leading-none text-muted">{label}</span>
      ) : (
        <Bar w="3.6em" className="my-[0.13em]" />
      )}
      <div className="mt-[0.45em] flex h-[2.3em] items-center gap-[0.4em] rounded-[0.6em] bg-surface-2 px-[0.7em]">
        {children ?? <Bar w="7em" />}
      </div>
    </div>
  );
}

/** the Check Rate picture's rate: the UK to Jakarta, 30 kg, priced by the
 *  flow's own rates, so the card is the one the visitor will see */
const PICTURE_RATE = expatRates("GB", 30).rates[0];

/**
 * 01: Check Rate filling itself in, as the real form sets it: From beside To,
 * each country's Address under it, then the estimated weight; and once it's
 * full, the estimate rises from the crop below, drawn by the flow's own rate
 * card (shown, not used). How long it all takes stands over the form, a chip
 * centred on its top edge, half outside: its ring runs while the form fills,
 * and once full it turns into a check.
 */
export function DetailsScene() {
  const k = useScene();
  return (
    <>
      <div className="absolute inset-x-[3.2em] top-[4em] flex flex-col gap-[0.65em] @max-[30rem]:inset-x-[1.6em]">
        {/* no title of its own: the step it pictures is named beside it, and
            the room goes to the estimate below */}
        <div className="jr jr-arrive rounded-[1.1em] bg-background px-[1.4em] pb-[1.2em] pt-[1.5em] shadow-float @max-[30rem]:p-[1.15em]" style={at(0)}>
          <div className="grid grid-cols-2 gap-[0.75em] @max-[30rem]:gap-x-[0.7em]">
            <Field label={k("from")} ms={260}>
              <span className="jr jr-type flex items-center gap-[0.5em] whitespace-nowrap text-[0.9em]" style={at(420)}>
                <SceneFlag code="gb" />
                {k("origin")}
              </span>
            </Field>
            <Field label={k("to")} ms={380}>
              <span className="jr jr-type flex items-center gap-[0.5em] whitespace-nowrap text-[0.9em]" style={at(700)}>
                <SceneFlag code="id" />
                {k("dest")}
              </span>
            </Field>
            <Field label={k("address")} ms={500}>
              <span className="jr jr-type truncate text-[0.82em]" style={at(900)}>
                {k("originAddress")}
              </span>
            </Field>
            <Field label={k("address")} ms={560}>
              <span className="jr jr-type truncate text-[0.82em]" style={at(1100)}>
                {k("destAddress")}
              </span>
            </Field>
            <Field label={k("weight")} ms={620}>
              <span className="jr jr-type text-[0.9em] tabular-nums" style={at(1300)}>
                {k("weightValue")}
              </span>
            </Field>
          </div>
        </div>
        {/* the estimate, once the form is full: the flow's own lead card,
            running off the crop on any stage */}
        <div
          inert
          aria-hidden
          className="tone-none jr jr-lift min-h-[26em] rounded-[1.1em] bg-background p-[1.25em] shadow-float @max-[30rem]:p-[1.15em]"
          style={at(1650)}
        >
          <RateCard rate={PICTURE_RATE} origin="GB" display stacked plain />
        </div>
      </div>
      {/* the time it takes, over the form: centred on its top edge, half
          outside */}
      <span className="absolute left-1/2 top-[4em] -translate-x-1/2 -translate-y-1/2">
        <span
          className="jr jr-drop flex items-center gap-[0.5em] whitespace-nowrap rounded-full bg-background py-[0.45em] pl-[0.5em] pr-[0.9em] text-[0.86em] font-semibold shadow-overlay"
          style={at(150)}
        >
          <svg viewBox="0 0 20 20" className="size-[1.45em] shrink-0 overflow-visible" aria-hidden>
            <g transform="rotate(-90 10 10)">
              <circle cx="10" cy="10" r="8" fill="none" stroke="var(--border-strong)" strokeWidth="2.4" />
              <circle
                className="jr jr-ring"
                style={at(350)}
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="var(--tone-ink)"
                strokeWidth="2.4"
                strokeLinecap="round"
                pathLength={100}
              />
            </g>
            {/* full: the ring closes into a filled disc, and the check is
                drawn on it */}
            <circle
              className="jr jr-press origin-center [transform-box:fill-box]"
              style={at(1450)}
              cx="10"
              cy="10"
              r="9.2"
              fill="var(--tone-ink)"
            />
            <path
              className="jr jr-check"
              style={at(1560)}
              d="M5.8 10.3l2.8 2.8 5.6-6.2"
              fill="none"
              stroke="#fff"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={24}
            />
          </svg>
          {k("time")}
        </span>
      </span>
    </>
  );
}

/** how the review marks a line of the packing list: fine to send, likely to
 *  be taxed (so the customer may take it out), or one to take out */
const LIST = [
  { key: "doc1", tag: null },
  { key: "doc2", tag: "taxed" },
  { key: "doc3", tag: "takeOut" },
] as const;

/**
 * 02: two cards at one width, the review over the quotation it leads to
 * (stacked cards), in the order the team works: the packing list is checked
 * line by line, a phone marked likely to be taxed and the wine to take out,
 * then the quotation rises from the crop below and builds to its total, an
 * estimate whose final price comes on the invoice.
 */
export function QuoteScene() {
  const k = useScene();
  const lines = [
    { key: "air", w: "4.2em" },
    { key: "clearance", w: "3.4em" },
    { key: "delivery", w: "2.8em" },
  ];
  return (
    <div className="absolute inset-x-[3.2em] top-[4em] flex flex-col gap-[0.65em] @max-[30rem]:inset-x-[1.6em]">
      <div className="jr jr-arrive rounded-[1.1em] bg-background p-[1.2em] shadow-float @max-[30rem]:p-[1.15em]" style={at(0)}>
        <span className="block text-[0.82em] font-semibold">{k("docs")}</span>
        <ul className="mt-[0.75em] space-y-[0.6em]">
          {LIST.map(({ key, tag }, i) => (
            <li key={key} className="flex items-center gap-[0.6em]">
              <span
                className="jr jr-fill grid size-[1.2em] shrink-0 place-items-center rounded-[0.3em] bg-tone-ink text-background shadow-[inset_0_0_0_1.5px_var(--tone-ink)]"
                style={at(300 + i * 260)}
              >
                <svg viewBox="0 0 16 16" className="size-[0.85em]" aria-hidden>
                  <path
                    className="jr jr-check"
                    style={at(350 + i * 260)}
                    d="M3.5 8.5l3 3 6-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={24}
                  />
                </svg>
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.84em]">{k(key)}</span>
              {tag && (
                <span
                  className={cn(
                    "jr jr-drop shrink-0 whitespace-nowrap rounded-full px-[0.6em] py-[0.2em] text-[0.7em] font-semibold",
                    tag === "taxed" ? "bg-(--tone-wash) text-tone-ink" : "bg-foreground text-background",
                  )}
                  style={at(500 + i * 260)}
                >
                  {k(tag)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* 12px under the review, the same width, once the review is done;
          tall enough to run off the crop on any stage, a phone's portrait
          one too */}
      <div
        className="jr jr-lift min-h-[26em] rounded-[1.1em] bg-background p-[1.25em] shadow-float @max-[30rem]:p-[1.15em]"
        style={at(1250)}
      >
        <div className="flex items-center justify-between gap-[1em]">
          <SceneTitle>{k("quote")}</SceneTitle>
          <Bar w="3.2em" />
        </div>
        <ul className="mt-[0.85em] space-y-[0.55em]">
          {lines.map((l, i) => (
            <li key={l.key} className="jr jr-rise flex items-center justify-between gap-[1em]" style={at(1450 + i * 110)}>
              <span className="truncate text-[0.82em] text-muted">{k(l.key)}</span>
              <Bar w={l.w} />
            </li>
          ))}
        </ul>
        <div className="mt-[0.85em] flex items-center justify-between gap-[1em] border-t border-border pt-[0.75em]">
          <span className="text-[0.88em] font-semibold">{k("total")}</span>
          <span className="jr jr-grow h-[0.75em] w-[5.6em] origin-right rounded-full bg-tone-ink" style={at(1900)} />
        </div>
        <p
          className="jr jr-rise mt-[0.6em] flex items-center gap-[0.35em] text-[0.74em] font-medium text-tone-ink"
          style={at(2100)}
        >
          <Info className="size-[1.1em] shrink-0" strokeWidth={2.25} />
          {k("confirmed")}
        </p>
      </div>
    </div>
  );
}

/** the departure board's split-flap tiles, sized for a scene */
function SceneTiles({ code, start }: { code: string; start: number }) {
  return (
    <span className="flex shrink-0 gap-[0.12em]">
      {code.split("").map((ch, i) => (
        <span
          key={i}
          className="jr jr-flip board-tile relative grid h-[1.9em] w-[1.4em] place-items-center rounded-[0.25em] bg-foreground font-mono text-[0.95em] font-medium leading-none text-background"
          style={at(start + i * 60)}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * 03: the shipment as its tracking card: GBR to IDN on the departure
 * board's tiles with the plane flying the route as the hero's board flies
 * it (RouteBoard): a straight dashed line drawn left to right, the plane
 * level at its tip, landing flush with the route's end. Under it the legs,
 * each arriving as the plane passes it, on a rail like the steps' own.
 */
export function FlightScene() {
  const k = useScene();
  const legs = [
    { key: "pickedUp", Icon: Truck, ms: 250 },
    { key: "flying", Icon: Plane, ms: 750 },
    { key: "cleared", Icon: ShieldCheck, ms: 1450 },
  ];
  return (
    <div className={HERO} style={at(0)}>
      <div className="flex items-center gap-[1em]">
        <SceneTiles code="GBR" start={150} />
        {/* the route spans the gap between the two boards, on the tiles'
            centre line: the dashed line draws left to right while the plane
            rides its tip (globals.css, .jr-fly) */}
        <span className="relative h-[1.3em] min-w-0 flex-1">
          <span
            className="jr jr-draw absolute inset-x-0 top-1/2 border-t border-dashed border-muted-2"
            style={at(450)}
          />
          {/* lucide's plane, as on the hero's board: it points north-east,
              so it turns 45deg to fly east */}
          <span className="jr jr-fly absolute inset-0 flex items-center justify-end" style={at(450)}>
            <Plane className="block size-[1.3em] rotate-45 fill-foreground text-foreground" strokeWidth={1.5} />
          </span>
        </span>
        <SceneTiles code="IDN" start={270} />
      </div>
      <div className="mt-[1.4em] border-t border-border pt-[1.3em]">
        <ol className="relative space-y-[1.2em]">
          {/* the legs' rail, behind their marks, running on past the crop */}
          <span className="absolute -bottom-[10em] left-[0.95em] top-[0.95em] w-px -translate-x-1/2 bg-border-strong" />
          {legs.map(({ key, Icon, ms }, i) => (
            <li key={key} className="jr jr-rise relative flex items-center gap-[0.75em]" style={at(ms)}>
              <span
                className={cn(
                  "grid size-[1.9em] shrink-0 place-items-center rounded-full",
                  i === legs.length - 1 ? "bg-tone-ink text-background" : "bg-(--tone-wash) text-tone-ink",
                )}
              >
                <Icon className="size-[0.95em]" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.88em] font-medium leading-tight">{k(key)}</span>
                <Bar w={["4.6em", "5.4em", "4em"][i]} className="mt-[0.4em]" />
              </span>
            </li>
          ))}
          {["7.5em", "6em", "6.8em"].map((w, i) => (
            <li key={w} className="jr jr-rise relative flex items-center gap-[0.75em]" style={at(1650 + i * 90)}>
              <span className="grid size-[1.9em] shrink-0 place-items-center rounded-full bg-background shadow-[inset_0_0_0_1.5px_var(--border-strong)]" />
              <Bar w={w} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** brushed metal, lit from above (the letter plate, the handle, the hinges) */
function Metal({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f6f2f7" />
      <stop offset="0.5" stopColor="#dbd3dc" />
      <stop offset="1" stopColor="#b3a9b4" />
    </linearGradient>
  );
}

/**
 * The front door, drawn in the reference's own pixels (the viewBox is that
 * space, so its proportions are kept and nothing stretches): a white casing
 * with rounded head corners, a step and a rebate inside it and a shadow
 * under its head, the slab in the chapter's ink darkening toward the floor,
 * two tall panels above and two short below, each sunk behind a groove and
 * a bevel, a brushed letter plate between them, a lever handle on its
 * backplate with the keyhole under it, two hinges, the house number on a
 * plaque over the head, and the sill it stands on.
 */
function FrontDoor({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const metal = `url(#${id}-metal)`;
  const panels = [
    [266, 269, 144, 399],
    [456, 269, 144, 399],
    [266, 770, 144, 220],
    [456, 770, 144, 220],
  ];
  return (
    <svg viewBox="160 158 542 932" className={className} aria-hidden>
      <defs>
        <Metal id={`${id}-metal`} />
        <linearGradient id={`${id}-fall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {/* the casing: white, its head's corners rounded, a step and the
          rebate inside it, a hairline at its outer edge */}
      <path d="M160 1080V194a28 28 0 0 1 28-28h486a28 28 0 0 1 28 28v886Z" fill="#fdfcfd" />
      <path d="M160 1080V194a28 28 0 0 1 28-28h486a28 28 0 0 1 28 28v886" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="2" />
      <path d="M186 1080V206a14 14 0 0 1 14-14h462a14 14 0 0 1 14 14v874Z" fill="#faf6fa" />
      <path d="M186 1080V206a14 14 0 0 1 14-14h462a14 14 0 0 1 14 14v874" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="1.5" />
      <rect x="208" y="214" width="449" height="866" fill="#e4d2e4" />
      {/* the slab, the chapter's ink, a little darker toward the floor */}
      <rect x="220" y="230" width="425" height="830" className="fill-tone-ink" />
      <rect x="220" y="230" width="425" height="830" fill={`url(#${id}-fall)`} />
      {/* the shadow the casing's head throws on the slab's top */}
      <rect x="220" y="230" width="425" height="7" fill="#2c0f29" opacity="0.7" />
      {panels.map(([x, y, w, h]) => {
        const g = 3;
        const b = 13;
        const fx = x + g + b;
        const fy = y + g + b;
        const fw = w - 2 * (g + b);
        const fh = h - 2 * (g + b);
        return (
          <g key={`${x}-${y}`}>
            {/* the groove round the panel */}
            <rect x={x} y={y} width={w} height={h} rx="2" fill="#000" opacity="0.28" />
            {/* the moulding inside it, a shade under the slab, sunk at its
                top and left edge and lit at its bottom and right */}
            <rect x={x + g} y={y + g} width={w - 2 * g} height={h - 2 * g} className="fill-tone-ink" />
            <rect x={x + g} y={y + g} width={w - 2 * g} height={h - 2 * g} fill="#000" opacity="0.07" />
            <path d={`M${x + g} ${y + h - g}V${y + g}H${x + w - g}`} fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="3" />
            <path d={`M${x + g} ${y + h - g}H${x + w - g}V${y + g}`} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" />
            {/* the raised field, a touch lighter, its top and left edge
                catching the light, its bottom and right in shade */}
            <rect x={fx} y={fy} width={fw} height={fh} className="fill-tone-ink" />
            <rect x={fx} y={fy} width={fw} height={fh} fill="#fff" opacity="0.04" />
            <path d={`M${fx} ${fy + fh}V${fy}H${fx + fw}`} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" />
            <path d={`M${fx} ${fy + fh}H${fx + fw}V${fy}`} fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="2" />
          </g>
        );
      })}
      {/* hinges on the hanging edge */}
      {[300, 918].map((y) => (
        <rect key={y} x="211" y={y} width="15" height="60" rx="3" fill={metal} />
      ))}
      {/* the letter plate, its slot a shade in the frame */}
      <rect x="353" y="704" width="157" height="45" rx="6" fill="#2c0f29" opacity="0.28" />
      <rect x="353" y="700" width="157" height="45" rx="6" fill={metal} />
      <rect x="368" y="711" width="127" height="23" rx="3" fill="#e8dfe8" />
      <rect x="368" y="711" width="127" height="5" rx="2" fill="#000" opacity="0.14" />
      {/* the handle: its backplate, the lever on its rose, the keyhole */}
      <rect x="601" y="647" width="31" height="119" rx="15.5" fill="#2c0f29" opacity="0.28" />
      <rect x="603" y="643" width="31" height="119" rx="15.5" fill={metal} />
      <rect x="548" y="676" width="77" height="16" rx="8" fill="#2c0f29" opacity="0.28" />
      <rect x="548" y="672" width="77" height="16" rx="8" fill={metal} />
      <circle cx="618.5" cy="680" r="12" fill={metal} stroke="#fff" strokeOpacity="0.5" />
      <circle cx="618.5" cy="726" r="8.5" fill="#ece6ed" stroke="#9f95a0" strokeWidth="1.2" />
      <circle cx="618.5" cy="723.5" r="2.8" fill="#3a3340" />
      <rect x="617.2" y="723.5" width="2.6" height="7" rx="1" fill="#3a3340" />
      {/* the sill it stands on */}
      <rect x="182" y="1060" width="498" height="28" rx="3" fill="#a3949f" />
      <rect x="182" y="1060" width="498" height="9" rx="3" fill="#c6b9c3" />
      {/* the house number on its plaque, over the casing's head */}
      <rect x="382" y="163" width="96" height="48" rx="11" fill="#2c0f29" opacity="0.1" />
      <rect x="382" y="160" width="96" height="48" rx="11" fill="#fdf8fd" />
      <text x="430" y="199" textAnchor="middle" className="fill-tone-ink font-display" fontSize="40" fontWeight="700">
        12
      </text>
    </svg>
  );
}

/* The two parcels on the doorstep, drawn in the reference's own pixels so
   the small one truly sits on the big one's lid: kraft board in one oblique
   view (the lid a strip, the side a band), each face its own tone, the same
   tape over the lid and down the front of both, each AWB lying on its lid.
   Each box is its own picture over the same space, so each lands on its own
   beat (jr-land) and still meets the other exactly. */
const KRAFT = { lid: "#f8cf8b", edge: "#ffe4ab", tape: "#cd8531", tapeLid: "#e29d43" };
/** the tape is the same tape on every box: one width across the lid, one
 *  length down the front, whatever the box's size */
const TAPE = { w: 28, drop: 40 };
const PARCELS_VIEW = "704 826 310 286";
/** one box: front face from (x, y) w × h, its depth (dx, dy) carried up and
 *  to the right; the tape crosses the lid with its middle at `tapeAt` of the
 *  width, and the AWB lies on the lid at `awb` (u across the width, f and fd
 *  as shares of the lid's depth, front to back) */
function Box({
  id,
  x,
  y,
  w,
  h,
  dx,
  dy,
  tapeAt,
  awb,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  tapeAt: number;
  awb: { u: number; w: number; f: number; fd: number };
}) {
  /** a point on the lid: u across from its left edge, f of the way back */
  const lid = (u: number, f: number) => `${x + u + f * dx} ${y + f * dy}`;
  /** a flat rectangle lying on the lid, as a path */
  const flat = (u: number, uw: number, f: number, fd: number) =>
    `M${lid(u, f)}L${lid(u + uw, f)}L${lid(u + uw, f + fd)}L${lid(u, f + fd)}Z`;
  const t = w * tapeAt - TAPE.w / 2;
  const { u, f, fd } = awb;
  const aw = awb.w;
  return (
    <>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9ab65" />
          <stop offset="1" stopColor="#d8964e" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c58242" />
          <stop offset="1" stopColor="#ad6b32" />
        </linearGradient>
      </defs>
      <path d={`M${x} ${y}L${x + dx} ${y + dy}H${x + w + dx}L${x + w} ${y}Z`} fill={KRAFT.lid} />
      <path d={`M${x + w} ${y}L${x + w + dx} ${y + dy}V${y + h + dy}L${x + w} ${y + h}Z`} fill={`url(#${id}-side)`} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-front)`} />
      {/* the lid's front edge, catching the light */}
      <path d={`M${x} ${y}H${x + w}L${x + w + dx} ${y + dy}`} fill="none" stroke={KRAFT.edge} strokeWidth="2" />
      {/* tape over the lid, front to back, then down the front */}
      <path d={flat(t, TAPE.w, 0, 1)} fill={KRAFT.tapeLid} />
      <rect x={x + t} y={y} width={TAPE.w} height={TAPE.drop} fill={KRAFT.tape} />
      {/* the AWB on the lid: its route bar at the back, the barcode's bars
          running front to back, as they would on a label lying flat */}
      <path d={flat(u, aw, f, fd)} fill="#fbf8fb" />
      <path d={flat(u + aw * 0.1, aw * 0.8, f + fd * 0.7, fd * 0.16)} fill="#b44db8" />
      {[0, 0.1, 0.18, 0.3, 0.39, 0.5, 0.6, 0.68].map((b) => (
        <path key={b} d={flat(u + aw * (0.1 + b), aw * 0.05, f + fd * 0.12, fd * 0.48)} fill="#4a4450" />
      ))}
    </>
  );
}

function ParcelStack({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className={cn("absolute", className)} aria-hidden>
      {/* the big box, forward on the floor: its whole footprint, back edge
          included, lies in the floor's band, in front of the wall's line, so
          nothing of it or its shadow climbs the wall. Its shadows: a tight
          one where it meets the floor, the footprint softened round it, and
          a cast to the right, the light being high on the left */}
      <span className="jr jr-land absolute inset-0 block" style={at(1500)}>
        <svg viewBox={PARCELS_VIEW} className="block size-full overflow-visible">
          <defs>
            <filter id={`${id}-soft`} filterUnits="userSpaceOnUse" x="680" y="800" width="380" height="340">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id={`${id}-wide`} filterUnits="userSpaceOnUse" x="680" y="800" width="380" height="340">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id={`${id}-tight`} filterUnits="userSpaceOnUse" x="680" y="800" width="380" height="340">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          <path d="M920 1104L984 1057H1018L958 1110Z" fill="#6b2b63" opacity="0.26" filter={`url(#${id}-wide)`} />
          <path d="M708 1110L772 1062H994L930 1110Z" fill="#6b2b63" opacity="0.3" filter={`url(#${id}-wide)`} />
          <path d="M712 1106L776 1059H989L925 1106Z" fill="#5b2350" opacity="0.5" filter={`url(#${id}-tight)`} />
          <Box
            id={`${id}-big`}
            x={716}
            y={968}
            w={206}
            h={134}
            dx={62}
            dy={-45}
            tapeAt={0.5}
            awb={{ u: 168, w: 35, f: 0.15, fd: 0.65 }}
          />
        </svg>
      </span>
      {/* the small box, set back on the big one's lid; its shadow falls on
          the lid alone (clipped to it, so none spills down the front) */}
      <span className="jr jr-land absolute inset-0 block" style={at(1700)}>
        <svg viewBox={PARCELS_VIEW} className="block size-full overflow-visible">
          <defs>
            <clipPath id={`${id}-lid`}>
              <path d="M716 968L778 923H984L922 968Z" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id}-lid)`}>
            <path d="M893 960L939 927H954L909 960Z" fill="#7a4512" opacity="0.26" filter={`url(#${id}-soft)`} />
            <path d="M749 961L795 927H941L895 961Z" fill="#7a4512" opacity="0.42" filter={`url(#${id}-soft)`} />
          </g>
          <Box
            id={`${id}-top`}
            x={751.2}
            y={859.9}
            w={142}
            h={100}
            dx={46}
            dy={-33}
            tapeAt={0.47}
            awb={{ u: 80, w: 48, f: 0.25, fd: 0.62 }}
          />
        </svg>
      </span>
    </div>
  );
}

/**
 * 04: the doorstep. The delivery time agreed on WhatsApp (the chat is the
 * product surface, off the bottom of the stage), then two parcels landing
 * by the front door, and the delivered receipt.
 */
export function DoorScene() {
  const k = useScene();
  return (
    <>
      {/* the porch: a floor running the stage's width, the door standing on
          it on its sill, nearly the stage's height, the parcels stacked by
          its foot, the small one resting on the big one's lid (on a phone,
          under the chat, the door is smaller and the two stand centred) */}
      <span
        className="jr jr-rise absolute inset-x-0 bottom-0 h-[2.2em] bg-surface-3 shadow-[inset_0_0.12em_0_rgb(255_255_255/0.75)]"
        style={at(0)}
      />
      <div
        className="jr jr-rise absolute bottom-[1.93em] left-[3.6em] h-[21em] w-[12.21em] @max-[30rem]:bottom-[2.04em] @max-[30rem]:left-[7.05em] @max-[30rem]:h-[12.5em] @max-[30rem]:w-[7.27em]"
        style={at(60)}
      >
        <FrontDoor className="absolute inset-0 size-full" />
      </div>
      {/* the parcels, a step right of the casing and forward on the floor:
          the big one's front edge low in the floor's band and its back edge
          just in front of the wall's line, so it stands on the floor */}
      <ParcelStack className="bottom-[0.75em] left-[15.86em] h-[6.44em] w-[6.98em] @max-[30rem]:bottom-[1.34em] @max-[30rem]:left-[14.35em] @max-[30rem]:h-[3.84em] @max-[30rem]:w-[4.16em]" />
      {/* the chat, as the product shows it: a header and a short thread, the
          card as tall as what it holds; on a phone it sits over the porch */}
      <div
        className="jr jr-arrive absolute right-[3.2em] top-[4em] w-[14.6em] rounded-[1.1em] bg-background pb-[0.3em] shadow-float @max-[30rem]:inset-x-[1.6em] @max-[30rem]:w-auto"
        style={at(0)}
      >
        <ChatHead />
        <div className="flex flex-col gap-[0.5em] px-[0.8em] py-[0.9em]">
          <Bubble from="them" ms={400}>
            {k("msgIn")}
          </Bubble>
          <Bubble from="me" ms={1000}>
            {k("msgOut")}
          </Bubble>
          <p
            className="jr jr-drop mt-[0.2em] flex w-fit items-center gap-[0.4em] self-center rounded-full bg-tone-ink px-[0.75em] py-[0.3em] text-[0.72em] font-semibold text-background"
            style={at(2000)}
          >
            <Check className="size-[1.1em]" strokeWidth={2.5} />
            {k("delivered")}
            <span className="font-mono font-normal">11:24</span>
          </p>
        </div>
      </div>
    </>
  );
}
