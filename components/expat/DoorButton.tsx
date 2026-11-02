"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/** how far the arrow steps, in its 24-unit box */
const STRIDE = 4;
/** quick both ways: stepping on, then stepping back, each in two phases */
const IN_MS = 300;
const OUT_MS = 240;
/** a strong ease-out for every phase, so each move starts at speed */
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const RM = "(prefers-reduced-motion: reduce)";

/** the arrow's state: where its shaft's tail and tip are, and its head's shift */
interface Pose {
  tail: number;
  tip: number;
  head: number;
}
/** the shaft path starts at 3, so its dash shows tail to tip */
const dash = (p: Pose) => ({ strokeDasharray: `${p.tip - p.tail} 40`, strokeDashoffset: `${3 - p.tail}` });
const shift = (p: Pose) => ({ transform: `translateX(${p.head}px)` });

/**
 * The expat hero's "Get a quote", the page's one door. The button is the
 * house lime and steps to Live Lime Dim under a mouse like any other; only
 * its arrow answers, taking one step forward the way an inchworm walks: the
 * head moves on first, so the shaft stretches, then the tail catches up and
 * the arrow stands 4 units on. Leaving, it steps back, tail first. Quick
 * and snappy both ways (300ms on, 240ms back, a strong ease-out in every
 * phase), and each move starts from wherever the arrow is, so a pointer that
 * leaves mid-step turns it round without a jump (DESIGN.md, Motion, "The
 * door's arrow"). At rest the arrow is lucide's, the one every other
 * button wears. Fine pointers only; on touch, from the keyboard and under
 * reduced motion it stays still.
 */
export function DoorButton({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const shaftRef = React.useRef<SVGPathElement>(null);
  const headRef = React.useRef<SVGPathElement>(null);
  const running = React.useRef<Animation[]>([]);

  /** where the arrow is right now, mid-step or at rest */
  const pose = (shaft: SVGPathElement, head: SVGPathElement): Pose => {
    const cs = getComputedStyle(shaft);
    const tail = 3 - parseFloat(cs.strokeDashoffset);
    const m = getComputedStyle(head).transform.match(/matrix\(([^)]+)\)/);
    return { tail, tip: tail + parseFloat(cs.strokeDasharray), head: m ? parseFloat(m[1].split(",")[4]) : 0 };
  };

  const go = (dir: 1 | -1) => {
    const shaft = shaftRef.current;
    const head = headRef.current;
    if (!shaft || !head || window.matchMedia(RM).matches) return;
    const from = pose(shaft, head);
    for (const a of running.current) a.cancel();
    // on: the head and tip go first, then the tail; back: the tail first,
    // then the head and tip (rest: 5 to 19; stepped: 9 to 23, head +4)
    const mid: Pose = dir === 1 ? { tail: from.tail, tip: 19 + STRIDE, head: STRIDE } : { tail: 5, tip: from.tip, head: from.head };
    const to: Pose = dir === 1 ? { tail: 5 + STRIDE, tip: 19 + STRIDE, head: STRIDE } : { tail: 5, tip: 19, head: 0 };
    const timing = { duration: dir === 1 ? IN_MS : OUT_MS, fill: "forwards" as const };
    const split = dir === 1 ? 0.4 : 0.45;
    running.current = [
      shaft.animate(
        [
          { ...dash(from), easing: EASE },
          { ...dash(mid), offset: split, easing: EASE },
          dash(to),
        ],
        timing,
      ),
      head.animate(
        [
          { ...shift(from), easing: EASE },
          { ...shift(mid), offset: split, easing: EASE },
          shift(to),
        ],
        timing,
      ),
    ];
  };

  return (
    <Button asChild size="lg" className={cn("door", className)} style={style}>
      <a
        href={href}
        onPointerEnter={(e) => e.pointerType === "mouse" && go(1)}
        onPointerLeave={(e) => e.pointerType === "mouse" && go(-1)}
      >
        {children}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {/* the shaft runs from 3 to the stepped tip at 23; at rest its
              dash shows only lucide's 5 to 19 (globals.css, .door-shaft) */}
          <path ref={shaftRef} className="door-shaft" d="M3 12h20" />
          <path ref={headRef} d="m12 5 7 7-7 7" />
        </svg>
      </a>
    </Button>
  );
}
