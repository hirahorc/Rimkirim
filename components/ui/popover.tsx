"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 6, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        // min-w (not w) floored at the trigger width so the panel is never
        // narrower than its trigger but can still grow for long options. The
        // explicit var() is required — Tailwind v4 dropped the bare `[--foo]`
        // shorthand, so `w-[--radix-popover-trigger-width]` compiled to the
        // invalid `width: --radix-popover-trigger-width` and was ignored.
        // md panel + sm item rows: with p-1 the inner radius (16 − 4 = 12)
        // matches `sm` exactly, so panel and row corners stay concentric —
        // the old lg panel could never be concentric with md rows
        "pop-panel z-50 min-w-[var(--radix-popover-trigger-width)] rounded-md border border-border-strong bg-surface-2 p-1 text-foreground shadow-overlay outline-none",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";
