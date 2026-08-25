import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-medium",
  {
    variants: {
      variant: {
        // brand is a solid marker, not a tint: a 15% lime wash is invisible on
        // daylight, and lime can never be the text colour.
        brand: "bg-brand-soft text-brand-ink border border-transparent",
        neutral: "bg-surface-3 text-muted border border-border",
        // status tints carry the hue; the words stay ink so 12px text clears AA
        // (status colour on a 15% tint measured 2.7–3.9:1), the icon keeps the hue
        success: "bg-success/15 text-foreground border border-success/25 [&_svg]:text-success",
        warning: "bg-warning/15 text-foreground border border-warning/25 [&_svg]:text-warning",
        info: "bg-info/15 text-foreground border border-info/25 [&_svg]:text-info",
        danger: "bg-danger/15 text-foreground border border-danger/25 [&_svg]:text-danger",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
