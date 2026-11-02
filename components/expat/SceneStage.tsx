"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The stage for a section's illustration: it builds its scene once, piece
 * by piece, when it is 40% in view, then stands still. Not a loop and not a
 * player (the page's one loop is the hero's departure board, and the one
 * player is the journey). The pieces are the journey's (`.jr-*` entrances,
 * each with its start in --d) and so is the ground, a soft wash in the
 * chapter's hues under a fine grain (on the closing ticket the ticket
 * itself is the ground), so every illustration on the page is
 * one figure language (globals.css, "The journey"; DESIGN.md, Motion,
 * "The section scenes").
 *
 * The scene's em is a share of the stage's width (`sceneClassName` sets
 * it), so a scene scales as one picture; a scene switches to its compact
 * layout on a container query. Decorative: the section's own words carry
 * the meaning, so the stage is hidden from assistive tech. Under reduced
 * motion, and without script, it stands built.
 */
export function SceneStage({
  ground = "day",
  tone,
  buildWith,
  delay = 0,
  glint = false,
  className,
  sceneClassName,
  children,
}: {
  /** day: the chapter's wash, on the desk or a band; none: the surface it
   *  sits on is its ground (the closing ticket) */
  ground?: "day" | "none";
  /** a chapter for a stage outside one (the closing ticket has none) */
  tone?: "sky" | "violet" | "magenta";
  /** build when this ancestor (a `closest()` selector) comes into view,
   *  not the stage itself: a set of stages builds as one, and a slide
   *  peeking from a scroll strip is already built */
  buildWith?: string;
  /** ms added to every piece's start, to stagger a set */
  delay?: number;
  /** answer a mouse as x.ai's product cards do: the scene leans in and one
   *  glint of light crosses the card (globals.css, .scene-glint) */
  glint?: boolean;
  className?: string;
  sceneClassName?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [built, setBuilt] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // from here the pieces wait out of sight until the scene builds
    el.dataset.sceneReady = "";
    const target = (buildWith && el.closest(buildWith)) || el;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.4) {
          setBuilt(true);
          io.disconnect();
        }
      },
      { threshold: [0, 0.4] },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [buildWith]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-tone={tone}
      style={delay ? ({ "--d0": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn(
        "@container relative isolate overflow-hidden",
        ground === "day" && "rounded-lg bg-(--tone-wash)",
        glint && "scene-glint",
        className,
      )}
    >
      {ground === "day" && (
        <>
          <div className="scene-day absolute inset-0" />
          <div className="jr-grain absolute inset-0" />
        </>
      )}
      <div className={cn("jr-scene absolute inset-0", sceneClassName)} data-built={built ? "" : undefined}>
        {children}
      </div>
      {glint && <div className="scene-glint-band absolute inset-0" />}
    </div>
  );
}
