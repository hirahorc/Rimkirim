"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils/cn";

export const SegmentedRoot = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex w-full items-stretch gap-1 rounded-lg border border-border bg-surface-2 p-1",
      className,
    )}
    {...props}
  />
));
SegmentedRoot.displayName = "SegmentedRoot";

export const SegmentedItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "tap-row flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
      "text-muted hover:text-foreground",
      // the selected segment lifts off the track instead of filling with lime:
      // on daylight a full lime pill is far too much area for a mere state
      "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:font-semibold data-[state=on]:shadow-float",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
      className,
    )}
    {...props}
  />
));
SegmentedItem.displayName = "SegmentedItem";
