import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The drawings on What you can ship's cards: each card's thing, drawn flat
 * and simple so it reads at a glance, in the chapter's hue (globals.css,
 * .ship-art: the hue in three values, its ink in two, its wash) and the
 * doorstep's kraft (JourneyScenes). Boxes and anything with depth are
 * drawn in the doorstep's projection, the far face up and to the right.
 * Every drawing sits on one ground line in the same 168 × 112 frame, so a
 * row of cards lines up. Decorative: the card's words carry the meaning.
 */
export type ShipArtName = "boxes" | "suitcases" | "belongings" | "electronics" | "gifts" | "large";

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
const WASH = "fill-(--art-wash)";
const METAL = "fill-(--art-metal)";
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

/** the floor every drawing stands on, under its middle */
function Ground({ cx }: { cx: number }) {
  return <ellipse cx={cx} cy={103} rx={64} ry={4} className="ship-art-ground fill-(--art-ground)" />;
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

function Belongings() {
  return (
    <>
      {/* three books, spines out */}
      <rect x={22} y={88} width={74} height={14} rx={1.5} className={INK} />
      <rect x={28} y={88} width={3} height={14} className={INK_SIDE} />
      <rect x={87} y={88} width={3} height={14} className={INK_SIDE} />
      <rect x={45} y={93.5} width={26} height={3} rx={1} className={cn(WASH, "opacity-70")} />
      <rect x={28} y={76} width={64} height={12} rx={1.5} fill={KRAFT.front} />
      <rect x={33} y={76} width={3} height={12} fill={KRAFT.tape} />
      <rect x={83} y={76} width={3} height={12} fill={KRAFT.tape} />
      <rect x={48} y={80.5} width={20} height={3} rx={1} fill={KRAFT.lid} />
      <rect x={24} y={65} width={70} height={11} rx={1.5} className={HUE} />
      <rect x={30} y={65} width={3} height={11} className={HUE_SIDE} />
      <rect x={85} y={65} width={3} height={11} className={HUE_SIDE} />
      <rect x={46} y={69} width={24} height={3} rx={1} className={HUE_TOP} />
      {/* two folded tops on them, a striped one under a plain one */}
      <rect x={30} y={50} width={58} height={15} rx={3.5} className={WASH} />
      <rect x={30} y={55.5} width={58} height={2.4} className={HUE_SIDE} />
      <rect x={30} y={60} width={58} height={2.4} className={HUE_SIDE} />
      <rect x={35} y={37} width={50} height={13} rx={3.5} fill={KRAFT.lid} />
      <path d="M35 44.5H85" stroke={KRAFT.front} strokeWidth={1.2} />
      <path d="M52 37q8 6.5 16 0Z" className={PAPER} />
      {/* a saucepan with its lid */}
      <rect x={143} y={82} width={19} height={4.5} rx={2.25} className={INK_SIDE} />
      <rect x={108} y={80} width={34} height={22} rx={4} className={INK} />
      <rect x={105} y={77} width={40} height={5} rx={2.5} className={INK_SIDE} />
      <path d="M107 77q18-13 36 0Z" className={HUE_TOP} />
      <rect x={121} y={66.5} width={8} height={4} rx={2} className={INK_SIDE} />
    </>
  );
}

function Electronics() {
  return (
    <>
      {/* a laptop, its screen showing the battery */}
      <rect x={30} y={22} width={84} height={56} rx={5} className={INK_SIDE} />
      <rect x={35} y={27} width={74} height={46} rx={2} className={WASH} />
      <rect
        x={61}
        y={43.5}
        width={21}
        height={12}
        rx={2.5}
        className="stroke-(--art-ink)"
        fill="none"
        strokeWidth={2}
      />
      <rect x={82.6} y={47} width={2.6} height={5} rx={1} className={INK} />
      <rect x={63.8} y={46.3} width={8} height={6.4} rx={1} className={HUE} />
      <path d="M24 78H120L130 92H14Z" className={METAL} />
      <path d="M33 81H111L114 86H30Z" className={cn(INK_SIDE, "opacity-20")} />
      <rect x={14} y={92} width={116} height={5} rx={2.5} className={HUE_SIDE} />
      {/* and a camera in front */}
      <rect x={126} y={71} width={13} height={6} rx={1.5} className={INK} />
      <rect x={118} y={76} width={36} height={25} rx={4} className={INK} />
      <rect x={145} y={73.5} width={6} height={2.5} rx={1} className={HUE_TOP} />
      <circle cx={136} cy={88.5} r={9.5} className={INK_SIDE} />
      <circle cx={136} cy={88.5} r={6} className={HUE} />
      <circle cx={133.5} cy={86} r={1.8} className={cn(PAPER, "opacity-90")} />
    </>
  );
}

function Gifts() {
  return (
    <>
      {/* a wrapped box under its lid, ribboned both ways */}
      <Block x={26} y={62} w={60} h={40} k={20} front="var(--art-hue)" top="var(--art-hue-top)" side="var(--art-hue-side)" />
      <rect x={52} y={62} width={8} height={40} fill={KRAFT.tapeLid} />
      <Block x={22} y={52} w={68} h={10} k={22} front="var(--art-hue)" top="var(--art-hue-top)" side="var(--art-hue-side)" />
      <rect x={52} y={52} width={8} height={10} fill={KRAFT.tapeLid} />
      <path d="M52 52L74 36.16H82L60 52Z" fill={KRAFT.tapeLid} />
      <path d="M31.24 45.35H99.24L102.76 42.81H34.76Z" fill={KRAFT.tapeLid} />
      <ellipse cx={60} cy={40} rx={8} ry={4.6} transform="rotate(-24 60 40)" fill={KRAFT.lid} stroke={KRAFT.tape} strokeWidth={1.4} />
      <ellipse cx={75} cy={40} rx={8} ry={4.6} transform="rotate(24 75 40)" fill={KRAFT.lid} stroke={KRAFT.tape} strokeWidth={1.4} />
      <circle cx={67.5} cy={43.5} r={3.4} fill={KRAFT.tape} />
      {/* a shopping bag beside it, still tagged */}
      <path d="M114 57c0-17 20-17 20 0" fill="none" stroke={KRAFT.tape} strokeWidth={3} strokeLinecap="round" />
      <path d="M104 56L112 50.24H152L144 56Z" fill={KRAFT.inside} />
      <path d="M144 56L152 50.24V96.24L144 102Z" fill={KRAFT.side} />
      <rect x={104} y={56} width={40} height={46} fill={KRAFT.front} />
      <rect x={104} y={56} width={40} height={4} fill={KRAFT.lid} />
      <path d="M134 57L140.5 66" className="stroke-(--art-ink-side)" strokeWidth={1} />
      <g transform="rotate(16 142 73)">
        <path d="M136 69L139 65H145L148 69V81H136Z" className={PAPER} />
        <circle cx={142} cy={68.4} r={1.2} fill={KRAFT.side} />
        <rect x={138.5} y={72.5} width={7} height={1.6} rx={0.6} className={cn(INK, "opacity-40")} />
        <rect x={138.5} y={75.5} width={5} height={1.6} rx={0.6} className={cn(INK, "opacity-40")} />
      </g>
    </>
  );
}

function Large() {
  return (
    <>
      {/* measured end to end */}
      <path
        d="M20 25v10M148 25v10M20 30h128M26 26.5L20 30l6 3.5M142 26.5l6 3.5-6 3.5"
        className="stroke-(--art-ink)"
        fill="none"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* a sofa */}
      <rect x={30} y={44} width={108} height={36} rx={9} className={HUE_SIDE} />
      <rect x={36} y={48} width={47} height={28} rx={6} className={HUE} />
      <rect x={85} y={48} width={47} height={28} rx={6} className={HUE} />
      <rect x={32} y={96} width={4} height={6} className={INK_SIDE} />
      <rect x={132} y={96} width={4} height={6} className={INK_SIDE} />
      <rect x={26} y={86} width={116} height={10} rx={3} className={HUE_SIDE} />
      <rect x={34} y={74} width={100} height={14} rx={4} className={HUE_TOP} />
      <rect x={83.4} y={75} width={1.2} height={12} className={cn(HUE_SIDE, "opacity-60")} />
      <rect x={20} y={60} width={20} height={34} rx={7} className={HUE} />
      <rect x={128} y={60} width={20} height={34} rx={7} className={HUE} />
    </>
  );
}

/** each drawing, and where its ground sits under it */
const ART: Record<ShipArtName, [ComponentType, number]> = {
  boxes: [Boxes, 84],
  suitcases: [Suitcases, 84],
  belongings: [Belongings, 84],
  electronics: [Electronics, 84],
  gifts: [Gifts, 86],
  large: [Large, 84],
};

export function ShipArt({ name, className }: { name: ShipArtName; className?: string }) {
  const [Art, cx] = ART[name];
  return (
    <svg viewBox="0 0 168 112" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <Ground cx={cx} />
      {/* the thing itself, apart from its ground, so a mouse can lift it
          off the floor (globals.css, .ship-card) */}
      <g className="ship-art-lift">
        <Art />
      </g>
    </svg>
  );
}
