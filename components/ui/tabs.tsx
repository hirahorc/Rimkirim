"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";

export const Tabs = TabsPrimitive.Root;

/** `pill` (default): segmented pill control. `underline`: equal-width text
 *  triggers over a full-bleed rule — the active one darkens its own segment of
 *  that rule to ink. Give the list the horizontal padding: its border spans the
 *  padding box (full-bleed) while the triggers split the content box. */
type TabsVariant = "pill" | "underline";

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
  }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      variant === "underline"
        ? "flex w-full items-stretch border-b-2 border-border/60"
        : "inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant;
  }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "text-sm font-medium transition-all hover:text-foreground focus-visible:outline-none",
      variant === "underline"
        ? "-mb-0.5 flex-1 rounded-none border-b-2 border-transparent px-2 py-2 text-center text-muted-2 focus-visible:ring-0 data-[state=active]:border-foreground data-[state=active]:text-foreground"
        : "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-muted focus-visible:ring-2 focus-visible:ring-foreground/50 data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-float",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-none data-[state=inactive]:hidden",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
