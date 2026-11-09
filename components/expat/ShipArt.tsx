import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The drawings on What you can ship's cards and on what it all travels in
 * (suitcases, boxes, special packaging): each thing drawn flat and simple
 * so it reads at a glance, in the chapter's hue (globals.css, .ship-art:
 * the hue in three values, its ink in two, its wash) and the doorstep's
 * kraft (JourneyScenes). Boxes and anything with depth are
 * drawn in the doorstep's projection, the far face up and to the right.
 * Every drawing sits on one ground line in the same 168 × 112 frame, scaled
 * to stand the same height and set flush left (ART, ShipArt), so a row of
 * cards lines up and each drawing starts where its card's words do.
 * Decorative: the card's words carry the meaning.
 */
export type ShipArtName =
  | "clothes"
  | "books"
  | "home"
  | "hobby"
  | "bike"
  | "other"
  | "suitcases"
  | "boxes"
  | "special";

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

function Clothes() {
  return (
    <>
      {/* a stack of folded clothes, jeans to shirt, a cap on top */}
      <rect x={10} y={82} width={78} height={20} rx={4} className={INK} />
      <rect x={10} y={91.2} width={78} height={1.6} className={INK_SIDE} />
      <rect x={14} y={64} width={70} height={18} rx={4} className={WASH} />
      <rect x={14} y={68.6} width={70} height={2.4} className={HUE_SIDE} />
      <rect x={14} y={74} width={70} height={2.4} className={HUE_SIDE} />
      <rect x={17} y={47} width={64} height={17} rx={3.5} className={HUE} />
      <path d="M17 55H81" className="stroke-(--art-hue-side)" strokeWidth={1.2} />
      <rect x={21} y={32} width={56} height={15} rx={3.5} fill={KRAFT.lid} />
      <path d="M21 40H77" stroke={KRAFT.front} strokeWidth={1.2} />
      <path d="M39 32q10 7 20 0Z" className={PAPER} />
      <path d="M33 32a16 15 0 0 1 32 0Z" className={HUE_SIDE} />
      <path d="M58 30.4H74.5a1.6 1.6 0 0 1 0 3.2H58Z" className={INK} />
      <circle cx={49} cy={17.6} r={2} className={INK} />
      {/* and a tote bag beside them */}
      <path d="M108 56c0-25 28-25 28 0" fill="none" className="stroke-(--art-ink-side)" strokeWidth={3.2} strokeLinecap="round" />
      <path d="M97 54H147L143 102H101Z" fill={KRAFT.front} />
      <path d="M97 54H147L146.6 59H97.4Z" fill={KRAFT.lid} />
      <rect x={105.5} y={53} width={5} height={8} rx={1} className={INK_SIDE} />
      <rect x={133.5} y={53} width={5} height={8} rx={1} className={INK_SIDE} />
      <rect x={113} y={72} width={18} height={12} rx={2} className={HUE} />
    </>
  );
}

/** a book's spine: its colour, the two bands near its ends, a title */
function Spine({ x, y, w, h, fill, band, title }: { x: number; y: number; w: number; h: number; fill: string; band: string; title: string }) {
  const across = w > h;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={1.5} style={{ fill }} />
      {across ? (
        <>
          <rect x={x + 6} y={y} width={3} height={h} style={{ fill: band }} />
          <rect x={x + w - 9} y={y} width={3} height={h} style={{ fill: band }} />
          <rect x={x + w / 2 - 12} y={y + h / 2 - 1.5} width={24} height={3} rx={1} style={{ fill: title }} />
        </>
      ) : (
        <>
          <rect x={x} y={y + 6} width={w} height={3} style={{ fill: band }} />
          <rect x={x} y={y + h - 9} width={w} height={3} style={{ fill: band }} />
          <rect x={x + w / 2 - 1.5} y={y + h / 2 - 10} width={3} height={20} rx={1} style={{ fill: title }} />
        </>
      )}
    </>
  );
}

function Books() {
  return (
    <>
      {/* a pile lying down */}
      <Spine x={8} y={88} w={78} h={14} fill="var(--art-ink)" band="var(--art-ink-side)" title="var(--art-wash)" />
      <Spine x={14} y={76} w={66} h={12} fill={KRAFT.front} band={KRAFT.tape} title={KRAFT.lid} />
      <Spine x={10} y={65} w={72} h={11} fill="var(--art-hue)" band="var(--art-hue-side)" title="var(--art-hue-top)" />
      <Spine x={19} y={55} w={56} h={10} fill={KRAFT.side} band={KRAFT.inside} title={KRAFT.lid} />
      <Spine x={14} y={45} w={64} h={10} fill="var(--art-hue-side)" band="var(--art-ink)" title="var(--art-hue-top)" />
      {/* and three standing up beside it */}
      <Spine x={92} y={32} w={14} h={70} fill="var(--art-hue-side)" band="var(--art-hue-top)" title="var(--art-hue-top)" />
      <Spine x={107} y={16} w={17} h={86} fill="var(--art-ink)" band="var(--art-ink-side)" title="var(--art-wash)" />
      <Spine x={125} y={40} w={13} h={62} fill={KRAFT.front} band={KRAFT.tape} title={KRAFT.lid} />
    </>
  );
}

function Home() {
  return (
    <>
      {/* a standing lamp */}
      <rect x={25.5} y={40} width={3} height={53} className={INK_SIDE} />
      <rect x={15} y={92} width={24} height={10} rx={5} className={INK} />
      <path d="M14 14H40L48 42H6Z" className={HUE} />
      <path d="M6.6 40H47.4L48 42H6Z" className={HUE_SIDE} />
      {/* plates stacked, a bowl on top */}
      {[97.5, 92.5, 87.5, 82.5, 77.5].map((y) => (
        <g key={y}>
          <rect x={54} y={y} width={38} height={4.5} rx={2.25} className={HUE_TOP} />
          <rect x={56} y={y + 3.3} width={34} height={1.2} rx={0.6} className={HUE_SIDE} />
        </g>
      ))}
      <path d="M60 65H86Q84.5 77.5 73 77.5Q61.5 77.5 60 65Z" fill={KRAFT.front} />
      <rect x={58.5} y={63} width={29} height={3.4} rx={1.7} fill={KRAFT.lid} />
      {/* and a kettle, its handle over the lid */}
      <path d="M104 64C104 42 132 42 132 64" fill="none" className="stroke-(--art-ink-side)" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M134 74L146.5 63.5Q149.5 61.5 150.5 64.5L139 90Z" className={INK} />
      <rect x={100} y={64} width={36} height={38} rx={8} className={INK} />
      <path d="M106 64.5q12-9 24 0Z" className={HUE_TOP} />
      <rect x={114.5} y={55} width={7} height={4} rx={2} className={INK_SIDE} />
    </>
  );
}

/** a racket's head: an oval rim, strung across */
const HEAD = { rx: 13, ry: 17 };
const STRINGS = [-8, -4, 0, 4, 8];

function Hobby() {
  return (
    <>
      {/* a guitar standing up: its neck, then its body over the neck's foot */}
      <rect x={53} y={10} width={6} height={50} className={INK_SIDE} />
      <rect x={50.5} y={2} width={11} height={13} rx={2.5} className={INK} />
      <circle cx={56} cy={82} r={20} className={HUE} />
      <circle cx={56} cy={58} r={15} className={HUE} />
      <circle cx={56} cy={65} r={5.5} className={INK_SIDE} />
      <rect x={47} y={85} width={18} height={3.6} rx={1.6} className={INK_SIDE} />
      <path d="M54.6 12V86.5M57.4 12V86.5" className="stroke-white opacity-60" strokeWidth={0.7} />
      {/* a badminton racket leaning in from the right */}
      <g transform="translate(118 102) rotate(-20)">
        <rect x={-2.6} y={-22} width={5.2} height={22} rx={2.2} className={INK} />
        <rect x={-1} y={-50} width={2} height={30} className={INK_SIDE} />
        <ellipse cx={0} cy={-66} rx={HEAD.rx} ry={HEAD.ry} className={cn(HUE_TOP, "opacity-40")} />
        {STRINGS.map((d) => {
          const v = HEAD.ry * Math.sqrt(1 - (d / HEAD.rx) ** 2);
          const y = d * 1.6;
          const u = HEAD.rx * Math.sqrt(1 - (y / HEAD.ry) ** 2);
          return (
            <g key={d} className="stroke-(--art-hue-side)" strokeWidth={0.8}>
              <path d={`M${d} ${-66 - v}V${-66 + v}`} />
              <path d={`M${-u} ${-66 + y}H${u}`} />
            </g>
          );
        })}
        <ellipse cx={0} cy={-66} rx={HEAD.rx} ry={HEAD.ry} fill="none" className="stroke-(--art-ink)" strokeWidth={3} />
      </g>
      {/* and a shuttlecock */}
      <path d="M135 92L130 76H150L145 92Z" className={WASH} />
      <path d="M137.5 92L135 76M142.5 92L145 76M140 92V76" className="stroke-(--art-hue-side)" strokeWidth={1} />
      <path d="M130 76H150" className="stroke-(--art-hue-side)" strokeWidth={1.4} />
      <path d="M134.5 92H145.5V96.5a5.5 5.5 0 0 1-11 0Z" fill={KRAFT.front} />
    </>
  );
}

function Bike() {
  return (
    <>
      {/* the wheels */}
      {[40, 126].map((cx) => (
        <g key={cx}>
          <path
            d={`M${cx} 67V99M${cx - 16} 83H${cx + 16}M${cx - 11.3} 71.7L${cx + 11.3} 94.3M${cx + 11.3} 71.7L${cx - 11.3} 94.3`}
            className="stroke-(--art-metal)"
            strokeWidth={1}
          />
          <circle cx={cx} cy={83} r={17} fill="none" className="stroke-(--art-ink)" strokeWidth={4} />
          <circle cx={cx} cy={83} r={2.6} className={INK_SIDE} />
        </g>
      ))}
      {/* the frame, the chainring at its foot */}
      <circle cx={78} cy={84} r={7} fill="none" className="stroke-(--art-ink-side)" strokeWidth={2} />
      <path
        d="M40 83H78L72 50ZM72 50H112L78 84"
        fill="none"
        className="stroke-(--art-hue)"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M113 47L116.5 60" className="stroke-(--art-ink)" strokeWidth={5} strokeLinecap="round" />
      <path d="M116.5 60L126 83" className="stroke-(--art-ink-side)" strokeWidth={3.4} strokeLinecap="round" />
      {/* the saddle, and the bars */}
      <path d="M72 50L69.5 41" className="stroke-(--art-ink-side)" strokeWidth={3} strokeLinecap="round" />
      <path d="M58 40.5q11-5 22 0l-1.5 3.5H60Z" className={INK} />
      <path d="M113 47L110.5 39" className="stroke-(--art-ink-side)" strokeWidth={3} strokeLinecap="round" />
      <path d="M103 38.5H113.5q5 0 5 5" fill="none" className="stroke-(--art-ink)" strokeWidth={3.2} strokeLinecap="round" />
    </>
  );
}

function Other() {
  return (
    <>
      {/* a box, and the question it asks */}
      <Block x={26} y={58} w={76} h={44} k={22} front={KRAFT.front} top={KRAFT.lid} side={KRAFT.side} />
      <path d="M59.5 58L81.5 42.16H90.5L68.5 58Z" fill={KRAFT.tapeLid} />
      <rect x={59.5} y={58} width={9} height={13} fill={KRAFT.tape} />
      <rect x={78} y={78} width={18} height={14} rx={1.5} className={PAPER} />
      <rect x={80.5} y={81} width={9} height={2.6} rx={0.6} className={HUE} />
      <rect x={80.5} y={85.6} width={13} height={1.6} rx={0.6} className={cn(INK, "opacity-35")} />
      <rect x={104} y={4} width={42} height={32} rx={12} className={HUE} />
      <path d="M112 33l-5 11 15-8Z" className={HUE} />
      <path
        d="M119.6 15.6a5.6 5.6 0 1 1 7.6 5.3c-1.5.6-2.2 1.6-2.2 3.2v1.4"
        fill="none"
        className="stroke-white"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={125} cy={30.6} r={1.9} className={PAPER} />
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
  clothes: { Art: Clothes, ink: [10, 15.6, 147, 102] },
  books: { Art: Books, ink: [8, 16, 138, 102] },
  home: { Art: Home, ink: [6, 14, 150.5, 102] },
  hobby: { Art: Hobby, ink: [36, 2, 150.7, 102] },
  bike: { Art: Bike, ink: [21, 36.9, 145, 102] },
  other: { Art: Other, ink: [26, 4, 146, 102] },
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
