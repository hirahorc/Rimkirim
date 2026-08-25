"use client";

import * as React from "react";

/**
 * Positions a segmented track's sliding indicator: measures the active item
 * (Radix: [data-state="on"] in toggle groups, [data-state="active"] in tabs)
 * and mirrors its box onto CSS vars on the track (--seg-x, --seg-w). The
 * first measure runs in a layout effect, before paint, so mount never
 * animates; state flips re-measure via MutationObserver and size changes via
 * ResizeObserver. With no active item the width collapses to 0 (hidden).
 */
export function useSegmentedIndicator<T extends HTMLElement>(
  activeSelector: string,
) {
  const ref = React.useRef<T>(null);

  React.useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const measure = () => {
      const active = root.querySelector<HTMLElement>(activeSelector);
      if (!active) {
        root.style.setProperty("--seg-w", "0px");
        return;
      }
      root.style.setProperty("--seg-x", `${active.offsetLeft}px`);
      root.style.setProperty("--seg-w", `${active.offsetWidth}px`);
    };
    measure();
    const mo = new MutationObserver(measure);
    mo.observe(root, { subtree: true, attributeFilter: ["data-state"] });
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    for (const child of Array.from(root.children)) ro.observe(child);
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [activeSelector]);

  return ref;
}
