"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { HelpCircle } from "lucide-react";
import { useT } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils/cn";

/** House defaults: short first-hover delay, and inside the 300ms skip window
 *  subsequent tooltips open instantly (globals also drops their animation —
 *  a second tooltip in a sweep should appear with no ceremony). */
export function TooltipProvider(
  props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>,
) {
  return <TooltipPrimitive.Provider delayDuration={150} skipDelayDuration={300} {...props} />;
}
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Ink bubble with a small arrow, above the trigger by default; radix flips or
 * shifts it away from the viewport edge. Enter/exit motion lives in globals
 * (.tip-bubble[data-state=…]) keyed off radix's data-state.
 */
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, side = "top", sideOffset = 8, collisionPadding = 8, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "tip-bubble z-50 w-max max-w-[16rem] rounded-[6px] bg-foreground px-3.5 py-2.5 text-center text-sm leading-normal text-background shadow-tip",
        className,
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow width={8} height={4} className="fill-foreground" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

/**
 * A help (?) icon that explains `content` on hover, keyboard focus, or tap.
 * `label` names the thing being explained for assistive tech ("Info: Volumetric").
 */
export function InfoTip({ content, label }: { content: React.ReactNode; label?: string }) {
  const t = useT();
  // controlled so a tap (no hover on touch) can toggle it too; the tap's own
  // trailing pointer/focus events would close it again, so ignore closes for a
  // moment after a tap-open
  const [open, setOpen] = React.useState(false);
  const tapAt = React.useRef(0);
  // what a tap should do is decided at pointer-down, before radix's own
  // focus/click handlers churn the state during the same gesture
  const wasOpenAtDown = React.useRef(false);
  const onOpenChange = (v: boolean) => {
    if (!v && Date.now() - tapAt.current < 400) return;
    setOpen(v);
  };
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onPointerDown={() => {
            wasOpenAtDown.current = open;
          }}
          onClick={(e) => {
            // radix closes on click; preventDefault keeps our toggle in charge
            e.preventDefault();
            const next = !wasOpenAtDown.current;
            if (next) tapAt.current = Date.now();
            setOpen(next);
          }}
          className={cn(
            // quiet, not faint: 70% keeps the glyph above the 3:1 non-text floor
            "relative inline-grid size-[1.125rem] shrink-0 cursor-help place-items-center rounded-full text-muted-2 opacity-70 transition-[opacity,color] duration-200",
            "hover:text-muted hover:opacity-100 focus-visible:text-muted focus-visible:opacity-100",
            "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent",
            // 28px hit target on mouse, 44px on touch, without growing the visual
            "after:absolute after:-inset-[5px] after:rounded-full pointer-coarse:after:-inset-[13px]",
          )}
          aria-label={
            label ? t("common.infoAbout").replace("{label}", label) : t("common.moreInfo")
          }
        >
          <HelpCircle className="size-[1.125rem]" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
}
