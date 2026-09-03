import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * A strip attached to a card's edge — the head says why you are looking at
 * this card, the foot says what to do next (The Attached-Strip Rule). It
 * bleeds through the card's padding so the tint runs corner to corner and
 * shares the card's radius; the card keeps one silhouette instead of a
 * second box stacked on top.
 *
 * `inset` must name the host card's padding: `md` for the live panels
 * (p-5 sm:p-6), `sm` for the compact status card (p-4 sm:p-5), `xs` for the
 * list cards (p-4 at every width).
 */
export type StripTone = "action" | "hold" | "positive" | "danger" | "neutral";

// tint at 10%, no outline (The Stroke Rule); the glyph keeps the raw hue and
// the words wear the ink (The Tint-15 Rule). Move Purple is the exception:
// the Figma revamp sets its words in the raw hue (6.8:1 on the tint, AA).
const TONE: Record<StripTone, { fill: string; hue: string; ink: string; hover: string }> = {
  action: { fill: "bg-accent/10", hue: "text-accent", ink: "text-accent", hover: "hover:bg-accent/15" },
  hold: { fill: "bg-warning/10", hue: "text-warning", ink: "text-warning-ink", hover: "hover:bg-warning/15" },
  positive: { fill: "bg-success/10", hue: "text-success", ink: "text-success-ink", hover: "hover:bg-success/15" },
  danger: { fill: "bg-danger/10", hue: "text-danger", ink: "text-danger-ink", hover: "hover:bg-danger/15" },
  neutral: { fill: "bg-surface-2", hue: "text-muted-2", ink: "text-foreground", hover: "hover:bg-surface-3" },
};

// the bleed has to be spelled out per inset so Tailwind can see the classes.
// the strip carries no outer margin on its card side: the shoulder (below) is
// the card's padding there.
const BLEED = {
  md: {
    x: "-mx-5 sm:-mx-6",
    pad: "px-5 sm:px-6",
    top: "-mt-5 rounded-t-md sm:-mt-6",
    bottom: "-mb-5 rounded-b-md sm:-mb-6",
  },
  sm: {
    x: "-mx-4 sm:-mx-5",
    pad: "px-4 sm:px-5",
    top: "-mt-4 rounded-t-md sm:-mt-5",
    bottom: "-mb-4 rounded-b-md sm:-mb-5",
  },
  xs: {
    x: "-mx-4",
    pad: "px-4",
    top: "-mt-4 rounded-t-md",
    bottom: "-mb-4 rounded-b-md",
  },
} as const;

// the card's white plane curves back over the strip: a 16px shoulder in the
// card surface, rounded on the strip's side, so the tint shows in the corner
// curves and the card reads as one sheet laid on the strip rather than two
// stacked boxes. It is also the card's padding on that side.
const SHOULDER = {
  top: "h-4 rounded-t-md",
  bottom: "h-4 rounded-b-md",
} as const;
const SHOULDER_SURFACE = "bg-[var(--card-surface,var(--surface))]";

// the strip's own vertical padding: 14px on the outer edge, 9px on the card
// side where the shoulder curve adds the rest of the visual air
const PAD = {
  top: "pt-3.5 pb-[9px]",
  bottom: "pt-[9px] pb-3.5",
} as const;

export interface CardStripProps extends React.HTMLAttributes<HTMLElement> {
  edge?: "top" | "bottom";
  tone?: StripTone;
  inset?: keyof typeof BLEED;
  /** solid glyph, sized 20px and coloured in the raw hue */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** renders as a link: the whole strip is the target, hover deepens the tint */
  href?: string;
  /** classes for the content row (the tint wrapper takes `className`) */
  rowClassName?: string;
}

export function CardStrip({
  edge = "top",
  tone = "action",
  inset = "md",
  icon: Icon,
  href,
  className,
  rowClassName,
  children,
  ...props
}: CardStripProps) {
  const t = TONE[tone];
  const b = BLEED[inset];
  // the tint lives on the wrapper so the shoulder can sit on it; a linked
  // strip deepens the whole tint on hover, shoulder included, so the surface
  // never splits into two shades
  const wrapper = cn(
    "flex flex-col",
    t.fill,
    b.x,
    b[edge],
    href && cn("transition-colors", t.hover),
    className,
  );
  const rowClasses = cn(
    "flex items-start gap-3 text-sm",
    b.pad,
    PAD[edge],
    href &&
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/50",
    rowClassName,
  );
  const shoulder = <div aria-hidden className={cn(SHOULDER[edge], SHOULDER_SURFACE)} />;
  const body = (
    <>
      {Icon && <Icon aria-hidden className={cn("mt-px size-5 shrink-0", t.hue)} />}
      <div className="min-w-0 flex-1">{children}</div>
    </>
  );
  const row = href ? (
    <a href={href} className={rowClasses} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {body}
    </a>
  ) : (
    <div className={rowClasses} {...props}>
      {body}
    </div>
  );
  return (
    <div className={wrapper} data-tone={tone}>
      {edge === "bottom" && shoulder}
      {row}
      {edge === "top" && shoulder}
    </div>
  );
}

/** the strip's ink class for a tone, for callers setting their own heading */
export function stripInk(tone: StripTone) {
  return TONE[tone].ink;
}
