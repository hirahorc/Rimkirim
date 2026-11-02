"use client";

import * as React from "react";

/** each line's strip sits a little askew, never two the same way */
const TILT = [-1.4, 0.9, -0.6];
/** how long one strip takes to pull across, and the gap before the next (ms) */
const PULL_MS = 460;
const PULL_STEP_MS = 170;
const RM = "(prefers-reduced-motion: reduce)";

interface Line {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The expat hero's marked phrase, taped on instead of highlighted: one strip
 * of lime packing tape behind each line the phrase wraps to, serrated at both
 * ends where it was torn off the roll, each a degree or so askew while the
 * words stay level, pulled across left to right as the words land, one line
 * after the other. The tape is what seals every box this page is about, and
 * it is not the home page's highlighter (DESIGN.md, Marked text).
 *
 * Lines are measured, not guessed: the phrase's line boxes (its client
 * rects) are read whenever the headline resizes, so a strip follows any wrap
 * the copy or the viewport makes. The strips sit behind the words in the
 * headline, which must be `relative`. The pull is timed on the words' own
 * clock (it starts from their animations' start), so it lands with them
 * however late the page hydrates; under reduced motion the tape is simply on.
 */
export function TapeMark({ children, start }: { children: React.ReactNode; /** seconds, on the words' clock */ start: number }) {
  const textRef = React.useRef<HTMLSpanElement>(null);
  const layerRef = React.useRef<HTMLSpanElement>(null);
  const [lines, setLines] = React.useState<Line[]>([]);
  const pulled = React.useRef(false);

  React.useEffect(() => {
    const text = textRef.current;
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!text || !layer || !host) return;
    const measure = () => {
      const base = layer.getBoundingClientRect();
      setLines(
        [...text.getClientRects()]
          .filter((r) => r.width > 1)
          .map((r) => ({ x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height })),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // pull the strips across once, the first time they are laid
  React.useEffect(() => {
    const text = textRef.current;
    const layer = layerRef.current;
    if (pulled.current || !lines.length || !text || !layer) return;
    pulled.current = true;
    if (window.matchMedia(RM).matches) return;
    const clock = text.querySelector(".hero-word")?.getAnimations()[0]?.startTime;
    layer.querySelectorAll<HTMLElement>(".tape-strip").forEach((strip, i) => {
      const pull = strip.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], {
        duration: PULL_MS,
        delay: start * 1000 + i * PULL_STEP_MS,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "backwards",
      });
      if (clock != null) pull.startTime = clock;
    });
  }, [lines, start]);

  return (
    <>
      <span ref={layerRef} aria-hidden className="pointer-events-none absolute inset-0">
        {lines.map((l, i) => (
          <span
            key={i}
            className="tape-strip"
            style={{
              left: `calc(${l.x}px - 0.2em)`,
              // a line's box is taller than its line (the font's full
              // ascent and descent), so each strip is trimmed to leave a
              // sliver of page between one line's tape and the next
              top: `calc(${l.y}px + 0.12em)`,
              width: `calc(${l.w}px + 0.4em)`,
              height: `calc(${l.h}px - 0.2em)`,
              rotate: `${TILT[i % TILT.length]}deg`,
            }}
          />
        ))}
      </span>
      <span ref={textRef} className="tape-text">
        {children}
      </span>
    </>
  );
}
