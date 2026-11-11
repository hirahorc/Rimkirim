"use client";

import * as React from "react";

/** a piece's place in a section's reveal, 70ms apart (globals.css, .jr-reveal) */
export const revealOrder = (i: number) => ({ "--i": i }) as React.CSSProperties;

/**
 * The reader is already on this section as the page comes up: they followed
 * a link to something in it (the order flow's "packing guide" opens
 * #packing in a new tab), or the page came back scrolled to it or past it
 * (a reload, the back button). The server painted it standing, so hiding it
 * to reveal it again would make them wait for what they came to read.
 */
export function alreadyThere(root: HTMLElement) {
  const id = window.location.hash.slice(1);
  const target = id ? document.getElementById(id) : null;
  return (target !== null && root.contains(target)) || root.getBoundingClientRect().top < window.innerHeight * 0.7;
}

/**
 * Reveal a section once, as the journey ("How shipping with Rimkirim works")
 * does: each `.jr-reveal` piece in it rises 1rem into place on a 70ms
 * stagger, in its `revealOrder`. It reveals when its top is 30% up the
 * viewport rather than when 30% of it shows, since a tall band would leave
 * its head on screen and unseen. Until script runs, and under reduced
 * motion, everything simply stands; so does a section the reader is on
 * already when the page comes up (`alreadyThere`), marked "instant".
 */
export function useSectionReveal<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (alreadyThere(root)) {
      root.dataset.revealed = "instant";
      return;
    }
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
