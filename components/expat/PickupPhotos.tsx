"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/shared/Flag";
import { EXPAT_PICKUP_PHOTOS } from "@/lib/data/expat";
import { useLanguage, useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

const PHOTOS = EXPAT_PICKUP_PHOTOS;
const N = PHOTOS.length;
/** every pickup flies to Indonesia */
const DEST = "ID";
/** how long a mouse rests on a slice before it opens, so a pass across the
 *  row on the way somewhere else doesn't ripple it open and shut */
const HOVER_INTENT = 90;

const countryName = (code: string, locale: string) =>
  new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;

/**
 * What a photo says on the page: only where it went, from and to, flag by
 * flag, as on the hero's departure board. What it shows is for screen
 * readers (`described`); a caption narrating the photo told a sighted
 * visitor nothing the photo didn't.
 */
function useRoute() {
  const { t, locale } = useLanguage();
  return (p: (typeof PHOTOS)[number]) => {
    const from = countryName(p.from, locale);
    return {
      from,
      to: countryName(DEST, locale),
      // "United Kingdom to Indonesia. A courier scans ..."
      spoken: `${from} ${t("testimonial.routeTo")}. ${t(`expat.pickups.${p.alt}`)}`,
      described: t(`expat.pickups.${p.alt}`),
    };
  };
}

// flat flags, no keyline and no rounding: printed on the label, not set
// into it like an app icon. On the open print the label is ink, the hero
// board's tile, so a flag with a white field (Indonesia, Japan) keeps it
const FLAT = "rounded-none ring-0";

function Route({ code, from, to }: { code: string; from: string; to: string }) {
  return (
    <>
      <Flag code={code} size={12} className={FLAT} />
      {from}
      <ArrowRight aria-hidden className="size-3 shrink-0" />
      <Flag code={DEST} size={12} className={FLAT} />
      {to}
    </>
  );
}

/* ---- the phone strip ----------------------------------------------------- */

/** where each print snaps to: its distance from the first, which sits on
 *  the scroll padding at 0 */
function snapLefts(el: HTMLElement) {
  const slides = Array.from(el.children) as HTMLElement[];
  const first = slides[0]?.offsetLeft ?? 0;
  const max = el.scrollWidth - el.clientWidth;
  return slides.map((s) => Math.min(max, Math.max(0, s.offsetLeft - first)));
}

/**
 * Below sm six slices have no room, so a phone gets the house strip: one
 * print and a peek, each captioned, with the position row under it
 * (DESIGN.md, Card grid → scroll strip).
 */
function PickupStrip({ className }: { className?: string }) {
  const t = useT();
  const route = useRoute();
  const list = React.useRef<HTMLUListElement>(null);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const el = list.current;
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
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const el = list.current;
    if (!el) return;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: snapLefts(el)[i], behavior: instant ? "auto" : "smooth" });
  };

  return (
    <div className={className}>
      <ul
        ref={list}
        tabIndex={0}
        aria-labelledby="pickups-heading"
        className="scroll-strip relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40"
      >
        {PHOTOS.map((p) => {
          const r = route(p);
          return (
            <li key={p.src} className="w-[78%] shrink-0 snap-start">
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-background">
                  <Image src={p.src} alt={r.described} fill sizes="78vw" draggable={false} className="object-cover" />
                </div>
                <figcaption className="mt-3 flex items-center gap-1.5 text-sm font-medium">
                  <Route code={p.from} from={r.from} to={r.to} />
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex justify-center">
        {PHOTOS.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={t("expat.photos.position").replace("{n}", String(i + 1)).replace("{total}", String(N))}
            aria-current={i === active}
            className="grid h-11 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          >
            <span
              className={cn("size-1.5 rounded-full transition-colors", i === active ? "bg-foreground" : "bg-border-strong")}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- the slices ---------------------------------------------------------- */

/**
 * Real pickups for Rimkirim customers, all six in one row: one print open to
 * its full 4:5, the others slivers of themselves sharing what is left.
 * Resting the mouse on a sliver opens it, and so does a click, a tap or
 * Enter; the open print wears its route as a label (globals.css, the
 * pickup slices). A phone gets the strip.
 */
export function PickupPhotos({ className }: { className?: string }) {
  const t = useT();
  const route = useRoute();
  const [open, setOpen] = React.useState(0);
  const [instant, setInstant] = React.useState(false);
  const intent = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(intent.current), []);

  return (
    <div className={className}>
      <h3 id="pickups-heading" className="font-display text-xs font-medium uppercase tracking-[0.04em] text-muted">
        {t("expat.pickups.label")}
      </h3>
      <ul
        aria-labelledby="pickups-heading"
        data-instant={instant || undefined}
        className="pickup-slices mt-5 hidden sm:flex"
      >
        {PHOTOS.map((p, i) => {
          const r = route(p);
          return (
            <li
              key={p.src}
              data-open={i === open || undefined}
              className="pickup-slice relative overflow-hidden rounded-md bg-background outline-offset-2 outline-foreground/60 has-[:focus-visible]:outline-2"
            >
              <button
                type="button"
                aria-pressed={i === open}
                aria-label={r.spoken}
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
                  // a keyboard press opens without motion (PRODUCT.md)
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
                className="pickup-slice-label pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-foreground px-3 py-2 text-xs font-medium leading-none text-background"
              >
                <Route code={p.from} from={r.from} to={r.to} />
              </p>
            </li>
          );
        })}
      </ul>
      <PickupStrip className="mt-5 sm:hidden" />
    </div>
  );
}
