"use client";

import * as React from "react";

/**
 * Same-page anchors travel (globals.css, html[data-landed]); arriving on a
 * page doesn't. A link that opens a page at a #fragment (the expat order
 * flow's "packing guide", a shared FAQ question) should land on it at once,
 * and with smooth scrolling already on, the browser travels there from the
 * top instead, past everything in between. So smooth scrolling only
 * switches on once the page has loaded and made that first jump. Renders
 * nothing.
 */
export function ScrollLanding() {
  React.useEffect(() => {
    let frame = 0;
    // a frame after load, so the browser's own jump to the fragment, and
    // any question the FAQ opens for it, have happened first
    const land = () => {
      frame = requestAnimationFrame(() => {
        document.documentElement.dataset.landed = "";
      });
    };
    if (document.readyState === "complete") land();
    else window.addEventListener("load", land, { once: true });
    return () => {
      window.removeEventListener("load", land);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
