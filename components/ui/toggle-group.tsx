"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils/cn";
import { useSegmentedIndicator } from "./use-segmented-indicator";

export const SegmentedRoot = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const indicatorRef = useSegmentedIndicator<HTMLDivElement>('[data-state="on"]');
  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      indicatorRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, indicatorRef],
  );
  return (
    <ToggleGroupPrimitive.Root
      ref={setRefs}
      className={cn(
        // full-pill track: a pill item inside a pill track stays concentric at
        // any height (item radius = track radius - padding), so the two never
        // read as mismatched the way rounded-lg track + rounded-md item did.
        "relative inline-flex w-full items-stretch gap-1 rounded-full border border-border bg-surface-2 p-1",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-background shadow-float motion-safe:transition-[transform,width] motion-safe:duration-200"
        style={{
          width: "var(--seg-w, 0px)",
          transform: "translateX(var(--seg-x, 0px))",
        }}
      />
      {children}
    </ToggleGroupPrimitive.Root>
  );
});
SegmentedRoot.displayName = "SegmentedRoot";

export const SegmentedItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      // `relative` so the item is positioned and paints above the absolutely-
      // positioned indicator pill (positioned elements always beat static ones)
      "tap-row relative flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all",
      "text-muted hover:text-foreground",
      // the selected segment lifts off the track instead of filling with lime:
      // on daylight a full lime pill is far too much area for a mere state
      "data-[state=on]:text-foreground data-[state=on]:font-semibold",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
      className,
    )}
    {...props}
  />
));
SegmentedItem.displayName = "SegmentedItem";
