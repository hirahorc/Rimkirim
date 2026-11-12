"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPAT_HERO_PHOTOS } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/** cards that show in the pile; the rest wait, invisible, at the back */
const SHOWN = 3;
/** how far a press travels (px), mostly sideways, before it is a drag: under
 *  it a tap stays a tap, and the page keeps its own scroll */
const SLOP = 8;
/** let go this far to the side (px) and the top print goes on */
const SWIPE = 40;
/** or flicked this fast (px per ms), however short the pull */
const FLICK = 0.11;
/** how far the print leans as it is pulled aside (deg per px) */
const LEAN = 0.03;

/**
 * Real shipments, as a pile of prints: one 5:4 card on top and two peeking
 * behind it, at every width (the hero used to switch frames between phone
 * and desktop). Click or tap the pile for the next photo, drag or flick the
 * top print aside, or use the buttons, which are also the way in for
 * keyboards and screen readers. Each card's place in the pile is its
 * `data-depth`; the motion is CSS transitions in globals.css (.photo-deck),
 * so a quick second click retargets instead of restarting, and a keyboard
 * press swaps instantly (PRODUCT.md: keyboard-triggered actions never
 * animate).
 *
 * Held, the top print follows the finger one to one, leaning a little the
 * way it is pulled, so the pile answers while the gesture is still being
 * made. Let go past SWIPE, or flicked, it goes on (to the left the next
 * photo, to the right the one before); short of that it settles home. Either
 * way it leaves from where it was let go, on the same transition. One
 * pointer leads: a second finger put down mid-drag is ignored.
 *
 * With `dealAt` the two prints behind the top one are dealt out from under
 * it on load, on `translate` and `rotate` so they never fight the cards'
 * own `transform`; the top print itself stands from the first paint
 * (globals.css, .deck-deal).
 */
export function PhotoDeck({
  dealAt,
  className,
}: {
  /** on load, deal the two prints behind the top one out from under it from
   *  this time (seconds), the nearer one first, then the caption row */
  dealAt?: number;
  className?: string;
}) {
  const t = useT();
  const n = EXPAT_HERO_PHOTOS.length;
  const [active, setActive] = React.useState(0);
  const [instant, setInstant] = React.useState(false);
  /** the press in hand; `card` is the top print once the press is a drag */
  const drag = React.useRef<{ id: number; x: number; y: number; t: number; dx: number; card: HTMLElement | null } | null>(null);
  /** the last press was a drag, so the click trailing it is not a tap */
  const dragged = React.useRef(false);

  const go = (dir: 1 | -1, fromKeyboard: boolean) => {
    setInstant(fromKeyboard);
    setActive((a) => (a + dir + n) % n);
  };

  /** the drag is over: the print gives its transform back to its place in
   *  the pile, and the transition carries it there from where it was left */
  const letGo = (send: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.card) return;
    d.card.removeAttribute("data-dragging");
    d.card.style.transform = "";
    if (send) go(d.dx < 0 ? 1 : -1, false);
  };

  const current = EXPAT_HERO_PHOTOS[active];
  const position = t("expat.photos.position")
    .replace("{n}", String(active + 1))
    .replace("{total}", String(n));

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={t("expat.photos.label")}
      className={cn("w-full", className)}
    >
      {/* pointer-only shortcuts (tap, click, drag); keyboards and screen
          readers get the same moves from the buttons below */}
      <div
        className="photo-deck relative aspect-[5/4] w-full cursor-pointer touch-pan-y select-none"
        data-instant={instant || undefined}
        onPointerDown={(e) => {
          // one pointer leads: a second finger mid-drag would jump the print
          if (drag.current?.card) return;
          dragged.current = false;
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, dx: 0, card: null };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          d.dx = e.clientX - d.x;
          if (!d.card) {
            if (Math.abs(d.dx) < SLOP || Math.abs(d.dx) <= Math.abs(e.clientY - d.y)) return;
            d.card = e.currentTarget.querySelector<HTMLElement>('.deck-card[data-depth="0"]');
            if (!d.card) return;
            dragged.current = true;
            d.card.setAttribute("data-dragging", "");
            // the drag carries on if the pointer leaves the pile
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          // straight onto the print, not through a variable its children
          // would all have to answer to
          d.card.style.transform = `translateX(${d.dx}px) rotate(${d.dx * LEAN}deg)`;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          letGo(Math.abs(d.dx) >= SWIPE || Math.abs(d.dx) / Math.max(e.timeStamp - d.t, 1) > FLICK);
        }}
        // the browser took the gesture for its own scroll: the print goes home
        onPointerCancel={(e) => {
          if (drag.current?.id === e.pointerId) letGo(false);
        }}
        onClick={() => {
          // a drag already moved the pile, or put the print back; the click
          // trailing it must not move it again
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          go(1, false);
        }}
      >
        {EXPAT_HERO_PHOTOS.map((p, i) => {
          const depth = (i - active + n) % n;
          // the two behind the top print at load; by the card's place at
          // load, never its current depth, so a click during the deal
          // cannot retime it
          const dealt = dealAt !== undefined && i > 0 && i < SHOWN;
          return (
            <div
              key={p.src}
              aria-hidden
              data-depth={depth < SHOWN ? depth : "rest"}
              data-deal={dealt ? i : undefined}
              className={cn(
                "deck-card absolute inset-[5%] rounded-md bg-background p-2 shadow-float",
                dealt && "deck-deal",
              )}
              style={dealt ? ({ "--at": `${dealAt + (i - 1) * 0.08}s` } as React.CSSProperties) : undefined}
            >
              <div className="relative size-full overflow-hidden rounded-sm bg-surface-2">
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 432px, 86vw"
                  // the three cards in the pile at load are all on screen
                  // (the two behind it peek), so none waits for lazy loading;
                  // the top one goes first. `priority` is deprecated in Next 16
                  loading={i < SHOWN ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  draggable={false}
                  className="object-cover"
                  style={{ objectPosition: p.position }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* what the top photo shows, for screen readers, read again on change */}
      <p className="sr-only" aria-live="polite">
        {position}: {t(`expat.photos.${current.alt}`)}
      </p>

      <div
        className={cn("mt-3 flex items-center justify-between gap-3 px-4", dealAt !== undefined && "hero-in")}
        style={dealAt !== undefined ? ({ "--at": `${dealAt + 0.45}s` } as React.CSSProperties) : undefined}
      >
        <span className="text-xs text-muted-2">{t("expat.photos.caption")}</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="tap-target relative"
            aria-label={t("expat.photos.prev")}
            onClick={(e) => go(-1, e.detail === 0)}
          >
            <ChevronLeft />
          </Button>
          <span aria-hidden className="min-w-10 text-center text-xs tabular-nums text-muted">
            {active + 1} / {n}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="tap-target relative"
            aria-label={t("expat.photos.next")}
            onClick={(e) => go(1, e.detail === 0)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
