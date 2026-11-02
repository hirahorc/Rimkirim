"use client";

import * as React from "react";

/** a piece's place in a section's reveal, 70ms apart (globals.css, .jr-reveal) */
export const revealOrder = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * Reveal a section once, as the journey ("How shipping with Rimkirim works")
 * does: each `.jr-reveal` piece in it rises 1rem into place on a 70ms
 * stagger, in its `revealOrder`. It reveals when its top is 30% up the
 * viewport rather than when 30% of it shows, since a tall band would leave
 * its head on screen and unseen. Until script runs, and under reduced
 * motion, everything simply stands.
 */
export function useSectionReveal<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.dataset.revealReady = "";
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          root.dataset.revealed = "";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);
  return ref;
}
