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

/** a bowl's outer wall, from its rim's front edge down to its foot */
function bowlWall(cx: number, rim: number) {
  return (
    `M${cx - 62} ${rim}A62 12 0 0 0 ${cx + 62} ${rim}` +
    `C${cx + 62} ${rim + 30} ${cx + 46} ${rim + 47} ${cx + 30} ${rim + 51}V${rim + 56}H${cx - 30}V${rim + 51}` +
    `C${cx - 46} ${rim + 47} ${cx - 62} ${rim + 30} ${cx - 62} ${rim}Z`
  );
}

/**
 * Home & kitchen: a dome table lamp lit, three bowls stacked, and an enamel
 * pot with its lid on and a checked tea towel hanging over its front.
 */
export function HomeObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const BOWLS = { cx: 274, rims: [228, 246, 264] };
  return (
    <svg viewBox="0 36 580 296" className={cn("ship-art block overflow-visible", className)} aria-hidden>
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
          <ellipse cx="112" cy="318" rx="64" ry="7" opacity="0.26" />
          <ellipse cx="278" cy="320" rx="46" ry="6" opacity="0.26" />
          <ellipse cx="458" cy="320" rx="98" ry="8" opacity="0.3" />
        </g>
      </g>

      <g className="ship-art-lift">
        {/* the lamp: its base, the stem, the warm light under the dome */}
        <path d="M50 304A54 11 0 0 0 158 304V311A54 11 0 0 1 50 311Z" fill={BRASS.shade} />
        <ellipse cx="104" cy="304" rx="54" ry="11" fill={u("brassTop")} />
        <ellipse cx="104" cy="303" rx="30" ry="5" fill="#fff4cc" opacity="0.55" filter={u("blur")} />
        <rect x="99.5" y="132" width="9" height="174" fill={u("brass")} />
        <rect x="95" y="128" width="18" height="12" rx="4" fill={u("brass")} />
        <ellipse cx="104" cy="148" rx="58" ry="12" fill={u("glow")} />
        <path d="M18 138C18 78 52 44 104 44C156 44 190 78 190 138A86 10 0 0 1 18 138Z" fill={u("shade")} />
        <path d="M18 138A86 10 0 0 0 190 138" fill="none" stroke="#fff3d0" strokeWidth="3" />
        <ellipse cx="72" cy="78" rx="24" ry="14" fill="#fff" opacity="0.5" filter={u("blur")} />

        {/* the bowls, nested: the top one's inside, then each wall over the
            one sitting in it */}
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

        {/* the pot: its handles, its wall, the towel over its front, its lid */}
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

/** a book's depth, the doorstep's projection made steeper so a cover
 *  reads as one: k across, 0.6k up */
const BOOK_DEPTH = 0.6;

/** a hardcover lying flat: its front (the spine, or the page edges with the
 *  boards over and under them), its top cover, and its pages on the right */
function Book({
  x,
  y,
  w,
  h,
  k,
  front,
  top,
  board,
  pages,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  k: number;
  front: string;
  top: string;
  board: string;
  pages: string;
}) {
  const dy = k * BOOK_DEPTH;
  return (
    <>
      <path d={`M${x} ${y}L${x + k} ${y - dy}H${x + w + k}L${x + w} ${y}Z`} fill={top} />
      {/* the page block on the right, between the boards */}
      <path d={`M${x + w} ${y}L${x + w + k} ${y - dy}V${y + h - dy}L${x + w} ${y + h}Z`} fill={board} />
      <path d={`M${x + w} ${y + 3}L${x + w + k - 3} ${y - dy + 4.8}V${y + h - dy - 3.2}L${x + w} ${y + h - 3}Z`} fill={pages} />
      <rect x={x} y={y} width={w} height={h} rx="3" fill={front} />
    </>
  );
}

/**
 * Books: three hardcovers stacked, each set back a little on the one under
 * it, the middle one's ribbon a lime marker hanging over the front: the
 * one lime in the bento, the brand's mark (DESIGN.md, The One-Voice Rule).
 */
export function BooksObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const teal = (n: number) => `color-mix(in oklab, var(--art-hue), var(--art-ink) ${n}%)`;
  return (
    <svg viewBox="12 40 240 152" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        {/* page edges: fine lines along the face, level on the front and
            along the depth on the side */}
        <pattern id={`${id}-leaves`} width="6" height="3" patternUnits="userSpaceOnUse">
          <rect width="6" height="3" fill="#fbf8f1" />
          <path d="M0 2.5H6" stroke="#000" strokeOpacity="0.07" strokeWidth="0.8" />
        </pattern>
        <pattern id={`${id}-leavesSide`} width="6" height="3" patternUnits="userSpaceOnUse" patternTransform="skewY(-31)">
          <rect width="6" height="3" fill="#f3eee3" />
          <path d="M0 2.5H6" stroke="#000" strokeOpacity="0.08" strokeWidth="0.8" />
        </pattern>
        <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3ebda" />
          <stop offset="1" stopColor="#d6c8ac" />
        </linearGradient>
        <linearGradient id={`${id}-tealSpine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: teal(48) }} />
          <stop offset="1" style={{ stopColor: teal(82) }} />
        </linearGradient>
        <linearGradient id={`${id}-tealTop`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: teal(34) }} />
          <stop offset="1" style={{ stopColor: teal(60) }} />
        </linearGradient>
        <linearGradient id={`${id}-skyBoard`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--art-hue), white 55%)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--art-hue), var(--art-ink) 25%)" }} />
        </linearGradient>
        {/* a spine rounds: lit along its top, shaded under */}
        <linearGradient id={`${id}-round`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      <g className="ship-art-ground">
        <ellipse cx="146" cy="184" rx="118" ry="7" filter={u("soft")} style={{ fill: "var(--art-ink)" }} opacity="0.26" />
      </g>

      <g className="ship-art-lift">
        {/* the bottom one: cream cloth, its spine to the front with two bands */}
        <Book x={20} y={150} w={160} h={34} k={64} front={u("cream")} top="#f6f0e3" board="#d6c8ac" pages={u("leavesSide")} />
        <rect x={20} y={150} width={160} height={34} rx="3" fill={u("round")} />
        <path d="M36 152V182M164 152V182" style={{ stroke: "var(--art-ink)" }} strokeOpacity="0.5" strokeWidth="3" />
        <rect x={74} y={164} width={52} height={5} rx="2.5" style={{ fill: "var(--art-ink)" }} opacity="0.3" />
        <ellipse cx="110" cy="146" rx="78" ry="3" fill="#000" opacity="0.22" filter={u("blur")} />

        {/* the middle one, its page edges to the front between sky boards */}
        <Book x={36} y={114} w={146} h={30} k={56} front={u("skyBoard")} top="color-mix(in oklab, var(--art-hue), white 62%)" board={u("skyBoard")} pages={u("leavesSide")} />
        <rect x={38} y={117} width={142} height={24} rx="1.5" fill={u("leaves")} />
        <ellipse cx="114" cy="112" rx="72" ry="3" fill="#000" opacity="0.22" filter={u("blur")} />

        {/* the top one: the chapter's blue, a cream label on its spine */}
        <Book x={44} y={78} w={140} h={32} k={50} front={u("tealSpine")} top={u("tealTop")} board={teal(70)} pages={u("leavesSide")} />
        <rect x={44} y={78} width={140} height={32} rx="3" fill={u("round")} />
        <rect x={88} y={86} width={52} height={16} rx="2" fill="#f6f0e3" />
        <path d="M96 92H132M100 97H128" style={{ stroke: "var(--art-ink)" }} strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />

        {/* the ribbon, out of the middle one's pages and over the front */}
        <path d="M150 128H160V181L155 176L150 181Z" fill="#c1ff00" />
        <path d="M150 128H153V178.4L150 181Z" fill="#a3d600" />
      </g>
    </svg>
  );
}

/** where 121 cm falls, and the guitar's length against it (an acoustic is
 *  about 104 cm), in the picture's px: the measure in ShipTiles reads these */
export const HOBBY_MEASURE = { mark: 258, guitar: 222 };

/**
 * Sports & hobbies, drawn at 1:1 in px (270 × 170): an acoustic guitar on
 * its back, body to the left, its length against the 121 cm measure; a
 * badminton racket lying in front, a shuttlecock and a golf ball by it.
 */
export function HobbyObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  const blue = (n: number) => ({ stopColor: `color-mix(in oklab, var(--art-hue), var(--art-ink) ${n}%)` });
  // the body seen from above: lower bout, waist, upper bout, into the neck
  const body =
    "M0 92C0 74 12 63.3 26 63.3C40 63.3 48 71 62 73.8C72 76 78 69.6 86 69.6C98 69.6 106 76 108 83.6" +
    "V100.4C106 108 98 114.4 86 114.4C78 114.4 72 108 62 110.2C48 113 40 120.7 26 120.7C12 120.7 0 110 0 92Z";
  // frets from the nut toward the body, closer as they climb
  const frets = Array.from({ length: 12 }, (_, i) => 190 - 160 * (1 - 2 ** (-(i + 1) / 12)));
  return (
    <svg viewBox="0 0 270 170" width="270" height="170" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <radialGradient id={`${id}-top`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0" style={blue(22)} />
          <stop offset="0.6" style={blue(50)} />
          <stop offset="1" style={blue(72)} />
        </radialGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6a3f" />
          <stop offset="1" stopColor="#6e4527" />
        </linearGradient>
        <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d3d9df" />
        </radialGradient>
        <clipPath id={`${id}-strings`}>
          <ellipse cx="0" cy="0" rx="21" ry="11" />
        </clipPath>
      </defs>

      <g className="ship-art-ground">
        <g filter={u("soft")} style={{ fill: "var(--art-ink)" }}>
          <ellipse cx="112" cy="126" rx="114" ry="6" opacity="0.24" />
          <ellipse cx="88" cy="158" rx="70" ry="5" opacity="0.22" />
          <ellipse cx="226" cy="160" rx="34" ry="4" opacity="0.22" />
        </g>
      </g>

      <g className="ship-art-lift">
        {/* the guitar: its side under the top, the top with its binding */}
        <path d={body} transform="translate(0 8)" style={{ fill: "color-mix(in oklab, var(--art-hue), var(--art-ink) 84%)" }} />
        <path d={body} fill={u("top")} stroke="#f6f0e3" strokeWidth="1.8" />
        <ellipse cx="74" cy="92" rx="14" ry="10" fill="none" stroke="#f6f0e3" strokeWidth="2" />
        <ellipse cx="74" cy="92" rx="10.5" ry="7.5" fill="#1d2a33" />
        <rect x="24" y="84" width="7" height="16" rx="2" fill="#3b2a20" />
        {/* the neck, its side, the fretboard and frets; the headstock and pegs */}
        <rect x="106" y="96.5" width="86" height="4.5" fill="#6e4527" />
        <rect x="106" y="87.5" width="86" height="9" fill="#3b2a20" />
        {frets.map((x) => (
          <path key={x} d={`M${x} 87.5V96.5`} stroke="#c9ced4" strokeWidth="1" />
        ))}
        <rect x="189" y="87" width="2.5" height="10" fill="#f6f0e3" />
        <path d="M191 90.5L219 88.5Q222 88.5 222 91V102Q222 104.5 219 104.5L191 102.5Z" fill="#5a3820" />
        <path d="M191 86L219 83Q222 83 222 86V97Q222 100 219 100L191 97Z" fill={u("wood")} />
        {[198, 206, 214].map((x) => (
          <g key={x}>
            {/* the tuners stand off the headstock's edges, which close in
                toward its tip */}
            <ellipse cx={x} cy={86 - ((x - 191) * 3) / 28 - 1} rx="2.6" ry="2" fill="#e4e8ec" />
            <ellipse cx={x} cy={102.5 + ((x - 191) * 2) / 28 + 1.5} rx="2.6" ry="2" fill="#c9ced4" />
          </g>
        ))}
        {/* six strings, bridge to nut */}
        {[-5, -3, -1, 1, 3, 5].map((k) => (
          <path key={k} d={`M28 ${92 + k}L190 ${92 + k * 0.7}`} stroke="#e8edf1" strokeWidth="0.7" />
        ))}

        {/* the racket, lying in front: its head strung, the shaft, the grip */}
        <g transform="rotate(-9 40 146)">
          <ellipse cx="40" cy="146" rx="25" ry="15" fill="#fff" opacity="0.25" />
          <g transform="translate(40 146)" clipPath={`url(#${id}-strings)`}>
            {Array.from({ length: 11 }, (_, i) => -20 + i * 4).map((d) => (
              <g key={d}>
                <path d={`M${d} -16V16`} stroke="#fff" strokeOpacity="0.85" strokeWidth="0.6" />
                <path d={`M-24 ${d * 0.6}H24`} stroke="#fff" strokeOpacity="0.85" strokeWidth="0.6" />
              </g>
            ))}
          </g>
          <ellipse cx="40" cy="146" rx="23" ry="13" fill="none" style={{ stroke: "var(--art-ink)" }} strokeWidth="3.5" />
          <path d="M62 143L70 146L62 149Z" style={{ fill: "var(--art-ink)" }} />
          <path d="M69 146H120" stroke="#8d99a3" strokeWidth="2" />
          <rect x="118" y="142.8" width="34" height="6.4" rx="3.2" fill="#f6f0e3" />
          <path d="M126 143V149M134 143V149M142 143V149" style={{ stroke: "var(--art-ink)" }} strokeOpacity="0.3" strokeWidth="1.2" />
        </g>

        {/* a shuttlecock on its side, cork to the left, and a golf ball */}
        <path d="M187 152L208 145Q211 156 208 167L187 160Z" fill="#fbfcfd" />
        <path d="M188 154L208 148M188 156L209 156M188 158L208 164" stroke="#b9c2ca" strokeWidth="0.8" />
        <ellipse cx="208" cy="156" rx="3.5" ry="11" fill="none" stroke="#c9d0d6" strokeWidth="1.2" />
        <path d="M187 151.5A6 6 0 0 0 187 160.5Z" fill="#f6f0e3" />
        <circle cx="184" cy="156" r="5.5" fill="#efe3cc" />
        <rect x="186" y="151" width="2.5" height="10" style={{ fill: "var(--art-ink)" }} opacity="0.6" />
        <circle cx="236" cy="153" r="8.5" fill={u("ball")} />
        {[
          [233, 149],
          [238, 150],
          [235, 154],
          [240, 155],
          [232, 156],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#000" opacity="0.1" />
        ))}
      </g>
    </svg>
  );
}

/** a case's depth: k across, 0.6k up, as the books' */
const CASE_DEPTH = 0.6;

/**
 * Anything else: a record player, its lid up, a record on the platter and
 * the tonearm at rest. The things on its deck are drawn in plan and laid
 * onto the deck's face (one shear), so the record sits flat on it.
 */
export function RecordPlayerObjects({ className }: { className?: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `url(#${id}-${name})`;
  // the case: its front's top-left corner, its width, height and depth
  const X = 10;
  const Y = 104;
  const W = 124;
  const H = 26;
  const K = 70;
  const dy = K * CASE_DEPTH;
  const LID = 58;
  // plan (x across, z into the deck) onto the deck's face
  const deck = `matrix(1 0 1 ${-CASE_DEPTH} ${X} ${Y})`;
  return (
    <svg viewBox="0 -4 210 140" className={cn("ship-art block overflow-visible", className)} aria-hidden>
      <defs>
        <filter id={`${id}-soft`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f0e2" />
          <stop offset="1" stopColor="#dccfb6" />
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6efe1" />
          <stop offset="1" stopColor="#e2d6bf" />
        </linearGradient>
        <radialGradient id={`${id}-vinyl`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#3a4249" />
          <stop offset="1" stopColor="#14191d" />
        </radialGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f4f6" />
          <stop offset="1" stopColor="#9aa4ad" />
        </linearGradient>
      </defs>

      <g className="ship-art-ground">
        <ellipse cx="108" cy="132" rx="96" ry="6" filter={u("soft")} style={{ fill: "var(--art-ink)" }} opacity="0.28" />
      </g>

      <g className="ship-art-lift">
        {/* the lid, up on its hinges at the deck's back edge: its inside */}
        <path
          d={`M${X + K} ${Y - dy}L${X + K + 8} ${Y - dy - LID}H${X + K + W + 8}L${X + K + W} ${Y - dy}Z`}
          fill={u("lid")}
        />
        <path
          d={`M${X + K + 7} ${Y - dy - 5}L${X + K + 13} ${Y - dy - LID + 6}H${X + K + W + 3}L${X + K + W - 3} ${Y - dy - 5}Z`}
          fill="#000"
          opacity="0.06"
        />
        {/* the deck, the case's right side, its front */}
        <path d={`M${X} ${Y}L${X + K} ${Y - dy}H${X + K + W}L${X + W} ${Y}Z`} fill="#f9f4ea" />
        <path d={`M${X + K} ${Y - dy}H${X + K + W}`} stroke="#000" strokeOpacity="0.12" strokeWidth="3" filter={u("blur")} />
        <path d={`M${X + W} ${Y}L${X + W + K} ${Y - dy}V${Y + H - dy}L${X + W} ${Y + H}Z`} fill="#d3c4a7" />
        <rect x={X} y={Y} width={W} height={H} rx="3" fill={u("front")} />
        {/* the knobs and the speaker grille on its front */}
        <path d={`M${X + 12} ${Y + 9}H${X + 54}M${X + 12} ${Y + 13}H${X + 54}M${X + 12} ${Y + 17}H${X + 54}`} stroke="#000" strokeOpacity="0.12" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx={X + 96} cy={Y + 13} r="4.5" fill={u("metal")} />
        <circle cx={X + 110} cy={Y + 13} r="4.5" fill={u("metal")} />

        {/* on the deck: the platter, the record, its label, the tonearm */}
        <g transform={deck}>
          <circle cx="50" cy="36" r="31" fill="#000" opacity="0.18" />
          <circle cx="49" cy="35" r="31" fill="#2a3036" />
          <circle cx="49" cy="35" r="29" fill={u("vinyl")} />
          {[24, 19, 14].map((r) => (
            <circle key={r} cx="49" cy="35" r={r} fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="0.8" />
          ))}
          <circle cx="49" cy="35" r="9" style={{ fill: "color-mix(in oklab, var(--art-hue), var(--art-ink) 30%)" }} />
          <circle cx="49" cy="35" r="1.6" fill="#e4e8ec" />
          <circle cx="104" cy="56" r="7" fill={u("metal")} />
          <path d="M104 56L98 30Q96 20 84 16" fill="none" stroke="#c9d0d6" strokeWidth="2.6" strokeLinecap="round" />
          <rect x="78" y="12" width="9" height="6" rx="1.5" fill="#6b747c" transform="rotate(-18 82 15)" />
        </g>
      </g>
    </svg>
  );
}
