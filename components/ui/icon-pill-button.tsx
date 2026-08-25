"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The round icon button that lives in the app header (menu, account,
 * notifications). One skin, written once: size-9 pill on surface-2 with a
 * quiet icon that inks up on hover, and a real focus ring.
 */
export const IconPillButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "tap-target relative grid size-9 place-items-center rounded-full border border-border bg-surface-2 text-muted transition motion-safe:active:scale-[0.98] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
      className,
    )}
    {...props}
  />
));
IconPillButton.displayName = "IconPillButton";
