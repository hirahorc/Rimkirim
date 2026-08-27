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
        // status tints carry the hue in the words too — via the *-ink tokens
        // (accent darkened to clear AA on the tint; raw accents measure
        // 2.7–3.8:1 at 12px), so chips speak the same language as the
        // richColors toasts. The icon keeps the full-strength hue.
        success: "bg-success/15 text-success-ink border border-success/25 [&_svg]:text-success",
        warning: "bg-warning/15 text-warning-ink border border-warning/25 [&_svg]:text-warning",
        info: "bg-info/15 text-info-ink border border-info/25 [&_svg]:text-info",
        danger: "bg-danger/15 text-danger-ink border border-danger/25 [&_svg]:text-danger",
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
