import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The drawings of What you can send's packing guide, what it all travels in
 * (suitcases, boxes, special packaging; the bento's things are drawn in the
 * round, ShipObjects): each thing drawn flat and simple
 * so it reads at a glance, in the chapter's hue (globals.css, .ship-art:
 * the hue in three values, its ink in two, its wash) and the doorstep's
 * kraft (JourneyScenes). Boxes and anything with depth are
 * drawn in the doorstep's projection, the far face up and to the right.
 * Every drawing sits on one ground line in the same 168 × 112 frame, scaled
 * to stand the same height and set flush left (ART, ShipArt), so a row of
 * cards lines up and each drawing starts where its card's words do.
 * Decorative: the card's words carry the meaning.
 */
export type ShipArtName = "suitcases" | "boxes" | "special";

/** the doorstep's kraft, its front, side and lid, and the tape on each */
const KRAFT = {
  front: "#e9ab65",
  side: "#c58242",
  lid: "#f8cf8b",
  tape: "#cd8531",
  tapeLid: "#e29d43",
  inside: "#a8642c",
};

const HUE = "fill-(--art-hue)";
const HUE_TOP = "fill-(--art-hue-top)";
const HUE_SIDE = "fill-(--art-hue-side)";
const INK = "fill-(--art-ink)";
const INK_SIDE = "fill-(--art-ink-side)";
const PAPER = "fill-white";

/** the depth of the doorstep's projection: k across, 0.72k up */
const DEPTH = 0.72;

/** an oblique block: front, lid and right side, each a colour or a var() */
function Block({
  x,
  y,
  w,
  h,
  k,
  front,
  top,
  side,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  k: number;
  front: string;
  top: string;
  side: string;
}) {
  const dy = -k * DEPTH;
  return (
    <>
      <path d={`M${x} ${y}L${x + k} ${y + dy}H${x + w + k}L${x + w} ${y}Z`} style={{ fill: top }} />
      <path d={`M${x + w} ${y}L${x + w + k} ${y + dy}V${y + h + dy}L${x + w} ${y + h}Z`} style={{ fill: side }} />
      <rect x={x} y={y} width={w} height={h} style={{ fill: front }} />
    </>
  );
}

/** the floor every drawing stands on, as wide as the drawing */
function Ground({ width }: { width: number }) {
  return <ellipse cx={width / 2} cy={103} rx={width / 2} ry={4} className="ship-art-ground fill-(--art-ground)" />;
}

function Boxes() {
  return (
    <>
      <Block x={28} y={56} w={82} h={46} k={26} front={KRAFT.front} top={KRAFT.lid} side={KRAFT.side} />
      {/* the tape across the lid and down the front */}
      <path d="M64.5 56L90.5 37.28H99.5L73.5 56Z" fill={KRAFT.tapeLid} />
      <rect x={64.5} y={56} width={9} height={14} fill={KRAFT.tape} />
      {/* this way up */}
      <path
        d="M37 85V75M34 78l3-3 3 3M45 85V75M42 78l3-3 3 3M33 88.5h16"
        className="stroke-(--art-ink-side)"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* the shipping label */}
      <rect x={84} y={76} width={20} height={15} rx={1.5} className={PAPER} />
      <rect x={86.5} y={79} width={10} height={2.6} rx={0.6} className={HUE} />
      <rect x={86.5} y={83.6} width={15} height={1.6} rx={0.6} className={cn(INK, "opacity-35")} />
      <rect x={86.5} y={86.6} width={11} height={1.6} rx={0.6} className={cn(INK, "opacity-35")} />
      {/* the smaller box on its lid, and its shade on the lid */}
      <path d="M98 50L116 37.04H122L104 50Z" className="fill-black opacity-10" />
      <Block x={44} y={16} w={54} h={34} k={18} front={KRAFT.front} top={KRAFT.lid} side={KRAFT.side} />
      <path d="M67.5 16L85.5 3.04H92.5L74.5 16Z" fill={KRAFT.tapeLid} />
      <rect x={67.5} y={16} width={7} height={10} fill={KRAFT.tape} />
    </>
  );
}

function Suitcases() {
  return (
    <>
      <g transform="translate(-8 0)">
        {/* a hard case, standing: its far side, top and right, then its face */}
        <rect x={48} y={19.92} width={52} height={68} rx={7} className={HUE_SIDE} />
        <path d="M41 30L55 19.92H93L79 30Z" className={HUE_TOP} />
        <path d="M86 37L100 26.92V80.92L86 91Z" className={HUE_SIDE} />
        <rect x={34} y={30} width={52} height={68} rx={7} className={HUE} />
        {[44.5, 58.5, 72.5].map((x) => (
          <rect key={x} x={x} y={38} width={3} height={52} rx={1.5} className={HUE_TOP} />
        ))}
        {/* the handle, out of the top */}
        <rect x={57} y={8} width={2.6} height={18} className={INK_SIDE} />
        <rect x={75} y={8} width={2.6} height={18} className={INK_SIDE} />
        <rect x={53} y={5} width={28} height={6} rx={3} className={INK} />
        <circle cx={42} cy={99.5} r={3.6} className={INK_SIDE} />
        <circle cx={78} cy={99.5} r={3.6} className={INK_SIDE} />
        {/* locked */}
        <path
          d="M60.5 59v-2.6a2.6 2.6 0 0 1 5.2 0V59"
          className="stroke-(--art-ink-side)"
          fill="none"
          strokeWidth={1.7}
        />
        <rect x={58} y={58.5} width={10.2} height={8.4} rx={1.6} fill={KRAFT.tapeLid} />
        <circle cx={63.1} cy={62.4} r={1.1} className={INK_SIDE} />
        {/* a duffel bag beside it */}
        <path
          d="M113 78c0-15 21-15 21 0"
          className="stroke-(--art-ink-side)"
          fill="none"
          strokeWidth={3.2}
          strokeLinecap="round"
        />
        <rect x={94} y={76} width={60} height={26} rx={12} className={INK} />
        <rect x={110.5} y={75} width={5} height={7} rx={1} className={INK_SIDE} />
        <rect x={131.5} y={75} width={5} height={7} rx={1} className={INK_SIDE} />
        <path d="M104 80.5H144" className="stroke-(--art-wash)" strokeWidth={1.4} strokeLinecap="round" />
        <rect x={139} y={79} width={3.4} height={6} rx={1} className={PAPER} />
      </g>
    </>
  );
}

function Special() {
  return (
    <>
      {/* a wooden crate: planks, a frame round its face, a brace across */}
      <Block x={20} y={48} w={80} h={54} k={24} front={KRAFT.front} top={KRAFT.lid} side={KRAFT.side} />
      <path d="M27 68.3H93M27 81.7H93" stroke={KRAFT.inside} strokeWidth={1.2} />
      <path d="M100 68.3L124 51.02M100 81.7L124 64.42" stroke={KRAFT.inside} strokeWidth={1.2} />
      <path d="M27 88L86 55H93V62L34 95H27Z" fill={KRAFT.tape} />
      <path d="M20 48H100V55H20ZM20 95H100V102H20ZM20 48H27V102H20ZM93 48H100V102H93Z" fill={KRAFT.tape} />
      <path d="M118 35.04L124 30.72V84.72L118 89.04Z" fill={KRAFT.inside} />
      {/* and a guitar's hard case standing beside it, its handle and
          latches out front */}
      <rect x={127} y={7} width={18} height={18} rx={6} className={INK} />
      <rect x={130} y={18} width={12} height={46} rx={3} className={INK} />
      <circle cx={136} cy={63} r={12.5} className={INK} />
      <rect x={124} y={63} width={24} height={21} className={INK} />
      <circle cx={136} cy={84} r={17} className={INK} />
      <path d="M131 74.5h10" className="stroke-(--art-ink-side)" strokeWidth={3.4} strokeLinecap="round" />
      <rect x={118.6} y={82} width={4} height={6} rx={1} fill={KRAFT.tapeLid} />
      <rect x={149.4} y={82} width={4} height={6} rx={1} fill={KRAFT.tapeLid} />
      <rect x={126.5} y={13} width={3} height={5} rx={1} fill={KRAFT.tapeLid} />
      <rect x={142.5} y={13} width={3} height={5} rx={1} fill={KRAFT.tapeLid} />
    </>
  );
}
/** each drawing, and its ink in its own units (left, top, right, bottom,
 *  strokes included): measure it again whenever a drawing changes */
const ART: Record<ShipArtName, { Art: ComponentType; ink: readonly [number, number, number, number] }> = {
  suitcases: { Art: Suitcases, ink: [26, 5, 146, 102] },
  boxes: { Art: Boxes, ink: [28, 3, 136, 102] },
  special: { Art: Special, ink: [20, 7, 153.4, 102] },
};

/** how tall every drawing stands on its ground, the widest it may reach,
 *  and where the ground is, in the frame's units */
const STAND = 88;
const REACH = 160;
const FLOOR = 102;

export function ShipArt({ name, className }: { name: ShipArtName; className?: string }) {
  const {
    Art,
    ink: [x0, y0, x1, y1],
  } = ART[name];
  // every drawing scaled to stand the same height (or reach the same width,
  // if it's long) and set flush left on the floor, so a row of cards matches
  // and each drawing starts where its card's words do
  const k = Math.min(STAND / (y1 - y0), REACH / (x1 - x0));
  return (
    <svg viewBox="0 0 168 112" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <Ground width={(x1 - x0) * k} />
      <g transform={`translate(${-x0 * k} ${FLOOR * (1 - k)}) scale(${k})`}>
        {/* the thing itself, apart from its ground, so a mouse can lift it
            off the floor (globals.css, .ship-card) */}
        <g className="ship-art-lift">
          <Art />
        </g>
      </g>
    </svg>
  );
}
