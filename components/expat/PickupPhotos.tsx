"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EXPAT_PICKUP_PHOTOS } from "@/lib/data/expat";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

const PHOTOS = EXPAT_PICKUP_PHOTOS;
const N = PHOTOS.length;
/** horizontal travel (px) that turns a touch into a swipe rather than a tap */
const SWIPE = 40;
/** how long a mouse rests on a slice before it opens, so a pass across the
 *  row on the way somewhere else doesn't ripple it open and shut */
const HOVER_INTENT = 90;

/* ---- the three layouts on offer (temporary) ------------------------------
   Rimkirim is choosing how the pickup photos sit in "Why Rimkirim":
   ?pickup=a (contact sheet), b (reel) or c (slices). Once one is picked, the
   other two and this switch go. */
export type PickupLayout = "a" | "b" | "c";
const DEFAULT_LAYOUT: PickupLayout = "c";
// the query string never changes under a mounted page (as in ReviewNote)
const subscribe = () => () => {};
const readLayout = (): PickupLayout => {
  const v = new URLSearchParams(window.location.search).get("pickup");
  return v === "a" || v === "b" || v === "c" ? v : DEFAULT_LAYOUT;
};
export function usePickupLayout() {
  return React.useSyncExternalStore(subscribe, readLayout, () => DEFAULT_LAYOUT);
}

/** the block's label, in the lists' own h3 voice beside or above it */
function PickupsHeading({ className }: { className?: string }) {
  const t = useT();
  return (
    <h3
      id="pickups-heading"
      className={cn("font-display text-xs font-medium uppercase tracking-[0.04em] text-muted", className)}
    >
      {t("expat.pickups.label")}
    </h3>
  );
}

/* ---- A: the contact sheet ------------------------------------------------ */

/**
 * All six prints at once and small, in the column the photo slot held: 2 by
 * 3 beside the lists at lg, six in a row under them from sm, 3 by 2 on a
 * phone. The words stay the band's subject and the prints its evidence; a
 * print opens the viewer for a closer look.
 */
export function PickupSheet({ className }: { className?: string }) {
  const t = useT();
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <div className={className}>
      <PickupsHeading />
      <ul aria-labelledby="pickups-heading" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3 lg:grid-cols-2">
        {PHOTOS.map((p, i) => (
          <li key={p.src}>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`${t("expat.pickups.open")}: ${t(`expat.pickups.${p.alt}`)}`}
              onClick={() => setOpen(i)}
              className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2"
            >
              <Image
                src={p.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 160px, (min-width: 640px) 16vw, 31vw"
                className="object-cover"
              />
              {/* a mouse learns that a print opens before it clicks: the
                  chip fades in on hover, colour channel only */}
              <span
                aria-hidden
                className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-full bg-background text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Expand className="size-3.5" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <PickupViewer index={open} onIndexChange={setOpen} />
    </div>
  );
}

/**
 * The sheet's viewer: the media lightbox (a centred modal at every size),
 * stepping through the six with the buttons, the arrow keys or a swipe.
 */
function PickupViewer({
  index,
  onIndexChange,
}: {
  index: number | null;
  onIndexChange: (i: number | null) => void;
}) {
  const t = useT();
  const i = index ?? 0;
  const p = PHOTOS[i];
  const caption = t(`expat.pickups.${p.alt}`);
  const go = (dir: 1 | -1) => onIndexChange((i + dir + N) % N);
  const touch = React.useRef<{ x: number; y: number } | null>(null);

  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogContent
        sheet={false}
        className="w-auto max-w-none p-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          else if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="pr-8 text-base font-medium sm:text-base">{t("expat.pickups.label")}</DialogTitle>
          <DialogDescription className="sr-only">{t("expat.pickups.viewerHint")}</DialogDescription>
        </DialogHeader>
        {/* as wide as the screen, 28rem, or the height left under the
            header and caption allows, whichever is least; the caption wraps
            to the photo's width rather than widening the panel past it */}
        <figure className="w-[min(calc(100vw_-_1.5rem),28rem,calc((90dvh_-_8.5rem)*0.8))]">
          <div
            className="relative aspect-[4/5] w-full touch-pan-y select-none bg-surface-2"
            onPointerDown={(e) => {
              touch.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              const s = touch.current;
              touch.current = null;
              if (!s) return;
              const dx = e.clientX - s.x;
              if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
            }}
          >
            <Image
              key={p.src}
              src={p.src}
              alt={caption}
              fill
              sizes="28rem"
              draggable={false}
              className="object-cover"
            />
          </div>
          <figcaption className="flex items-center gap-3 px-5 py-3 sm:px-6">
            <p aria-live="polite" className="min-w-0 flex-1 text-sm leading-snug">
              {caption}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("expat.photos.prev")}
                onClick={() => go(-1)}
              >
                <ChevronLeft />
              </Button>
              <span aria-hidden className="min-w-10 text-center text-xs tabular-nums text-muted">
                {i + 1} / {N}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("expat.photos.next")}
                onClick={() => go(1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </figcaption>
        </figure>
      </DialogContent>
    </Dialog>
  );
}

/* ---- the strip: B's reel at every width, C's on a phone ------------------ */

/** a keyboard press moves without motion (PRODUCT.md), and so does
 *  everything under reduced motion */
function scrollBehavior(instant: boolean): ScrollBehavior {
  return instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/** where each print snaps to. The first print sits on the scroll padding at
 *  0, so each one snaps at its distance from the first (the reel's padding
 *  is a max() of a percentage, which getComputedStyle leaves unresolved) */
function snapLefts(el: HTMLElement) {
  const slides = Array.from(el.children) as HTMLElement[];
  const first = slides[0]?.offsetLeft ?? 0;
  const max = el.scrollWidth - el.clientWidth;
  return slides.map((s) => Math.min(max, Math.max(0, s.offsetLeft - first)));
}

/** the strip's state and moves; the list's ref stays with its owner, since
 *  a ref read during render never updates it */
function useStrip(ref: React.RefObject<HTMLUListElement | null>) {
  const [active, setActive] = React.useState(0);
  const [edges, setEdges] = React.useState({ atStart: true, atEnd: false });
  const [dragging, setDragging] = React.useState(false);
  const drag = React.useRef<{ x: number; left: number } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // the position row follows whichever print is most in view
    const slides = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(slides.indexOf(entry.target as HTMLElement));
        }
      },
      { root: el, threshold: 0.6 },
    );
    slides.forEach((s) => io.observe(s));
    // the step buttons rest at either end
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = el.scrollWidth - el.clientWidth;
        setEdges({ atStart: el.scrollLeft <= 2, atEnd: el.scrollLeft >= max - 2 });
      });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [ref]);

  /** one print along, or back */
  const step = (dir: 1 | -1, instant: boolean) => {
    const el = ref.current;
    if (!el) return;
    const lefts = snapLefts(el);
    const target =
      dir > 0
        ? lefts.find((l) => l > el.scrollLeft + 2)
        : [...lefts].reverse().find((l) => l < el.scrollLeft - 2);
    if (target !== undefined) el.scrollTo({ left: target, behavior: scrollBehavior(instant) });
  };

  const goTo = (i: number) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: snapLefts(el)[i], behavior: scrollBehavior(false) });
  };

  // a mouse drags the strip the way a finger swipes it. Snapping is off
  // while the strip follows the pointer, then the strip settles on the
  // nearest print and snapping comes back once it has
  const dragHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLUListElement>) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
      drag.current = { x: e.clientX, left: el.scrollLeft };
      el.setPointerCapture(e.pointerId);
      setDragging(true);
    },
    onPointerMove: (e: React.PointerEvent<HTMLUListElement>) => {
      const el = ref.current;
      if (el && drag.current) el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    },
    onPointerUp: (e: React.PointerEvent<HTMLUListElement>) => endDrag(e),
    onPointerCancel: (e: React.PointerEvent<HTMLUListElement>) => endDrag(e),
  };
  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    const el = ref.current;
    if (!el || !drag.current) return;
    drag.current = null;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    const lefts = snapLefts(el);
    const nearest = lefts.reduce((a, b) => (Math.abs(b - el.scrollLeft) < Math.abs(a - el.scrollLeft) ? b : a));
    const settle = () => setDragging(false);
    if (Math.abs(nearest - el.scrollLeft) < 1) return settle();
    el.addEventListener("scrollend", settle, { once: true });
    // a browser without scrollend lets go after the glide's length
    window.setTimeout(settle, 600);
    el.scrollTo({ left: nearest, behavior: scrollBehavior(false) });
  };

  return { active, dragging, dragHandlers, step, goTo, ...edges };
}

type Strip = ReturnType<typeof useStrip>;

/**
 * The prints in one swipeable row, each captioned. `band` runs the row the
 * band's whole width: the first print starts on the content's left edge
 * and the row runs off the band's right one, so the cut print says there
 * is more (globals.css, .pickup-reel). `inset` is the house strip inside the
 * content column (DESIGN.md, Card grid → scroll strip).
 */
function PickupStrip({
  listRef,
  strip,
  bleed,
  className,
}: {
  listRef: React.RefObject<HTMLUListElement | null>;
  strip: Strip;
  bleed: "band" | "inset";
  className?: string;
}) {
  const t = useT();
  return (
    <div className={className}>
      <ul
        ref={listRef}
        tabIndex={0}
        aria-labelledby="pickups-heading"
        data-dragging={strip.dragging || undefined}
        {...strip.dragHandlers}
        className={cn(
          "scroll-strip relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40",
          bleed === "band" ? "pickup-reel pointer-fine:cursor-grab" : "-mx-4 scroll-px-4 px-4",
        )}
      >
        {PHOTOS.map((p) => (
          <li key={p.src} className="w-[78%] shrink-0 snap-start sm:w-[40%] lg:w-[18.5rem]">
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-background">
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 296px, (min-width: 640px) 40vw, 78vw"
                  draggable={false}
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 pr-2 text-sm leading-snug text-muted">
                {t(`expat.pickups.${p.alt}`)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {/* the house position row: a phone sees one print and a peek, so six
          need a "where am I" (DESIGN.md, Card grid → scroll strip) */}
      <div className="mt-2 flex justify-center sm:hidden">
        {PHOTOS.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => strip.goTo(i)}
            aria-label={t("expat.photos.position").replace("{n}", String(i + 1)).replace("{total}", String(N))}
            aria-current={i === strip.active}
            className="grid h-11 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          >
            <span
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === strip.active ? "bg-foreground" : "bg-border-strong",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- B: the reel --------------------------------------------------------- */

/**
 * Bigger prints in a row under the lists, running the band's full width.
 * Swipe it, drag it with a mouse, or step through with the buttons. It
 * never moves on its own: the page's one loop is the hero's departure
 * board (DESIGN.md, Motion).
 */
export function PickupReel({ className }: { className?: string }) {
  const t = useT();
  const list = React.useRef<HTMLUListElement>(null);
  const strip = useStrip(list);
  return (
    <div className={className}>
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4 sm:px-6">
        <PickupsHeading />
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={t("expat.photos.prev")}
            disabled={strip.atStart}
            onClick={(e) => strip.step(-1, e.detail === 0)}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={t("expat.photos.next")}
            disabled={strip.atEnd}
            onClick={(e) => strip.step(1, e.detail === 0)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <PickupStrip listRef={list} strip={strip} bleed="band" className="mt-5" />
    </div>
  );
}

/* ---- C: the slices ------------------------------------------------------- */

/**
 * All six in one row: one print open to its full 4:5, the others slivers of
 * themselves sharing what is left. Resting the mouse on a sliver opens it,
 * and so does a click, a tap or Enter; the open print wears its caption as
 * a label. Below sm six slivers have no room, so a phone gets the strip.
 */
export function PickupSlices({ className }: { className?: string }) {
  const t = useT();
  const list = React.useRef<HTMLUListElement>(null);
  const strip = useStrip(list);
  const [open, setOpen] = React.useState(0);
  const [instant, setInstant] = React.useState(false);
  const intent = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(intent.current), []);

  return (
    <div className={className}>
      <PickupsHeading />
      <ul
        aria-labelledby="pickups-heading"
        data-instant={instant || undefined}
        className="pickup-slices mt-5 hidden sm:flex"
      >
        {PHOTOS.map((p, i) => {
          const caption = t(`expat.pickups.${p.alt}`);
          return (
            <li
              key={p.src}
              data-open={i === open || undefined}
              className="pickup-slice relative overflow-hidden rounded-md bg-background outline-offset-2 outline-foreground/60 has-[:focus-visible]:outline-2"
            >
              <button
                type="button"
                aria-pressed={i === open}
                aria-label={caption}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  window.clearTimeout(intent.current);
                  intent.current = window.setTimeout(() => {
                    setInstant(false);
                    setOpen(i);
                  }, HOVER_INTENT);
                }}
                onPointerLeave={() => window.clearTimeout(intent.current)}
                onClick={(e) => {
                  setInstant(e.detail === 0);
                  setOpen(i);
                }}
                className="absolute inset-0 cursor-pointer focus-visible:outline-none"
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 336px, 288px"
                  draggable={false}
                  className="object-cover"
                />
              </button>
              <p
                aria-hidden
                className="pickup-slice-label pointer-events-none absolute bottom-3 left-3 rounded-sm bg-background px-3 py-2 text-xs leading-snug text-foreground"
              >
                {caption}
              </p>
            </li>
          );
        })}
      </ul>
      <PickupStrip listRef={list} strip={strip} bleed="inset" className="mt-5 sm:hidden" />
    </div>
  );
}
