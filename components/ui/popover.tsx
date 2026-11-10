"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Drawer } from "vaul";
import { useIsMobile } from "@/components/ui/dialog";
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

/* A picker: a long list to choose one row from (a country, a dial code, a
   currency), with its search on top. From `sm` up it is the popover under
   its field. Below `sm` that panel shows seven rows of two hundred and sits
   where the keyboard comes up, so it becomes the bottom sheet every dialog
   is there (dialog.tsx; DESIGN.md, Motion, "The mobile sheet"): the list
   fills it, each row a full 44px. One API, so a call site never chooses. */

const PickerCtx = React.createContext(false);

export function Picker(props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
  const mobile = useIsMobile();
  return (
    <PickerCtx.Provider value={mobile}>
      {mobile ? <Drawer.Root {...props} /> : <PopoverPrimitive.Root {...props} />}
    </PickerCtx.Provider>
  );
}

export const PickerTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  const Trigger = React.useContext(PickerCtx) ? Drawer.Trigger : PopoverPrimitive.Trigger;
  return <Trigger ref={ref} {...props} />;
});
PickerTrigger.displayName = "PickerTrigger";

export const PickerContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    /** what's being picked: the sheet's name for assistive tech */
    title: string;
  }
>(({ title, className, children, ...props }, ref) => {
  const mobile = React.useContext(PickerCtx);

  if (!mobile) {
    return (
      <PopoverContent ref={ref} className={className} {...props}>
        {children}
      </PopoverContent>
    );
  }

  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm" />
      <Drawer.Content
        ref={ref}
        aria-modal="true"
        aria-describedby={undefined}
        // the list shows first: focus on the search would raise the keyboard
        // over it before a row has been seen
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-lg border-t border-border-strong bg-surface pb-[env(safe-area-inset-bottom)] text-foreground shadow-overlay outline-none",
          // the list takes the sheet's height, whatever the keyboard leaves of it
          "[&_[cmdk-root]]:flex [&_[cmdk-root]]:min-h-0 [&_[cmdk-root]]:flex-1 [&_[cmdk-root]]:flex-col",
          "[&_[cmdk-list]]:max-h-none [&_[cmdk-list]]:min-h-0 [&_[cmdk-list]]:flex-1 [&_[cmdk-list]]:overscroll-contain [&_[cmdk-item]]:min-h-11",
        )}
      >
        <div aria-hidden className="mx-auto mb-1 mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border-strong" />
        <Drawer.Title className="sr-only">{title}</Drawer.Title>
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
});
PickerContent.displayName = "PickerContent";
