"use client";

import * as React from "react";
import { Check, Plane, ShieldCheck, Truck } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";
import { at, Bar, Bubble, ChatHead, Parcel, SceneFlag, SceneTitle } from "./SceneParts";

/**
 * The four illustrations of the expat "How it works", one per step, built
 * from the site's own pieces (fields, chips, the departure board's tiles,
 * flat flags) so each reads as the moment itself: the form, the quote and
 * its checklist, the flight, the doorstep.
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

/** a labelled field of the quote form; without a label it is filler */
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

/**
 * 01: the quote form filling itself in, From, To and what is inside, with
 * how long it takes as a chip pinned to the form's corner.
 */
export function DetailsScene() {
  const k = useScene();
  return (
    <>
      <div className={cn(HERO, "left-[6em] @max-[30rem]:left-[4.6em]")} style={at(0)}>
        <div className="flex items-center justify-between gap-[1em]">
          <SceneTitle>{k("formTitle")}</SceneTitle>
          <Bar w="3.2em" />
        </div>
        <div className="mt-[1.3em] grid gap-[0.95em]">
          <Field label={k("from")} ms={260}>
            <span className="jr jr-type flex items-center gap-[0.5em] whitespace-nowrap text-[0.9em]" style={at(420)}>
              <SceneFlag code="gb" />
              {k("origin")}
            </span>
          </Field>
          <Field label={k("to")} ms={380}>
            <span className="jr jr-type flex items-center gap-[0.5em] whitespace-nowrap text-[0.9em]" style={at(820)}>
              <SceneFlag code="id" />
              {k("dest")}
            </span>
          </Field>
          <Field label={k("inside")} ms={500}>
            {[k("boxes"), k("suitcases")].map((c, i) => (
              <span
                key={c}
                className="jr jr-drop whitespace-nowrap rounded-full bg-(--tone-wash) px-[0.6em] py-[0.2em] text-[0.78em] font-medium text-tone-ink"
                style={at(1200 + i * 160)}
              >
                {c}
              </span>
            ))}
          </Field>
          <Field ms={620} />
          <Field ms={700} />
        </div>
      </div>
      {/* the corner chip: centred on the form's top-left corner, half outside */}
      <span
        className="absolute left-[6em] top-[4em] -translate-x-1/2 -translate-y-1/2 @max-[30rem]:left-[4.6em]"
      >
        <span
          className="jr jr-drop flex items-center gap-[0.45em] whitespace-nowrap rounded-full bg-background py-[0.4em] pl-[0.5em] pr-[0.8em] text-[0.8em] font-medium shadow-overlay"
          style={at(1500)}
        >
          <svg viewBox="0 0 20 20" className="size-[1.3em] -rotate-90" aria-hidden>
            <circle cx="10" cy="10" r="7.5" fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
            <circle
              className="jr jr-ring"
              style={at(1600)}
              cx="10"
              cy="10"
              r="7.5"
              fill="none"
              stroke="var(--tone-ink)"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength={100}
            />
          </svg>
          {k("time")}
        </span>
      </span>
    </>
  );
}

/**
 * 02: two cards at one width, the quote over the documents it comes with
 * (stacked cards). The quote builds line by line to its total; the
 * checklist rises from the crop below and ticks off.
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
      <div className="jr jr-arrive rounded-[1.1em] bg-background p-[1.25em] shadow-float @max-[30rem]:p-[1.15em]" style={at(0)}>
        <div className="flex items-center justify-between gap-[1em]">
          <SceneTitle>{k("quote")}</SceneTitle>
          <Bar w="3.2em" />
        </div>
        <ul className="mt-[0.85em] space-y-[0.55em]">
          {lines.map((l, i) => (
            <li key={l.key} className="jr jr-rise flex items-center justify-between gap-[1em]" style={at(220 + i * 110)}>
              <span className="truncate text-[0.82em] text-muted">{k(l.key)}</span>
              <Bar w={l.w} />
            </li>
          ))}
        </ul>
        <div className="mt-[0.85em] flex items-center justify-between gap-[1em] border-t border-border pt-[0.75em]">
          <span className="text-[0.88em] font-semibold">{k("total")}</span>
          <span className="jr jr-grow h-[0.75em] w-[5.6em] origin-right rounded-full bg-tone-ink" style={at(680)} />
        </div>
        <p
          className="jr jr-rise mt-[0.6em] flex items-center gap-[0.35em] text-[0.74em] font-medium text-tone-ink"
          style={at(900)}
        >
          <Check className="size-[1.1em] shrink-0" strokeWidth={2.5} />
          {k("confirmed")}
        </p>
      </div>
      {/* 12px under the quote, the same width; its last row runs off the crop */}
      <div className="jr jr-lift h-[14em] rounded-[1.1em] bg-background p-[1.2em] shadow-float @max-[30rem]:p-[1.15em]" style={at(1050)}>
        <span className="block text-[0.82em] font-semibold">{k("docs")}</span>
        <ul className="mt-[0.75em] space-y-[0.6em]">
          {["doc1", "doc2", "doc3", null].map((d, i) => (
            <li key={d ?? "more"} className="flex items-center gap-[0.6em]">
              <span
                className={cn(
                  "grid size-[1.2em] shrink-0 place-items-center rounded-[0.3em]",
                  d
                    ? "jr jr-fill bg-tone-ink text-background shadow-[inset_0_0_0_1.5px_var(--tone-ink)]"
                    : "shadow-[inset_0_0_0_1.5px_var(--border-strong)]",
                )}
                style={d ? at(1450 + i * 260) : undefined}
              >
                {d && (
                  <svg viewBox="0 0 16 16" className="size-[0.85em]" aria-hidden>
                    <path
                      className="jr jr-check"
                      style={at(1500 + i * 260)}
                      d="M3.5 8.5l3 3 6-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={24}
                    />
                  </svg>
                )}
              </span>
              {d ? <span className="truncate text-[0.84em]">{k(d)}</span> : <Bar w="6em" />}
            </li>
          ))}
        </ul>
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
 * The route's curve, in a 100 x 24 box whose bottom edge is the tiles'
 * centre line: it leaves the origin level with its tiles, climbs steeply,
 * and comes down long and shallow into the destination's, so the plane
 * lands nearly level.
 */
const ARC = { w: 100, h: 24, d: [0, 24, 22, -8, 62, 4, 100, 24] as const };

/**
 * The plane flies the arc on `offset-path`, which only takes pixels: the
 * path is ARC rescaled to its box whenever the box resizes.
 */
function useArcPath() {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const planeRef = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const box = boxRef.current;
    const plane = planeRef.current;
    if (!box || !plane) return;
    const ro = new ResizeObserver(() => {
      const { width: w, height: h } = box.getBoundingClientRect();
      const [x0, y0, x1, y1, x2, y2, x3, y3] = ARC.d.map((n, i) =>
        (i % 2 ? (n / ARC.h) * h : (n / ARC.w) * w).toFixed(1),
      );
      plane.style.offsetPath = `path("M ${x0} ${y0} C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}")`;
      plane.dataset.arc = "";
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, []);
  return { boxRef, planeRef };
}

/**
 * 03: the shipment as its tracking card: GBR to IDN on the departure
 * board's tiles with the plane flying the route, and under it the legs,
 * each arriving as the plane passes it, on a rail like the steps' own.
 */
export function FlightScene() {
  const k = useScene();
  const { boxRef, planeRef } = useArcPath();
  const [x0, y0, x1, y1, x2, y2, x3, y3] = ARC.d;
  const legs = [
    { key: "pickedUp", Icon: Truck, ms: 250 },
    { key: "flying", Icon: Plane, ms: 900 },
    { key: "cleared", Icon: ShieldCheck, ms: 1900 },
  ];
  return (
    <div className={HERO} style={at(0)}>
      <div className="flex items-center gap-[1em] pt-[0.9em]">
        <SceneTiles code="GBR" start={150} />
        {/* the route spans the gap between the two boards; its box sits on
            the tiles' centre line, so both ends meet the tiles level */}
        <div className="relative h-[1.8em] min-w-0 flex-1">
          <div ref={boxRef} className="absolute inset-x-0 bottom-1/2 h-[2.6em]">
            <svg
              viewBox={`0 0 ${ARC.w} ${ARC.h}`}
              preserveAspectRatio="none"
              className="jr jr-draw absolute inset-0 size-full overflow-visible"
              style={at(450)}
              aria-hidden
            >
              <path
                d={`M${x0} ${y0} C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`}
                fill="none"
                stroke="var(--tone)"
                strokeWidth="1.5"
                strokeDasharray="1 5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* the two ends: where it leaves, and where it lands */}
            <span className="absolute bottom-0 left-0 size-[0.45em] -translate-x-1/2 translate-y-1/2 rounded-full bg-tone-ink" />
            <span className="absolute bottom-0 right-0 size-[0.45em] translate-x-1/2 translate-y-1/2 rounded-full border-[0.12em] border-tone-ink bg-background" />
            {/* the page's own plane glyph (lucide, as on the hero's board),
                turned to face along the route */}
            <span ref={planeRef} className="jr jr-fly absolute left-0 top-0" style={at(450)}>
              <Plane className="block size-[1.3em] fill-background text-foreground" strokeWidth={1.75} />
            </span>
          </div>
        </div>
        <SceneTiles code="IDN" start={270} />
      </div>
      <div className="mt-[1.4em] border-t border-border pt-[1.3em]">
        <ol className="relative space-y-[1.2em]">
          {/* the legs' rail, behind their marks, running on past the crop */}
          <span className="absolute -bottom-[4em] left-[0.95em] top-[0.95em] w-px -translate-x-1/2 bg-border-strong" />
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
          {["7.5em", "6em"].map((w, i) => (
            <li key={w} className="jr jr-rise relative flex items-center gap-[0.75em]" style={at(2100 + i * 90)}>
              <span className="grid size-[1.9em] shrink-0 place-items-center rounded-full bg-background shadow-[inset_0_0_0_1.5px_var(--border-strong)]" />
              <Bar w={w} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * The front door: a panelled door in the chapter's ink with sunk, bevelled
 * panels, its white casing with the house number, a letter plate and a
 * handle.
 */
function FrontDoor({ className }: { className?: string }) {
  const panels = [
    [12, 13, 20, 30],
    [38, 13, 20, 30],
    [12, 53, 20, 50],
    [38, 53, 20, 50],
  ];
  return (
    <svg viewBox="0 0 70 118" preserveAspectRatio="none" className={className} aria-hidden>
      <rect x="0" y="0" width="70" height="118" rx="4" className="fill-background" />
      <rect x="6" y="6" width="58" height="112" rx="1.5" className="fill-tone-ink" />
      {/* the door's own edge, lit on the left */}
      <rect x="6" y="6" width="1.2" height="112" fill="#fff" opacity="0.18" />
      {panels.map(([x, y, w, h]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={w} height={h} rx="1.2" fill="#000" opacity="0.18" />
          {/* bevel: light from the top left, shade to the bottom right */}
          <path d={`M${x} ${y + h} V${y} H${x + w}`} fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="1.1" />
          <path d={`M${x + w} ${y} V${y + h} H${x}`} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.1" />
        </g>
      ))}
      {/* letter plate */}
      <rect x="24" y="46" width="22" height="4.4" rx="1" className="fill-background" opacity="0.92" />
      <rect x="26.5" y="47.6" width="17" height="1.2" rx="0.6" fill="#000" opacity="0.35" />
      {/* handle on its backplate */}
      <rect x="54.2" y="65" width="4" height="13" rx="2" fill="#000" opacity="0.2" />
      <circle cx="56.2" cy="71.5" r="2.5" className="fill-background" />
      {/* the house number on the casing */}
      <rect x="28" y="-0.6" width="14" height="7.2" rx="1.6" className="fill-background" />
      <text x="35" y="5" textAnchor="middle" className="fill-tone-ink font-mono" fontSize="5.2" fontWeight="600">
        12
      </text>
    </svg>
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
      {/* the porch: a floor running the stage's width, the door and its mat
          standing on it, nearly the stage's height, the parcels landing by
          its foot (on a phone, under the chat, the door is smaller) */}
      <span
        className="jr jr-rise absolute inset-x-0 bottom-0 h-[3.2em] bg-surface-3 shadow-[inset_0_0.12em_0_rgb(255_255_255/0.75)]"
        style={at(0)}
      />
      <div
        className="jr jr-rise absolute bottom-[3.2em] left-[3.6em] h-[19.5em] w-[11.55em] @max-[30rem]:left-[10.4em] @max-[30rem]:h-[11em] @max-[30rem]:w-[6.5em]"
        style={at(60)}
      >
        <FrontDoor className="absolute inset-0 size-full" />
      </div>
      <span
        className="jr jr-rise absolute bottom-[2.75em] left-[4.1em] h-[0.6em] w-[10.6em] rounded-[0.2em] bg-tone-ink/25 @max-[30rem]:left-[10.7em] @max-[30rem]:w-[5.9em]"
        style={at(120)}
      />
      <Parcel
        className="bottom-[3.05em] left-[15.9em] h-[4em] w-[4.6em] @max-[30rem]:left-[4.6em] @max-[30rem]:h-[3.6em] @max-[30rem]:w-[4.15em]"
        style={at(1500)}
      />
      <Parcel
        className="bottom-[6.75em] left-[16.5em] h-[3em] w-[3.45em] @max-[30rem]:bottom-[6.4em] @max-[30rem]:left-[5.1em] @max-[30rem]:h-[2.7em] @max-[30rem]:w-[3.1em]"
        style={at(1700)}
      />
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
