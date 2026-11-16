"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The bento's things drawn in the round (What you can send, ShipTiles), as
 * the doorstep's door is (JourneyScenes): plain SVG, every surface its own
 * gradient lit from the top left, a soft shadow where each thing meets the
 * floor. The chapter's hue comes from `.ship-art`'s colours (globals.css),
 * so the things take the chapter's blue as the words do; cream ceramics,
 * brass and a lamp's warm light are the colours of the things themselves.
 * The things lift off their shadows under a mouse (`.ship-art-lift`,
 * `.ship-art-ground`). Decorative: the tile's words carry the meaning.
 */

/** cream ceramic and painted shade, lit to shaded */
const CREAM = { lit: "#fffdf8", mid: "#efe8db", shade: "#d3c8b4", deep: "#bcae96" };
/** brushed brass */
const BRASS = { lit: "#f6dfa8", mid: "#d6aa62", shade: "#9c7036" };

/** enamel: the chapter's hue pulled toward its ink, so it reads painted
 *  metal, not plastic; `n` is how far toward the ink, in % */
const enamel = (n: number) => ({ stopColor: `color-mix(in oklab, var(--art-hue), var(--art-ink) ${n}%)` });

/** a box's depth in the bento: k across, 0.6k up (the doorstep's
 *  projection made steeper, so a cover or a deck reads as one) */
const BOX_DEPTH = 0.6;

/**
 * The shadow a box throws on the floor: its own footprint (the front edge
 * from x to x + w at y, running k back), softened and cast to the right,
 * away from the light, as the doorstep's parcels' are. A level ellipse
 * fits a round foot; under a box it parts from the side that climbs away.
 */
function BoxShadow({ x, y, w, k, cast, filter, opacity = 0.3 }: { x: number; y: number; w: number; k: number; cast: number; filter: string; opacity?: number }) {
  const dy = k * BOX_DEPTH;
  return (
    <path
      d={`M${x + 2} ${y + 2}H${x + w + cast}L${x + w + k + cast} ${y - dy + 2}H${x + k + 2}Z`}
      filter={filter}
      style={{ fill: "var(--art-ink)" }}
      opacity={opacity}
    />
  );
}

/** a bowl's outer wall, from its rim's front edge down to its foot */
function bowlWall(cx: number, rim: number) {
  return (
    `M${cx - 62} ${rim}A62 12 0 0 0 ${cx + 62} ${rim}` +
    `C${cx + 62} ${rim + 30} ${cx + 46} ${rim + 47} ${cx + 30} ${rim + 51}V${rim + 56}H${cx - 30}V${rim + 51}` +
    `C${cx - 46} ${rim + 47} ${cx - 62} ${rim + 30} ${cx - 62} ${rim}Z`
  );
}

/**
 * Home & kitchen, staged as one group, back to front: a dome table lamp
 * lit, an enamel pot with its lid on and a checked tea towel over its
 * front, and three bowls stacked before them, over the lamp's base and the
 * pot's handle.
 */
export function HomeObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const BOWLS = { cx: 214, rims: [196, 214, 232] };
  return (
    <svg viewBox="14 20 460 284" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id={`${id}-shade`} cx="0.34" cy="0.3" r="0.85">
          <stop offset="0" stopColor={CREAM.lit} />
          <stop offset="0.5" stopColor={CREAM.mid} />
          <stop offset="1" stopColor={CREAM.shade} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1b8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={BRASS.shade} />
          <stop offset="0.35" stopColor={BRASS.lit} />
          <stop offset="0.7" stopColor={BRASS.mid} />
          <stop offset="1" stopColor={BRASS.shade} />
        </linearGradient>
        <linearGradient id={`${id}-brassTop`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbecc4" />
          <stop offset="1" stopColor={BRASS.mid} />
        </linearGradient>
        <linearGradient id={`${id}-bowl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={CREAM.mid} />
          <stop offset="0.28" stopColor={CREAM.lit} />
          <stop offset="0.75" stopColor={CREAM.mid} />
          <stop offset="1" stopColor={CREAM.shade} />
        </linearGradient>
        {/* inside the top bowl: its far wall lit, its floor in shade */}
        <linearGradient id={`${id}-bowlIn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={CREAM.mid} />
          <stop offset="1" stopColor={CREAM.shade} />
        </linearGradient>
        <linearGradient id={`${id}-pot`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={enamel(82)} />
          <stop offset="0.14" style={enamel(50)} />
          <stop offset="0.3" style={enamel(30)} />
          <stop offset="0.6" style={enamel(60)} />
          <stop offset="0.88" style={enamel(84)} />
          <stop offset="1" style={enamel(94)} />
        </linearGradient>
        <radialGradient id={`${id}-lid`} cx="0.36" cy="0.15" r="0.95">
          <stop offset="0" style={enamel(20)} />
          <stop offset="0.5" style={enamel(48)} />
          <stop offset="1" style={enamel(82)} />
        </radialGradient>
        <linearGradient id={`${id}-ear`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={enamel(45)} />
          <stop offset="1" style={enamel(90)} />
        </linearGradient>
        {/* gingham: a band each way, darker where they cross */}
        <pattern id={`${id}-check`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-5) translate(3 2)">
          <rect width="14" height="14" fill="#fbfdff" />
          <rect width="14" height="5" style={{ fill: "var(--art-ink)" }} opacity="0.32" />
          <rect width="5" height="14" style={{ fill: "var(--art-ink)" }} opacity="0.32" />
        </pattern>
        {/* the towel's folds: lit where it bellies out, shaded where it tucks */}
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.16" />
          <stop offset="0.22" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.42" stopColor="#000" stopOpacity="0.14" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.26" />
        </linearGradient>
      </defs>

      {/* where each thing meets the floor */}
      <g className="ship-art-ground">
        <g filter={`url(#${id}-soft)`} style={{ fill: "var(--art-ink)" }}>
          <ellipse cx="120" cy="264" rx="62" ry="7" opacity="0.26" />
          <ellipse cx="362" cy="274" rx="98" ry="8" opacity="0.3" />
          <ellipse cx="222" cy="290" rx="62" ry="6.5" opacity="0.28" />
        </g>
      </g>

      <g className="ship-art-lift">
        {/* the lamp, at the back: its base, the stem, the warm light under
            the dome */}
        <path d="M58 250A54 11 0 0 0 166 250V257A54 11 0 0 1 58 257Z" fill={BRASS.shade} />
        <ellipse cx="112" cy="250" rx="54" ry="11" fill={u("brassTop")} />
        <ellipse cx="112" cy="249" rx="30" ry="5" fill="#fff4cc" opacity="0.55" filter={u("blur")} />
        <rect x="107.5" y="118" width="9" height="134" fill={u("brass")} />
        <rect x="103" y="114" width="18" height="12" rx="4" fill={u("brass")} />
        <ellipse cx="112" cy="134" rx="58" ry="12" fill={u("glow")} />
        <path d="M26 124C26 64 60 30 112 30C164 30 198 64 198 124A86 10 0 0 1 26 124Z" fill={u("shade")} />
        <path d="M26 124A86 10 0 0 0 198 124" fill="none" stroke="#fff3d0" strokeWidth="3" />
        <ellipse cx="80" cy="64" rx="24" ry="14" fill="#fff" opacity="0.5" filter={u("blur")} />

        {/* the pot, behind the bowls: its handles, its wall, the towel over its front, its lid */}
        <g transform="translate(-102 -44)">
          <path d="M368 220H352Q342 220 342 230Q342 240 352 240H368Z" fill={u("ear")} />
          <path d="M536 220H552Q562 220 562 230Q562 240 552 240H536Z" fill={u("ear")} />
          <path d="M366 212V300A86 18 0 0 0 538 300V212A86 16 0 0 1 366 212Z" fill={u("pot")} />
          <ellipse cx="404" cy="262" rx="14" ry="38" fill="#fff" opacity="0.2" filter={u("soft")} />
          <path d="M366 212A86 16 0 0 0 538 212" fill="none" style={{ stroke: "var(--art-ink)" }} strokeWidth="4" opacity="0.35" />
          <path d="M448 226Q488 225 526 218C534 240 540 268 544 300C536 306 526 301 517 306C505 312 496 303 483 310C470 316 456 305 442 312C446 284 446 254 448 226Z" fill={u("check")} />
          <path d="M448 226Q488 225 526 218C534 240 540 268 544 300C536 306 526 301 517 306C505 312 496 303 483 310C470 316 456 305 442 312C446 284 446 254 448 226Z" fill={u("fold")} />
          <path d="M544 300C536 306 526 301 517 306C505 312 496 303 483 310C470 316 456 305 442 312" fill="none" style={{ stroke: "var(--art-ink)" }} strokeWidth="2" opacity="0.35" />
          <ellipse cx="488" cy="229" rx="42" ry="5" fill="#000" opacity="0.22" filter={u("blur")} />
          <path d="M368 210C376 186 414 178 452 178C490 178 528 186 536 210A84 15 0 0 1 368 210Z" fill={u("lid")} />
          <path d="M368 210A84 15 0 0 0 536 210" fill="none" style={{ stroke: "var(--art-ink)" }} strokeWidth="3" opacity="0.3" />
          <ellipse cx="422" cy="190" rx="28" ry="6" fill="#fff" opacity="0.3" filter={u("blur")} />
          <ellipse cx="452" cy="179" rx="15" ry="4.5" style={{ fill: "var(--art-ink)" }} opacity="0.35" />
          <path d="M441 161V176A11 4 0 0 0 463 176V161Z" fill={u("ear")} />
          <ellipse cx="452" cy="161" rx="11" ry="4" style={{ fill: "color-mix(in oklab, var(--art-hue), var(--art-ink) 25%)" }} />
        </g>

        {/* the bowls, in front, nested: the top one's inside, then each wall
            over the one sitting in it */}
        <ellipse cx={BOWLS.cx} cy={BOWLS.rims[0]} rx="62" ry="12" fill={u("bowlIn")} />
        <ellipse cx={BOWLS.cx + 4} cy={BOWLS.rims[0] + 3} rx="40" ry="6" fill={CREAM.deep} opacity="0.35" filter={u("blur")} />
        {BOWLS.rims.map((rim, i) => (
          <g key={rim}>
            <path d={bowlWall(BOWLS.cx, rim)} fill={u("bowl")} />
            {/* the bowl above sits in this one's rim: a shade under the lip */}
            {i > 0 && (
              <path d={`M${BOWLS.cx - 60} ${rim + 2}A60 12 0 0 0 ${BOWLS.cx + 60} ${rim + 2}`} fill="none" stroke={CREAM.deep} strokeWidth="3" opacity="0.45" filter={u("blur")} />
            )}
            <path d={`M${BOWLS.cx - 62} ${rim}A62 12 0 0 0 ${BOWLS.cx + 62} ${rim}`} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** knit and denim, lit to shaded */
const KNIT = {
  cream: { lit: "#fdf8ee", mid: "#efe4d0", shade: "#d3c4a9" },
  grey: { lit: "#eef1f4", mid: "#d3d9df", shade: "#aeb7c0" },
};

/** a folded garment: the top it lies flat on, then its rolled front edge */
function Folded({
  x,
  y,
  w,
  h,
  top,
  front,
  texture,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  top: string;
  front: string;
  texture?: string;
}) {
  return (
    <>
      <path d={`M${x + 10} ${y + 10}L${x + 26} ${y - 16}Q${x + 28} ${y - 20} ${x + 34} ${y - 20}H${x + w - 34}Q${x + w - 28} ${y - 20} ${x + w - 26} ${y - 16}L${x + w - 10} ${y + 10}Z`} fill={top} />
      <rect x={x} y={y} width={w} height={h} rx="18" fill={front} />
      {texture && <rect x={x} y={y} width={w} height={h} rx="18" fill={texture} />}
    </>
  );
}

/** a white leather trainer in profile, toe to the left: the sole with its
 *  toe spring, the upper rising over the laces to a padded collar, the
 *  heel counter in the chapter's ink */
function Trainer({ id, transform, dim = false }: { id: string; transform?: string; dim?: boolean }) {
  const upper =
    "M50 321C46 314 50 304 64 302C86 298 104 294 120 288C128 285 136 282 142 280L152 280C160 284 172 286 182 283L192 278C200 282 206 298 208 318Z";
  const laces = [
    [100, 300],
    [111, 297],
    [122, 293],
    [133, 289],
  ];
  return (
    <g transform={transform}>
      <path d="M44 336C40 330 42 322 50 320L200 317C208 317 212 323 212 330C212 338 206 341 198 341H58C50 341 46 340 44 336Z" fill="#f3e8d2" />
      <path d="M43 333C44 338 50 341 58 341H198C206 341 211 338 212 333Z" fill="#d8c49f" />
      <path d={upper} fill={`url(#${id}-leather)`} />
      {/* the tongue, and the collar's opening */}
      <path d="M138 284C138 276 146 273 154 276C156 279 154 282 150 284Z" fill="#f4f6f8" />
      <path d="M152 280C160 284 172 286 182 283L192 278C182 274 162 274 152 280Z" fill="#cdd3da" />
      {dim && <path d={upper} fill="#000" opacity="0.07" />}
      <path d="M64 302C72 306 76 313 76 320M92 304C108 299 124 293 141 286" fill="none" stroke="#000" strokeOpacity="0.07" strokeWidth="2" />
      <path d="M192 278C200 282 206 298 208 318H199C198 303 194 290 186 282Z" style={{ fill: "var(--art-ink)" }} opacity="0.85" />
      {laces.map(([x, y]) => (
        <path key={x} d={`M${x - 3} ${y - 4}L${x + 3} ${y + 4}`} stroke="#c3c9d0" strokeWidth="3" strokeLinecap="round" />
      ))}
      <path d="M50 321L208 318" stroke="#000" strokeOpacity="0.08" strokeWidth="1.5" />
    </g>
  );
}

/**
 * Clothes & personal items: three garments folded and stacked (a grey knit,
 * blue denim, a cream knit), a pair of white trainers before them and a cap
 * on the floor beside them, set before the tile's package so the list and
 * the things meet. Kept low, so nothing covers a listed row.
 */
export function ClothesObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const cap = (n: number) => ({ stopColor: `color-mix(in oklab, var(--art-ink), black ${n}%)` });
  return (
    <svg viewBox="30 166 500 182" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        {/* a folded edge rolls: lit along its top, in shade underneath */}
        <linearGradient id={`${id}-roll`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <pattern id={`${id}-rib`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M2 0V8" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.5" />
          <path d="M6 0V8" stroke="#000" strokeOpacity="0.045" strokeWidth="2" />
        </pattern>
        <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={KNIT.cream.mid} />
          <stop offset="0.3" stopColor={KNIT.cream.lit} />
          <stop offset="1" stopColor={KNIT.cream.shade} />
        </linearGradient>
        <linearGradient id={`${id}-grey`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={KNIT.grey.mid} />
          <stop offset="0.3" stopColor={KNIT.grey.lit} />
          <stop offset="1" stopColor={KNIT.grey.shade} />
        </linearGradient>
        <linearGradient id={`${id}-denim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={enamel(55)} />
          <stop offset="0.3" style={enamel(35)} />
          <stop offset="1" style={enamel(78)} />
        </linearGradient>
        <radialGradient id={`${id}-cap`} cx="0.32" cy="0.25" r="0.9">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--art-ink), var(--art-hue) 28%)" }} />
          <stop offset="0.55" style={cap(12)} />
          <stop offset="1" style={cap(42)} />
        </radialGradient>
        <linearGradient id={`${id}-brim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--art-ink), var(--art-hue) 18%)" }} />
          <stop offset="1" style={cap(30)} />
        </linearGradient>
        <linearGradient id={`${id}-leather`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1f3f5" />
          <stop offset="1" stopColor="#d7dce2" />
        </linearGradient>
      </defs>

      <g className="ship-art-ground">
        <g filter={`url(#${id}-soft)`} style={{ fill: "var(--art-ink)" }}>
          <ellipse cx="332" cy="340" rx="128" ry="8" opacity="0.28" />
          <ellipse cx="140" cy="342" rx="96" ry="6" opacity="0.26" />
          <ellipse cx="468" cy="342" rx="62" ry="6" opacity="0.26" />
        </g>
      </g>

      <g className="ship-art-lift">
        {/* the stack, bottom up, each one shading the one under it */}
        <Folded x={210} y={290} w={240} h={48} top={KNIT.grey.lit} front={u("grey")} texture={u("rib")} />
        <rect x={210} y={290} width={240} height={48} rx="18" fill={u("roll")} />
        <ellipse cx="330" cy="292" rx="108" ry="3" fill="#000" opacity="0.25" filter={u("blur")} />
        <Folded x={216} y={246} w={228} h={46} top={`color-mix(in oklab, var(--art-hue), var(--art-ink) 30%)`} front={u("denim")} />
        <rect x={216} y={246} width={228} height={46} rx="18" fill={u("roll")} />
        <path d="M232 258H428" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="5 4" />
        <ellipse cx="330" cy="248" rx="110" ry="3" fill="#000" opacity="0.25" filter={u("blur")} />
        <Folded x={212} y={200} w={236} h={48} top={KNIT.cream.lit} front={u("cream")} texture={u("rib")} />
        <rect x={212} y={200} width={236} height={48} rx="18" fill={u("roll")} />
        <path d="M244 186H416" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />

        {/* the cap on the floor beside the stack, its brim to the right */}
        <path d="M400 336C400 302 418 286 444 286C470 286 488 302 488 336A44 8 0 0 1 400 336Z" fill={u("cap")} />
        <path d="M444 287C438 302 434 320 432 338M444 287C452 302 458 320 460 338" fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth="2" />
        <ellipse cx="444" cy="287" rx="6" ry="3" style={{ fill: "color-mix(in oklab, var(--art-ink), black 35%)" }} />
        <ellipse cx="422" cy="304" rx="10" ry="13" fill="#fff" opacity="0.22" filter={u("blur")} />
        <ellipse cx="494" cy="338" rx="38" ry="9" transform="rotate(-8 494 338)" style={{ fill: "color-mix(in oklab, var(--art-ink), black 40%)" }} />
        <ellipse cx="494" cy="335" rx="38" ry="9" transform="rotate(-8 494 335)" fill={u("brim")} />

        {/* the trainers, the far one a step back */}
        <Trainer id={id} transform="translate(30 -8)" dim />
        <Trainer id={id} />
      </g>
    </svg>
  );
}

/** the books on a scale of their own, units per centimetre: they're the
 *  tile's only things, so what counts is their sizes against each other */
const BOOK_CM = 6.4;
/** a book's depth is drawn at half its length along the bento's slope
 *  (`BOX_DEPTH`): how far across each centimetre of it reaches */
const RECEDE = 0.5 / Math.hypot(1, BOX_DEPTH);
/** a case binding's boards, 1/8 in, and the squares they stand past the
 *  pages by at the head, tail and fore-edge, 1/8 in */
const BOARD = 0.3;
const SQUARE = 0.3;
/** a rounded spine stands out, and its fore-edge falls in, by this much of
 *  the book's thickness */
const ROUND = 0.12;
/** a ribbon marker: Müller Martini's "usually 5 mm, sometimes 8" */
const RIBBON = 0.8;

type BookSize = { long: number; deep: number; thick: number };
/** a hardcover from its trim (inches) and its thickness (cm, Lulu's
 *  casewrap spine table for its pages): the boards are the pages plus a
 *  square at the head, tail and fore-edge */
const hardcover = (trimW: number, trimH: number, thick: number): BookSize => ({
  long: trimH * 2.54 + 2 * SQUARE,
  deep: trimW * 2.54 + SQUARE,
  thick,
});
/** an art book, US Letter (8.5 × 11 in), 280 pages */
const ART_BOOK = hardcover(8.5, 11, 2.4);
/** a long novel, Royal (6.14 × 9.21 in), 600 pages */
const NOVEL = hardcover(6.14, 9.21, 4.1);
/** a shorter one, 5.5 × 8.5 in, 360 pages */
const SMALL_BOOK = hardcover(5.5, 8.5, 2.7);

/** a book where it lies, in cm: across from the bottom one's left end, up
 *  from the floor, back from the bottom one's spine */
type Placed = BookSize & { x: number; y: number; z: number };
const ART_AT: Placed = { ...ART_BOOK, x: 0, y: 0, z: 0 };
const NOVEL_AT: Placed = { ...NOVEL, x: 1.2, y: ART_BOOK.thick, z: 1.6 };
const SMALL_AT: Placed = { ...SMALL_BOOK, x: 2.4, y: ART_BOOK.thick + NOVEL.thick, z: 2.7 };

type Pt = readonly [number, number];
/** a point of the stack (cm) on the picture */
const bp = (x: number, y: number, z: number): Pt => [4 + (x + z * RECEDE) * BOOK_CM, 92 - (y + z * RECEDE * BOX_DEPTH) * BOOK_CM];
const xy = (p: Pt) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
const poly = (...pts: Pt[]) => `M${pts.map(xy).join("L")}Z`;
/** a flat box on the picture, from its bottom left and top right corners */
const box = (a: Pt, b: Pt) => ({ x: a[0], y: b[1], width: b[0] - a[0], height: a[1] - b[1] });

/**
 * A hardcover lying flat, as paths: its cover on top; its right end, the
 * boards' cloth-covered edges with the pages set in between them by the
 * square; and its front, which is either its spine (rounded, standing out
 * at the middle, so its ends bow) or its fore-edge (the pages falling in
 * between the boards' edges, the way a rounded book's do).
 */
function bookPaths(b: Placed, spineFront: boolean) {
  const { x, y, z, long, deep, thick } = b;
  const r = thick * ROUND;
  const right = x + long;
  const top = y + thick;
  const mid = y + thick / 2;
  const back = z + deep;
  const inner = right - SQUARE;
  const lo = y + BOARD;
  const hi = top - BOARD;
  const cover = poly(bp(x, top, z), bp(right, top, z), bp(right, top, back), bp(x, top, back));
  if (spineFront) {
    const pf = z + BOARD;
    return {
      cover,
      end: `M${xy(bp(right, y, z))}L${xy(bp(right, y, back))}L${xy(bp(right, top, back))}L${xy(bp(right, top, z))}Q${xy(bp(right, mid, z - 2 * r))} ${xy(bp(right, y, z))}Z`,
      endPages: `M${xy(bp(inner, lo, pf))}L${xy(bp(inner, lo, back - SQUARE))}L${xy(bp(inner, hi, back - SQUARE))}L${xy(bp(inner, hi, pf))}Q${xy(bp(inner, mid, pf - 2 * r))} ${xy(bp(inner, lo, pf))}Z`,
      front:
        `M${xy(bp(x, top, z))}L${xy(bp(right, top, z))}Q${xy(bp(right, mid, z - 2 * r))} ${xy(bp(right, y, z))}` +
        `L${xy(bp(x, y, z))}Q${xy(bp(x, mid, z - 2 * r))} ${xy(bp(x, top, z))}Z`,
    };
  }
  const pf = z + SQUARE;
  return {
    cover,
    end: `M${xy(bp(right, y, z))}L${xy(bp(right, y, back))}Q${xy(bp(right, mid, back + 2 * r))} ${xy(bp(right, top, back))}L${xy(bp(right, top, z))}Z`,
    endPages: `M${xy(bp(inner, lo, pf))}L${xy(bp(inner, lo, back - BOARD))}L${xy(bp(inner, hi, back - BOARD))}L${xy(bp(inner, hi, pf))}Q${xy(bp(inner, mid, pf + 2 * r))} ${xy(bp(inner, lo, pf))}Z`,
    front: poly(bp(x, y, z), bp(right, y, z), bp(right, top, z), bp(x, top, z)),
    frontPages:
      `M${xy(bp(x + SQUARE, hi, pf))}L${xy(bp(inner, hi, pf))}Q${xy(bp(inner, mid, pf + 2 * r))} ${xy(bp(inner, lo, pf))}` +
      `L${xy(bp(x + SQUARE, lo, pf))}Q${xy(bp(x + SQUARE, mid, pf + 2 * r))} ${xy(bp(x + SQUARE, hi, pf))}Z`,
    lowerBoard: poly(bp(x, y, z), bp(right, y, z), bp(right, lo, z), bp(x, lo, z)),
    upperBoard: poly(bp(x, hi, z), bp(right, hi, z), bp(right, top, z), bp(x, top, z)),
    /** the lower board's top, in front of the pages, inside the square */
    ledge: poly(bp(x, lo, z), bp(right, lo, z), bp(right, lo, pf), bp(x, lo, pf)),
    /** the headband, at the spine's end of the pages, at the back */
    headband: `M${xy(bp(inner, lo + 0.05, back - BOARD - 0.15))}L${xy(bp(inner, hi - 0.05, back - BOARD - 0.15))}`,
  };
}

/** what a book on top throws on the cover under it: its own footprint,
 *  softened and cast a little to the right, away from the light */
const footprint = (b: Placed) => {
  const s = 0.35;
  return poly(bp(b.x + s, b.y, b.z - 0.1), bp(b.x + b.long + s, b.y, b.z - 0.1), bp(b.x + b.long + s, b.y, b.z + b.deep), bp(b.x + s, b.y, b.z + b.deep));
};

/** a stamped line of a spine's title, on the spine's crown */
const spineText = (b: Placed, from: number, to: number, height: number, at = 0.5) => {
  const c = -b.thick * ROUND * 0.9;
  const yc = b.y + b.thick * at;
  return { ...box(bp(b.x + from, yc - height / 2, c), bp(b.x + to, yc + height / 2, c)), rx: (height * BOOK_CM) / 2 };
};

/** the ribbon: out of the novel's fore-edge 3.2 cm from its head, down its
 *  front, along the art book's cover and over its spine, hanging with its
 *  end cut in a V. (y, z) along the ribbon, in cm; it's a ribbon's width
 *  across */
const RIBBON_X = NOVEL_AT.x + NOVEL_AT.long - SQUARE - 3.2 - RIBBON;
const RIBBON_OUT = { y: NOVEL_AT.y + BOARD + 0.62 * (NOVEL.thick - 2 * BOARD), z: NOVEL_AT.z + SQUARE + 0.46 };
const RIBBON_HANG = NOVEL_AT.z - 0.1;
const ART_ROUND = ART_BOOK.thick * ROUND;
const band = (pts: [number, number][], end?: number) => {
  const left = pts.map(([y, z]) => bp(RIBBON_X, y, z));
  const right = pts.map(([y, z]) => bp(RIBBON_X + RIBBON, y, z)).reverse();
  const last = pts[pts.length - 1];
  const notch = end === undefined ? [] : [bp(RIBBON_X + RIBBON / 2, last[0] + end, last[1])];
  return poly(...left, ...notch, ...right);
};
const RIBBON_DOWN = band([
  [RIBBON_OUT.y, RIBBON_OUT.z],
  [RIBBON_OUT.y - 0.12, RIBBON_HANG + 0.18],
  [RIBBON_OUT.y - 0.35, RIBBON_HANG],
  [ART_BOOK.thick + 0.2, RIBBON_HANG],
]);
const RIBBON_FLAT = band([
  [ART_BOOK.thick + 0.2, RIBBON_HANG],
  [ART_BOOK.thick + 0.03, RIBBON_HANG - 0.2],
  [ART_BOOK.thick + 0.03, 0.15],
]);
const RIBBON_OVER = band(
  [
    [ART_BOOK.thick + 0.03, 0.15],
    [ART_BOOK.thick - 0.1, -ART_ROUND * 0.55],
    [ART_BOOK.thick - 0.45, -ART_ROUND - 0.04],
    [0.55, -ART_ROUND - 0.04],
  ],
  0.42,
);

/**
 * Books: three hardcovers stacked, each set back a little on the one under
 * it, drawn to their real sizes on one scale (`BOOK_CM`): an art book at
 * the bottom, a long novel on it with its fore-edge to the front, and a
 * shorter book on top. Each is a case binding as photographed (Wikimedia
 * Commons): boards a square past the pages at the head, tail and
 * fore-edge, a rounded spine (so the fore-edge falls in), the joint's
 * groove along the cover by the spine, a headband at the spine's end of the
 * pages, a title stamped along the spine and a publisher's mark at its
 * foot. The novel's ribbon marker comes out of its fore-edge and over the
 * art book's spine: the one lime in the bento, the brand's mark (DESIGN.md,
 * The One-Voice Rule).
 */
export function BooksObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const teal = (n: number) => `color-mix(in oklab, var(--art-hue), var(--art-ink) ${n}%)`;
  const sky = (n: number) => `color-mix(in oklab, var(--art-hue), white ${n}%)`;
  const art = bookPaths(ART_AT, true);
  const novel = bookPaths(NOVEL_AT, false);
  const small = bookPaths(SMALL_AT, true);
  const foil = "#f4ecd6";
  /** the groove of a joint along a cover, 7 mm in from the spine */
  const groove = (b: Placed) => {
    const t = b.y + b.thick;
    return {
      dark: `M${xy(bp(b.x + 0.15, t, b.z + 0.7))}L${xy(bp(b.x + b.long - 0.15, t, b.z + 0.7))}`,
      lit: `M${xy(bp(b.x + 0.15, t, b.z + 0.86))}L${xy(bp(b.x + b.long - 0.15, t, b.z + 0.86))}`,
    };
  };
  const artGroove = groove(ART_AT);
  const smallGroove = groove(SMALL_AT);
  /** the small book's cover: a blind-stamped rule 9 mm in */
  const st = SMALL_AT.y + SMALL_AT.thick;
  const blind = poly(
    bp(SMALL_AT.x + 0.9, st, SMALL_AT.z + 1.5),
    bp(SMALL_AT.x + SMALL_AT.long - 0.9, st, SMALL_AT.z + 1.5),
    bp(SMALL_AT.x + SMALL_AT.long - 0.9, st, SMALL_AT.z + SMALL_AT.deep - 0.9),
    bp(SMALL_AT.x + 0.9, st, SMALL_AT.z + SMALL_AT.deep - 0.9),
  );
  const floor = bp(0, 0, 0);

  return (
    <svg viewBox="0 2 264 96" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={`${id}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id={`${id}-fine`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
        {/* the pages' edges: fine lines, level on a fore-edge and along the
            depth on a head or tail */}
        <pattern id={`${id}-leaves`} width="8" height="1.7" patternUnits="userSpaceOnUse">
          <path d="M0 1.45H8" stroke="#000" strokeOpacity="0.075" strokeWidth="0.45" />
        </pattern>
        <pattern id={`${id}-leavesEnd`} width="8" height="1.7" patternUnits="userSpaceOnUse" patternTransform={`skewY(${-(Math.atan(BOX_DEPTH) * 180) / Math.PI})`}>
          <path d="M0 1.45H8" stroke="#000" strokeOpacity="0.09" strokeWidth="0.45" />
        </pattern>
        <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5eedf" />
          <stop offset="1" stopColor="#d8cbb0" />
        </linearGradient>
        <linearGradient id={`${id}-creamTop`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f8f3e8" />
          <stop offset="1" stopColor="#ece3d1" />
        </linearGradient>
        <linearGradient id={`${id}-tealSpine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: teal(40) }} />
          <stop offset="1" style={{ stopColor: teal(80) }} />
        </linearGradient>
        <linearGradient id={`${id}-tealTop`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: teal(30) }} />
          <stop offset="1" style={{ stopColor: teal(58) }} />
        </linearGradient>
        <linearGradient id={`${id}-skyTop`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: sky(66) }} />
          <stop offset="1" style={{ stopColor: sky(48) }} />
        </linearGradient>
        {/* a spine rounds: lit along its crown, shaded under */}
        <linearGradient id={`${id}-round`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
        {/* a fore-edge falls in: its upper half faces down, out of the light */}
        <linearGradient id={`${id}-hollow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.1" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.25" />
        </linearGradient>
        <clipPath id={`${id}-artCover`}>
          <path d={art.cover} />
        </clipPath>
        <clipPath id={`${id}-novelCover`}>
          <path d={novel.cover} />
        </clipPath>
      </defs>

      <g className="ship-art-ground">
        <BoxShadow
          x={floor[0]}
          y={floor[1]}
          w={ART_BOOK.long * BOOK_CM}
          k={ART_BOOK.deep * RECEDE * BOOK_CM}
          cast={10}
          filter={u("soft")}
        />
      </g>

      <g className="ship-art-lift">
        {/* the art book: cream cloth, its spine to the front, its title
            stamped in ink and the publisher's mark at its foot */}
        <path d={art.cover} fill={u("creamTop")} />
        <path d={art.end} fill={CREAM.deep} />
        <path d={art.endPages} fill="#efe9dc" />
        <path d={art.endPages} fill={u("leavesEnd")} />
        <path d={art.front} fill={u("cream")} />
        <path d={art.front} fill={u("round")} />
        <rect {...spineText(ART_AT, 2.6, 11.8, 0.5)} style={{ fill: "var(--art-ink)" }} opacity="0.5" />
        <rect {...spineText(ART_AT, 13.6, 18.4, 0.3)} style={{ fill: "var(--art-ink)" }} opacity="0.32" />
        <rect {...spineText(ART_AT, 26.2, 26.8, 0.6)} rx="0.6" style={{ fill: "var(--art-ink)" }} opacity="0.4" />
        <path d={artGroove.dark} style={{ stroke: "var(--art-ink)" }} strokeOpacity="0.16" strokeWidth="0.55" />
        <path d={artGroove.lit} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.4" />
        <path d={footprint(NOVEL_AT)} clipPath={u("artCover")} filter={u("blur")} style={{ fill: "var(--art-ink)" }} opacity="0.3" />

        {/* the novel, its fore-edge to the front: the pages between the
            boards' edges, falling in, its head on the right with the
            headband at the back */}
        <path d={novel.cover} fill={u("skyTop")} />
        <path d={novel.end} style={{ fill: sky(14) }} />
        <path d={novel.endPages} fill="#ece4d1" />
        <path d={novel.endPages} fill={u("leavesEnd")} />
        <path d={novel.headband} stroke="#f2e9d6" strokeWidth="0.85" />
        <path d={novel.headband} style={{ stroke: "var(--art-ink)" }} strokeOpacity="0.7" strokeWidth="0.85" strokeDasharray="0.55 0.55" />
        <path d={novel.front} style={{ fill: `color-mix(in oklab, var(--art-ink) 12%, ${CREAM.mid})` }} />
        <path d={novel.ledge} style={{ fill: sky(40) }} />
        <path d={novel.frontPages} fill="#f8f2e4" />
        <path d={novel.frontPages} fill={u("leaves")} />
        <path d={novel.frontPages} fill={u("hollow")} />
        <path d={novel.upperBoard} style={{ fill: sky(30) }} />
        <path d={novel.lowerBoard} style={{ fill: teal(8) }} />
        <path d={footprint(SMALL_AT)} clipPath={u("novelCover")} filter={u("blur")} style={{ fill: "var(--art-ink)" }} opacity="0.32" />

        {/* the small book: the chapter's blue, its title in foil between
            two pairs of rules, a blind rule round its cover */}
        <path d={small.cover} fill={u("tealTop")} />
        {/* pressed in: shaded on its far side, catching the light on its near one */}
        <path d={blind} fill="none" style={{ stroke: teal(78) }} strokeOpacity="0.6" strokeWidth="0.55" />
        <path d={blind} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.4" transform="translate(0.45 0.35)" />
        <path d={smallGroove.dark} style={{ stroke: "var(--art-ink)" }} strokeOpacity="0.35" strokeWidth="0.6" />
        <path d={smallGroove.lit} stroke="#fff" strokeOpacity="0.22" strokeWidth="0.45" />
        <path d={small.end} style={{ fill: teal(66) }} />
        <path d={small.endPages} fill="#ece6d7" />
        <path d={small.endPages} fill={u("leavesEnd")} />
        <path d={small.front} fill={u("tealSpine")} />
        <path d={small.front} fill={u("round")} />
        {[1.0, 1.3, SMALL_AT.long - 1.3, SMALL_AT.long - 1.0].map((at) => (
          <rect key={at} {...spineText(SMALL_AT, at, at + 0.07, SMALL_AT.thick - 0.7)} rx="0" fill={foil} opacity="0.8" />
        ))}
        <rect {...spineText(SMALL_AT, 3.0, 10.6, 0.5)} fill={foil} />
        <rect {...spineText(SMALL_AT, 12.2, 16.4, 0.3)} fill={foil} opacity="0.8" />
        <rect {...spineText(SMALL_AT, SMALL_AT.long - 2.75, SMALL_AT.long - 2.25, 0.5)} rx="0.5" fill={foil} opacity="0.85" />

        {/* the ribbon, out of the novel's pages, along the art book's cover
            and over its spine; its shadow a hair to the right */}
        <g filter={u("fine")} style={{ fill: "var(--art-ink)" }} opacity="0.28" transform="translate(0.7 0.35)">
          <path d={RIBBON_DOWN} />
          <path d={RIBBON_OVER} />
        </g>
        <path d={RIBBON_DOWN} fill="#c1ff00" />
        <path d={RIBBON_FLAT} fill="#d8ff6a" />
        <path d={RIBBON_OVER} fill="#b4ef00" />
      </g>
    </svg>
  );
}

/** one scale for every thing in the hobbies' pile, so they keep their real
 *  sizes against each other: units per centimetre */
const PER_CM = 2.1;
const cm = (n: number) => n * PER_CM;

/** the guitar: a dreadnought (Taylor's and Martin's specs; Wikimedia
 *  Commons, "Martin-dreadnought-shapes" and a Yamaha FG403S): its body,
 *  from the tail along the strings, with its widths at the lower bout,
 *  waist and upper bout, then a 14-fret neck on a 64.5 cm scale and a
 *  3+3 headstock */
const GUITAR = {
  body: cm(50.8),
  neck: cm(35.8),
  head: cm(15),
  lower: cm(40.6),
  waist: cm(27.9),
  upper: cm(29.2),
  scale: cm(64.5),
  soundhole: cm(10.2),
  nut: cm(4.3),
  heel: cm(5.6),
} as const;
/** the racket, inside the BWF's limits (680 by 230 mm): its head, the
 *  throat, the shaft and the handle, with the grip's thickness */
const RACKET = { head: cm(27.5), width: cm(22), throat: cm(3), shaft: cm(18), handle: cm(19.5), grip: cm(2.6) } as const;
/** a feather shuttle, by the BWF's laws: a 26 mm base, 66 mm feathers
 *  whose tips sit on a 64 mm circle */
const SHUTTLE = { base: cm(2.6), cork: cm(2.5), feather: cm(6.6), tips: cm(6.4) } as const;
/** a golf ball: 42.67 mm across, the Rules of Golf's least */
const GOLF = cm(4.267);

/**
 * Sports & hobbies, staged so each thing reads whole by its outline and the
 * eye goes from the biggest to the smallest, left to right: the guitar, the
 * one focus, leaning up to the right with nothing over it; the racket
 * standing behind its neck, the neck crossing the head's lower part (a clear
 * overlap, so the oval reads as behind it, never a near-touch), its throat,
 * shaft and grip whole beneath; then the shuttlecock standing on its cork
 * by the racket's butt, its own sport's pair, and the golf ball last. Each
 * is drawn to its real size on one scale (`PER_CM`), so the golf ball is
 * the size of the soundhole's half and the shuttle a little taller than the
 * guitar's bridge is wide, and each has the parts that make it itself: the
 * guitar's rosette, pickguard, bridge with its saddle and pins, fret dots,
 * nut, and a headstock with its string posts and six tuner buttons; the
 * racket's isometric head strung at its real density, its T-joint, a grip
 * wrapped in a spiral and a butt cap; the shuttle's leather cork with its
 * band, sixteen feathers tied with two threads; the ball's dimples.
 */
export function HobbyObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const blue = (n: number) => ({ stopColor: `color-mix(in oklab, var(--art-hue), var(--art-ink) ${n}%)` });
  const f = (n: number) => +n.toFixed(2);

  /* the guitar, along its strings from the tail (x 0), its top to us */
  const G = GUITAR;
  const lo = G.lower / 2;
  const wa = G.waist / 2;
  const up = G.upper / 2;
  const L = G.body;
  // the widest of each bout and the waist, along the body from the tail
  const atLower = L * 0.29;
  const atWaist = L * 0.64;
  const atUpper = L * 0.875;
  const half = [
    `C0 ${-lo * 0.61} ${f(L * 0.11)} ${-lo} ${f(atLower)} ${-lo}`,
    `C${f(L * 0.47)} ${-lo} ${f(L * 0.52)} ${-wa} ${f(atWaist)} ${-wa}`,
    `C${f(L * 0.73)} ${-wa} ${f(L * 0.81)} ${-up} ${f(atUpper)} ${-up}`,
    `C${f(L * 0.95)} ${-up} ${L} ${f(-up * 0.85)} ${L} ${f(-up * 0.55)}`,
  ];
  const body =
    `M0 0${half.join("")}V${f(up * 0.55)}` +
    `C${L} ${f(up * 0.85)} ${f(L * 0.95)} ${up} ${f(atUpper)} ${up}` +
    `C${f(L * 0.81)} ${up} ${f(L * 0.73)} ${wa} ${f(atWaist)} ${wa}` +
    `C${f(L * 0.52)} ${wa} ${f(L * 0.47)} ${lo} ${f(atLower)} ${lo}` +
    `C${f(L * 0.11)} ${lo} 0 ${f(lo * 0.61)} 0 0Z`;
  const nutX = L + G.neck;
  const tipX = nutX + G.head;
  // the frets, measured from the nut on the scale, the 20th at the
  // soundhole's edge; and the bridge's saddle a scale's length from the nut
  const fret = (n: number) => nutX - G.scale * (1 - 2 ** (-n / 12));
  const saddleX = nutX - G.scale;
  const holeX = L - cm(14);
  const boardEnd = fret(20);
  /** the fretboard's half-width at x, from the heel to the nut */
  const board = (x: number) => G.heel / 2 - ((G.heel - G.nut) / 2) * ((x - L) / G.neck);
  const strings = [-5, -3, -1, 1, 3, 5];
  // the headstock flares a little to its tip; its tuners three a side
  const headHalf = (x: number) => cm(3.2) + cm(0.45) * ((x - nutX) / G.head);
  const tuners = [cm(4.1), cm(7.7), cm(10.9)].map((d) => nutX + d);
  const post = cm(1.85);

  /* the racket, from its head's tip (x 0) to its butt */
  const R = RACKET;
  const ra = R.head / 2;
  const rb = R.width / 2;
  /** an isometric head: an oval squared a little (a superellipse) */
  const oval = (a: number, b: number, n = 2.6) =>
    Array.from({ length: 72 }, (_, i) => {
      const t = (i / 72) * Math.PI * 2;
      const c = Math.cos(t);
      const s2 = Math.sin(t);
      return `${i ? "L" : "M"}${f(ra + a * Math.sign(c) * Math.abs(c) ** (2 / n))} ${f(b * Math.sign(s2) * Math.abs(s2) ** (2 / n))}`;
    }).join("") + "Z";
  const shaftFrom = R.head + R.throat;
  const handleFrom = shaftFrom + R.shaft;
  const butt = handleFrom + R.handle;

  /* the shuttle, from its cork's tip (x 0) to its feathers' tips */
  const S = SHUTTLE;
  const cr = S.base / 2;
  const tr = S.tips / 2;
  const skirtFrom = S.cork;
  const skirtLen = Math.sqrt(S.feather ** 2 - (tr - cr) ** 2);
  const skirtTo = skirtFrom + skirtLen;
  const across = (x: number) => cr + (tr - cr) * ((x - skirtFrom) / skirtLen);
  // the feathers we see, round the near half of the cone
  const quills = Array.from({ length: 9 }, (_, i) => Math.sin(((i - 4) / 4) * (Math.PI / 2)));

  /* the golf ball's dimples: a hex grid, foreshortened toward its edge */
  const gr = GOLF / 2;
  const dimples: [number, number, number][] = [];
  for (let row = -4; row <= 4; row++) {
    for (let col = -4; col <= 4; col++) {
      const x = (col + (row % 2 ? 0.5 : 0)) * 1.05;
      const y = row * 0.91;
      const d = Math.hypot(x, y);
      if (d < gr - 0.55) dimples.push([f(x), f(y), f(0.42 * Math.sqrt(1 - (d / gr) ** 2) + 0.12)]);
    }
  }

  // where each thing stands, staged so each reads whole by its outline
  // (worked out on these sizes, so nothing only kisses another): the guitar
  // leaning up to the right with its lower bout on the floor; the racket
  // standing behind its neck, which crosses the head's lower part, the
  // oval clear of the body by about 17 units; then the shuttle and the
  // ball on the floor past the racket's butt
  const FLOOR = 162;
  const guitarAt = "translate(3 125.93) rotate(-22)";
  const racketAt = "translate(123.16 27.81) rotate(70)";
  const shuttleAt = `translate(185 ${FLOOR - 0.6}) rotate(-86)`;

  return (
    <svg viewBox="-4 26 222 142" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <radialGradient id={`${id}-top`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0" style={blue(22)} />
          <stop offset="0.6" style={blue(50)} />
          <stop offset="1" style={blue(72)} />
        </radialGradient>
        <radialGradient id={`${id}-hole`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#2b3740" />
          <stop offset="1" stopColor="#141c22" />
        </radialGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6a3f" />
          <stop offset="1" stopColor="#6e4527" />
        </linearGradient>
        <linearGradient id={`${id}-board`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d2a1f" />
          <stop offset="1" stopColor="#24180f" />
        </linearGradient>
        {/* tortoiseshell: amber through to near black */}
        <linearGradient id={`${id}-guard`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a4a2b" />
          <stop offset="0.45" stopColor="#4a2a18" />
          <stop offset="1" stopColor="#24140c" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6f8" />
          <stop offset="1" stopColor="#9aa4ad" />
        </linearGradient>
        <linearGradient id={`${id}-shaft`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfd6dc" />
          <stop offset="1" stopColor="#7f8b95" />
        </linearGradient>
        <linearGradient id={`${id}-grip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf6ea" />
          <stop offset="1" stopColor="#d9ccb2" />
        </linearGradient>
        <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfd6dc" />
        </radialGradient>
        <radialGradient id={`${id}-cork`} cx="0.3" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6dbe0" />
        </radialGradient>
        <linearGradient id={`${id}-skirt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4e9ee" />
        </linearGradient>
        <clipPath id={`${id}-strings`}>
          <path d={oval(ra - 1.5, rb - 1.5)} />
        </clipPath>
        {/* the racket's head where it stands, for the neck's shade on it */}
        <clipPath id={`${id}-racketHead`}>
          <path d={oval(ra, rb)} transform={racketAt} />
        </clipPath>
      </defs>

      {/* the pile's shadows on the floor, cast a little to the right */}
      <g className="ship-art-ground">
        <g filter={u("soft")} style={{ fill: "var(--art-ink)" }}>
          <ellipse cx="52" cy={FLOOR} rx="52" ry="5" opacity="0.28" />
          <ellipse cx="174" cy={FLOOR} rx="6" ry="1.8" opacity="0.24" />
          <ellipse cx="187" cy={FLOOR} rx="7" ry="2" opacity="0.22" />
          <ellipse cx="207" cy={FLOOR} rx="5.5" ry="1.6" opacity="0.24" />
        </g>
      </g>

      <g className="ship-art-lift">
        {/* the racket, at the back, standing on its butt, head up to the left */}
        <g transform={racketAt}>
          <path d={oval(ra, rb)} fill="#fff" opacity="0.3" />
          <g clipPath={u("strings")} stroke="#fff" strokeOpacity="0.85" strokeWidth="0.3">
            {/* the mains along the racket and the crosses over them, at
                about a string every centimetre */}
            {Array.from({ length: 21 }, (_, i) => -rb + 2 + i * ((2 * rb - 4) / 20)).map((y) => (
              <path key={`m${y}`} d={`M0 ${f(y)}H${R.head}`} />
            ))}
            {Array.from({ length: 23 }, (_, i) => 2 + i * ((R.head - 4) / 22)).map((x) => (
              <path key={`c${x}`} d={`M${f(x)} ${-rb}V${rb}`} />
            ))}
          </g>
          <path d={oval(ra, rb)} fill="none" style={{ stroke: "var(--art-ink)" }} strokeWidth="1.9" />
          <path d={oval(ra - 0.7, rb - 0.7)} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.4" />
          {/* the T-joint into the shaft */}
          <path d={`M${R.head - 1} -2.6L${shaftFrom} -0.8V0.8L${R.head - 1} 2.6Z`} style={{ fill: "var(--art-ink)" }} />
          <rect x={shaftFrom} y="-0.75" width={R.shaft + 1} height="1.5" fill={u("shaft")} />
          {/* the handle: a cone off the shaft, the grip wound in a spiral,
              the butt cap */}
          <path d={`M${handleFrom} -0.9L${handleFrom + 3} ${-R.grip / 2}V${R.grip / 2}L${handleFrom} 0.9Z`} style={{ fill: "var(--art-ink)" }} />
          <rect x={handleFrom + 3} y={-R.grip / 2} width={R.handle - 5} height={R.grip} rx="1" fill={u("grip")} />
          {Array.from({ length: 13 }, (_, i) => handleFrom + 4.5 + i * 2.6).map((x) => (
            <path key={x} d={`M${f(x)} ${-R.grip / 2}L${f(x + 1.4)} ${R.grip / 2}`} style={{ stroke: "var(--art-ink)" }} strokeOpacity="0.25" strokeWidth="0.45" />
          ))}
          <rect x={butt - 2.6} y={-R.grip / 2 - 0.3} width="2.6" height={R.grip + 0.6} rx="1.1" style={{ fill: "var(--art-ink)" }} />
        </g>

        {/* the shade the neck throws on the racket's strings, down and to
            the right, away from the light: it says the head is behind */}
        <g clipPath={u("racketHead")}>
          <path
            d={`M${L} ${f(-board(L))}L${nutX} ${f(-board(nutX))}V${f(board(nutX) + 2.4)}L${L} ${f(board(L) + 3)}Z`}
            transform={`${guitarAt} translate(0 4.5)`}
            fill="#000"
            opacity="0.18"
            filter={u("blur")}
          />
        </g>

        {/* the guitar, its neck across the racket's head */}
        <g transform={guitarAt}>
          {/* the shade it throws on the racket, then its side under the top */}
          <path d={body} transform="translate(3 11)" fill="#000" opacity="0.16" filter={u("blur")} />
          <path d={body} transform="translate(0 6.5)" style={{ fill: "color-mix(in oklab, var(--art-hue), var(--art-ink) 84%)" }} />
          <path d={body} fill={u("top")} stroke="#f6f0e3" strokeWidth="1.6" />
          {/* the pickguard, round the soundhole on the treble side */}
          <path
            d={`M${f(holeX + 10)} 9.2C${f(holeX + 10)} 16 ${f(holeX + 6)} 22.5 ${f(holeX - 3)} 23.5C${f(holeX - 14)} 24.5 ${f(holeX - 23)} 20.5 ${f(holeX - 23)} 14.5C${f(holeX - 23)} 10.5 ${f(holeX - 19)} 8 ${f(holeX - 13.6)} 8.6A15 15 0 0 0 ${f(holeX + 10)} 9.2Z`}
            fill={u("guard")}
            opacity="0.92"
          />
          {/* the rosette's rings, and the soundhole */}
          <circle cx={f(holeX)} cy="0" r={f(G.soundhole / 2 + 2.9)} fill="none" stroke="#f6f0e3" strokeWidth="1.3" />
          <circle cx={f(holeX)} cy="0" r={f(G.soundhole / 2 + 1.2)} fill="none" stroke="#f6f0e3" strokeOpacity="0.8" strokeWidth="0.5" />
          <circle cx={f(holeX)} cy="0" r={f(G.soundhole / 2)} fill={u("hole")} />
          {/* the bridge: rosewood, its saddle on the neck's side, six pins */}
          <rect x={f(saddleX - 5.2)} y={-cm(7.5)} width="6.6" height={cm(15)} rx="2.6" fill="#3b2a20" />
          <path d={`M${f(saddleX + 0.1)} -8.2L${f(saddleX + 0.7)} 8.2`} stroke="#f6f0e3" strokeWidth="0.9" strokeLinecap="round" />
          {strings.map((k) => (
            <circle key={k} cx={f(saddleX - 3)} cy={k * 1.15} r="0.75" fill="#f6f0e3" />
          ))}

          {/* the neck: its side, the fretboard to the soundhole, frets and dots */}
          <path d={`M${L} ${f(board(L))}L${nutX} ${f(board(nutX))}V${f(board(nutX) + 2.4)}L${L} ${f(board(L) + 3)}Z`} fill="#6e4527" />
          <path d={`M${f(boardEnd)} ${f(-board(L))}L${nutX} ${f(-board(nutX))}V${f(board(nutX))}L${f(boardEnd)} ${f(board(L))}Z`} fill={u("board")} />
          {Array.from({ length: 20 }, (_, i) => fret(i + 1)).map((x) => (
            <path key={x} d={`M${f(x)} ${f(-board(Math.max(x, L)))}V${f(board(Math.max(x, L)))}`} stroke="#c9ced4" strokeWidth="0.45" />
          ))}
          {[3, 5, 7, 9, 15].map((n) => (
            <circle key={n} cx={f((fret(n) + fret(n - 1)) / 2)} cy="0" r="0.7" fill="#efe7d6" />
          ))}
          {[-2, 2].map((y) => (
            <circle key={y} cx={f((fret(12) + fret(11)) / 2)} cy={y} r="0.7" fill="#efe7d6" />
          ))}
          <rect x={nutX} y={f(-board(nutX) - 0.2)} width="1.1" height={f(2 * board(nutX) + 0.4)} fill="#f6f0e3" />

          {/* the headstock: its side, its face, the tuners' shafts and
              buttons off both edges, the string posts */}
          <path d={`M${f(nutX + 1.1)} ${f(-headHalf(nutX) + 1.8)}L${f(tipX)} ${f(-headHalf(tipX) + 1.8)}V${f(headHalf(tipX) + 1.8)}L${f(nutX + 1.1)} ${f(headHalf(nutX) + 1.8)}Z`} fill="#5a3820" />
          {tuners.map((x) =>
            [-1, 1].map((side) => (
              <g key={`${x}${side}`}>
                <rect x={f(x - 0.5)} y={f(side < 0 ? -headHalf(x) - 2.4 : headHalf(x))} width="1" height="2.4" fill="#aeb7bf" />
                <rect x={f(x - 1.5)} y={f(side < 0 ? -headHalf(x) - 5.6 : headHalf(x) + 2.2)} width="3" height="3.4" rx="1.3" fill={u("metal")} />
              </g>
            )),
          )}
          <path d={`M${f(nutX + 1.1)} ${f(-headHalf(nutX))}L${f(tipX)} ${f(-headHalf(tipX))}Q${f(tipX + 0.8)} ${f(-headHalf(tipX))} ${f(tipX + 0.8)} ${f(-headHalf(tipX) + 1)}V${f(headHalf(tipX) - 1)}Q${f(tipX + 0.8)} ${f(headHalf(tipX))} ${f(tipX)} ${f(headHalf(tipX))}L${f(nutX + 1.1)} ${f(headHalf(nutX))}Z`} fill={u("wood")} />
          {tuners.map((x) =>
            [-1, 1].map((side) => (
              <g key={`p${x}${side}`}>
                <circle cx={f(x)} cy={side * post} r="1.5" fill="#3b2a20" opacity="0.55" />
                <circle cx={f(x)} cy={side * post} r="1" fill={u("metal")} />
              </g>
            )),
          )}

          {/* six strings, bridge to nut, and on from the nut to their posts:
              each outer string to the post nearest the nut */}
          {strings.map((k, i) => (
            <path
              key={k}
              d={`M${f(saddleX + 0.4)} ${f(k * 1.15)}L${nutX} ${f(k * 0.72)}L${f(tuners[i < 3 ? i : 5 - i])} ${(k < 0 ? -1 : 1) * post}`}
              fill="none"
              stroke="#e8edf1"
              strokeWidth={i === 0 || i === 1 || i === 2 ? 0.55 : 0.4}
            />
          ))}
        </g>

        {/* past the racket's butt: a shuttlecock standing on its cork */}
        <g transform={shuttleAt}>
          <path
            d={`M${f(skirtFrom)} ${f(-cr)}L${f(skirtTo)} ${f(-tr)}V${f(tr)}L${f(skirtFrom)} ${f(cr)}Z`}
            fill={u("skirt")}
          />
          {/* the vanes' overlapping tips, a scallop round the rim */}
          <path
            d={quills
              .slice(0, -1)
              .map((q, i) => `${i ? "" : `M${f(skirtTo)} ${f(q * tr)}`}Q${f(skirtTo + 1.1)} ${f(((q + quills[i + 1]) / 2) * tr)} ${f(skirtTo)} ${f(quills[i + 1] * tr)}`)
              .join("")}
            fill="#fbfcfd"
            stroke="#d5dce2"
            strokeWidth="0.25"
          />
          {/* the quills, base to tip, and the two threads that tie them */}
          {quills.map((q) => (
            <path key={q} d={`M${f(skirtFrom)} ${f(q * cr)}L${f(skirtTo)} ${f(q * tr)}`} stroke="#e9dfca" strokeWidth="0.35" />
          ))}
          {[0.28, 0.46].map((t) => {
            const x = skirtFrom + skirtLen * t;
            return <ellipse key={t} cx={f(x)} cy="0" rx="0.5" ry={f(across(x))} fill="none" stroke="#e9dfca" strokeWidth="0.45" />;
          })}
          {/* the cork: its leather dome, and the band where the feathers go in */}
          <path d={`M${f(cr)} ${f(-cr)}A${f(cr)} ${f(cr)} 0 0 0 ${f(cr)} ${f(cr)}H${f(skirtFrom)}V${f(-cr)}Z`} fill={u("cork")} />
          <rect x={f(skirtFrom - 0.8)} y={f(-cr)} width="0.8" height={f(S.base)} style={{ fill: "var(--art-ink)" }} />
        </g>

        {/* and the smallest last, a golf ball */}
        <g transform={`translate(206 ${f(FLOOR - gr)})`}>
          <circle r={f(gr)} fill={u("ball")} />
          {dimples.map(([x, y, r]) => (
            <circle key={`${x},${y}`} cx={x} cy={y} r={r} fill="#000" opacity="0.08" />
          ))}
        </g>
      </g>
    </svg>
  );
}

/**
 * Anything else: vinyl records, as they'd be packed. A sleeve stands in
 * front of another, with its record out of the opening on its left, in its
 * paper inner sleeve, far enough that the label shows whole. The record
 * leads on the left, toward the tile's questions, so the corner nearest
 * them is the record's curve and not a sleeve's square corner. Drawn to a 12-inch LP's own sizes (Wikimedia Commons, Evan-Amos's
 * public-domain "12in Vinyl LP Record Angle"): the jacket 31.4 cm square,
 * the record 30 cm across, its label a third of it with a pin-sized
 * spindle hole, a band of dead wax around the label, the tracks' gaps as
 * fine lighter rings, the lead-in a lighter rim, and the grooves' sheen as
 * two opposite wedges toward the light. The front sleeve wears the
 * chapter's blue, darker than the tile's wash, with a faint ring where the
 * record inside has rubbed it; the one behind is cream.
 */
export function VinylRecordsObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const hue = (n: number) => `color-mix(in oklab, var(--art-hue), var(--art-ink) ${n}%)`;
  /** k into the picture, drawn k across and 0.6k up */
  const depth = (k: number) => [k, -k * BOX_DEPTH] as const;
  // the front sleeve: its face's top-left corner, its side, its thickness;
  // the second one stands BACK behind it
  const X = 70;
  const Y = 28;
  const S = 100;
  const T = 3;
  const BACK = 20;
  const [bx, by] = depth(BACK);
  const [tx, ty] = depth(T);
  // the record, in the sleeve's middle: 0.96 of the jacket across, out of
  // its opening until the label clears it
  const [mx, my] = depth(T / 2);
  const R = 48;
  const CX = X - 23 + mx;
  const CY = Y + S / 2 + my;
  const LABEL = 16.3;
  const point = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  };
  /** a wedge of the grooves' sheen, centred on `deg`, `half` either side */
  const wedge = (deg: number, half: number) =>
    `M${CX} ${CY}L${point(deg - half, R)}A${R} ${R} 0 0 1 ${point(deg + half, R)}Z`;
  /** the grooves: fine rings from the dead wax out to the lead-in */
  const grooves = Array.from({ length: 30 }, (_, i) => 19.6 + i * 0.9);
  /** the gaps between tracks, a touch lighter than the grooves */
  const gaps = [24.2, 29.6, 35.3, 41.1];
  return (
    <svg viewBox="0 8 200 128" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${id}-edge`} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <linearGradient id={`${id}-cover`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--art-hue), white 8%)" }} />
          <stop offset="1" style={{ stopColor: hue(42) }} />
        </linearGradient>
        <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6efe1" />
          <stop offset="1" stopColor="#d9ccb2" />
        </linearGradient>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e9e3d6" />
        </linearGradient>
        <radialGradient id={`${id}-vinyl`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#323a41" />
          <stop offset="0.55" stopColor="#181d21" />
          <stop offset="1" stopColor="#0c0f12" />
        </radialGradient>
        <radialGradient id={`${id}-label`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#e3d7bf" />
        </radialGradient>
        <clipPath id={`${id}-grooveArea`}>
          <circle cx={CX} cy={CY} r={R - 0.8} />
        </clipPath>
      </defs>

      <g className="ship-art-ground">
        {/* the two sleeves' footprint, and the record's, a little off the floor */}
        <BoxShadow x={X} y={Y + S} w={S} k={BACK + T} cast={14} filter={u("soft")} />
        <ellipse cx={CX + 4} cy={Y + S} rx="34" ry="3" style={{ fill: "var(--art-ink)" }} opacity="0.22" filter={u("blur")} />
      </g>

      <g className="ship-art-lift">
        {/* the sleeve behind: cream, a band of the chapter's blue along its top */}
        <path d={`M${X + bx + S} ${Y + by}l${tx} ${ty}v${S}l${-tx} ${-ty}Z`} fill="#cdbfa3" />
        <path d={`M${X + bx} ${Y + by}h${S}l${tx} ${ty}h${-S}Z`} fill="#fbf6ec" />
        <rect x={X + bx} y={Y + by} width={S} height={S} rx="1.5" fill={u("cream")} />
        <rect x={X + bx} y={Y + by + 3.5} width={S} height="4" style={{ fill: hue(25) }} />

        {/* the front sleeve's top and its open side */}
        <path d={`M${X} ${Y}h${S}l${tx} ${ty}h${-S}Z`} style={{ fill: "var(--art-hue-top)" }} />
        <path d={`M${X + S} ${Y}l${tx} ${ty}v${S}l${-tx} ${-ty}Z`} style={{ fill: "var(--art-hue-side)" }} />

        {/* the paper inner sleeve, pulled out a little way behind the record */}
        <rect x={X - 16 + mx} y={Y + 1.5 + my} width="100" height={S - 3} rx="2.5" fill={u("paper")} />

        {/* the record */}
        <circle cx={CX} cy={CY} r={R} fill={u("vinyl")} />
        <g clipPath={u("grooveArea")}>
          {grooves.map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#fff" strokeOpacity="0.035" strokeWidth="0.4" />
          ))}
          {gaps.map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#fff" strokeOpacity="0.13" strokeWidth="0.55" />
          ))}
          {/* the sheen across the grooves: toward the light and away */}
          <path d={wedge(225, 13) + wedge(45, 13)} fill="#fff" opacity="0.2" filter={u("blur")} />
          <path d={wedge(225, 30) + wedge(45, 30)} fill="#fff" opacity="0.06" filter={u("blur")} />
        </g>
        {/* the lead-in's lighter rim, and the edge */}
        <circle cx={CX} cy={CY} r={R - 0.9} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.8" />
        <circle cx={CX} cy={CY} r={R - 0.2} fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="0.5" />
        {/* the dead wax: smoother, a shade lighter, around the label */}
        <circle cx={CX} cy={CY} r={LABEL + 2.6} fill="#20262b" />
        <circle cx={CX} cy={CY} r={LABEL + 2.6} fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="0.5" />
        {/* the label: cream, a printed ring, its lines of type, the hole */}
        <circle cx={CX} cy={CY} r={LABEL} fill={u("label")} />
        <circle cx={CX} cy={CY} r={LABEL - 1.8} fill="none" style={{ stroke: hue(30) }} strokeOpacity="0.55" strokeWidth="0.7" />
        <path
          d={`M${CX - 7} ${CY - 7}H${CX + 7}M${CX - 4.5} ${CY - 4}H${CX + 4.5}M${CX - 6} ${CY + 5}H${CX + 6}M${CX - 3.5} ${CY + 8}H${CX + 3.5}`}
          style={{ stroke: "var(--art-ink)" }}
          strokeOpacity="0.4"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r="1.1" fill="#bfb398" />

        {/* the sleeve's edge, where the record comes out from under it */}
        <path d={`M${X - 0.5} ${Y + 2}V${Y + S - 2}`} stroke="#000" strokeOpacity="0.35" strokeWidth="1.6" filter={u("edge")} />

        {/* the front sleeve: the chapter's blue, lit from the top left, the
            ring the record has worn into it, its title */}
        <rect x={X} y={Y} width={S} height={S} rx="1.5" fill={u("cover")} />
        <circle cx={X + S / 2} cy={Y + S / 2} r={R - 1} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.6" />
        <path d={`M${X + 12} ${Y + 14}H${X + 46}M${X + 12} ${Y + 20}H${X + 32}`} stroke="#fdf8ee" strokeOpacity="0.85" strokeWidth="2.6" strokeLinecap="round" />
        <path d={`M${X + 0.8} ${Y + 1}V${Y + S - 1}`} stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
      </g>
    </svg>
  );
}
