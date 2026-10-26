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
/** horizontal travel (px) that turns a touch into a swipe rather than a tap */
const SWIPE = 40;

/**
 * Real shipments, as a pile of prints: one 5:4 card on top and two peeking
 * behind it, at every width (the hero used to switch frames between phone
 * and desktop). Click or tap the pile for the next photo, swipe on a phone,
 * or use the buttons, which are also the way in for keyboards and screen
 * readers. Each card's place in the pile is its `data-depth`; the motion is
 * CSS transitions in globals.css (.photo-deck), so a quick second click
 * retargets instead of restarting, and a keyboard press swaps instantly
 * (PRODUCT.md: keyboard-triggered actions never animate).
 */
export function PhotoDeck({ className }: { className?: string }) {
  const t = useT();
  const n = EXPAT_HERO_PHOTOS.length;
  const [active, setActive] = React.useState(0);
  const [instant, setInstant] = React.useState(false);
  const touch = React.useRef<{ x: number; y: number; swiped: boolean } | null>(null);

  const go = (dir: 1 | -1, fromKeyboard: boolean) => {
    setInstant(fromKeyboard);
    setActive((a) => (a + dir + n) % n);
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
      {/* pointer-only shortcuts (tap, click, swipe); keyboards and screen
          readers get the same moves from the buttons below */}
      <div
        className="photo-deck relative aspect-[5/4] w-full cursor-pointer touch-pan-y select-none"
        data-instant={instant || undefined}
        onPointerDown={(e) => {
          touch.current = { x: e.clientX, y: e.clientY, swiped: false };
        }}
        onPointerUp={(e) => {
          const s = touch.current;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
            s.swiped = true;
            go(dx < 0 ? 1 : -1, false);
          }
        }}
        onClick={() => {
          // a swipe already moved the pile; its trailing click must not
          if (touch.current?.swiped) {
            touch.current = null;
            return;
          }
          go(1, false);
        }}
      >
        {EXPAT_HERO_PHOTOS.map((p, i) => {
          const depth = (i - active + n) % n;
          return (
            <div
              key={p.src}
              aria-hidden
              data-depth={depth < SHOWN ? depth : "rest"}
              className="deck-card absolute inset-[5%] rounded-md bg-background p-1.5 shadow-float"
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

      <div className="mt-3 flex items-center justify-between gap-3 px-[5%]">
        <span className="text-xs text-muted-2">{t("expat.photos.caption")}</span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
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
