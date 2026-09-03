import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  // chips are tone, not line: a pill nobody can press carries no outline
  // (The Stroke Rule). py-[0.3125rem] keeps the 24px stature the old 1px
  // border used to make up.
  "inline-flex items-center gap-1.5 rounded-full px-3 py-[0.3125rem] font-display text-xs font-medium",
  {
    variants: {
      variant: {
        // brand is a solid marker, not a tint: a 15% lime wash is invisible on
        // daylight, and lime can never be the text colour.
        brand: "bg-brand-soft text-brand-ink",
        // a translucent grey rather than surface-3 so the chip still reads on
        // the Panel 2 canvas of the field, not only on a white card
        neutral: "bg-foreground/10 text-muted",
        // status tints carry the hue in the words too — via the *-ink tokens
        // (accent darkened to clear AA on the tint; raw accents measure
        // 2.7–3.8:1 at 12px), so chips speak the same language as the
        // richColors toasts. The icon keeps the full-strength hue.
        success: "bg-success/15 text-success-ink [&_svg]:text-success",
        warning: "bg-warning/15 text-warning-ink [&_svg]:text-warning",
        info: "bg-info/15 text-info-ink [&_svg]:text-info",
        danger: "bg-danger/15 text-danger-ink [&_svg]:text-danger",
        // "your move": the state is waiting on the customer, not on ops
        // (The Whose-Move Rule)
        accent: "bg-accent/15 text-accent-ink [&_svg]:text-accent",
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
