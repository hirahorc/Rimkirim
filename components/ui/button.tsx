"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-display text-sm font-medium transition-all motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // disabled brand goes grey, not washed lime: a half-lime pill reads
        // "almost", a Panel fill reads "not yet" — and its label stays AA
        brand:
          "bg-brand text-brand-ink font-semibold hover:bg-brand-dim disabled:bg-surface-3 disabled:text-muted",
        secondary:
          "bg-surface-2 text-foreground border border-border-strong hover:bg-surface-3 disabled:opacity-50",
        ghost:
          "text-muted hover:text-foreground hover:bg-surface-2 disabled:opacity-50",
        // the "add something that isn't here yet" affordance: add package,
        // add document, upload a file
        dashed:
          "border border-dashed border-border-strong bg-transparent font-normal text-muted hover:text-foreground disabled:opacity-50",
        danger:
          "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 disabled:opacity-50",
      },
      size: {
        // the small sizes step the radius down to `sm` (12px): at h-8 and
        // below, the base `md` (16px) is ≥ half the height and silently
        // clamps into a pill (The Clamp Rule)
        sm: "h-8 rounded-sm px-3 text-xs",
        // md and icon grow to 44px on touch (Coarse-Pointer rule) without
        // changing their desktop stature
        md: "h-10 px-4 pointer-coarse:h-11",
        lg: "h-12 px-6 text-base",
        icon: "size-10 pointer-coarse:size-11",
        "icon-sm": "size-9 rounded-sm",
        "icon-xs": "size-7 rounded-sm [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * The one official "working on it" state: spinner in front of the label,
   * aria-busy, and the button is disabled so it can't be double-fired.
   * Ignored for asChild (Slot needs exactly one child).
   */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {asChild || !loading ? (
          children
        ) : (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
