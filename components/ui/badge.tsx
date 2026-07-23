import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        brand: "bg-brand/15 text-brand border border-brand/25",
        neutral: "bg-surface-3 text-muted border border-border",
        success: "bg-success/15 text-success border border-success/25",
        warning: "bg-warning/15 text-warning border border-warning/25",
        info: "bg-info/15 text-info border border-info/25",
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
