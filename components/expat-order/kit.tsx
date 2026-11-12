"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp, CircleAlert, Info, type LucideIcon } from "lucide-react";
import { CollapseHeight } from "@/components/ui/disclosure";
import { cn } from "@/lib/utils/cn";

/**
 * What every screen of the expat order flow is set in and built from
 * (DESIGN.md, The expat order flow), so nothing in the flow picks a size, a
 * gap or a colour of its own.
 *
 * Type: five sizes, each on a 4px line, one job each (TYPE, below).
 *
 * Space: seven steps, as Tailwind's 1, 2, 3, 4, 6, 8 and 12.
 *   4   inside a pair: a label and its field, a title and its line
 *   8   between like things: one choice and the next, an icon and its word
 *   12  inside a control; from a group's title to the group; rows of a list
 *   16  between fields; a card's padding and the page's gutter on a phone
 *   24  between groups in a card; a card's padding and the gutter from sm
 *   32  between the sections of a card; from the page's title to the page
 *   48  between the regions of a page; the plan's two columns
 *
 * Colour: five tokens (globals.css, [data-flow]). Paper `bg-background`,
 * wash `bg-surface-2` and `border-border`, ink `text-foreground`, muted
 * `text-muted`, lime `bg-brand`. And a sixth for one thing: red
 * `text-danger` and `border-danger`, for what's wrong (Well, Wrong).
 */
export const TYPE = {
  /** 24/32: the page's one h1 */
  title: "font-display text-2xl font-bold tracking-tight",
  /** 20/28: a part of the plan, a card in the main column */
  heading: "font-display text-xl font-semibold tracking-tight",
  /** 16/24: a question, a group, a package, a card beside the main column */
  subhead: "font-display text-base font-semibold tracking-tight",
  /** 14/20: answers, values and prose; medium for the one that leads */
  body: "text-sm",
  /** 12/16: a field's label (medium, ink), a hint or a note (muted) */
  caption: "text-xs",
  /** the one number a card is about: a price, the booking number */
  figure: "font-mono text-2xl font-semibold tracking-tight tabular-nums",
} as const;

/** a line that opens or folds something answers the press at once, in wash
 *  over its whole width (under its words: the wash is solid), and lets go
 *  over 150ms */
export const PRESS =
  "relative isolate after:absolute after:-inset-x-2 after:inset-y-0 after:-z-10 after:rounded-sm after:transition-colors active:after:bg-surface-2 active:after:duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50";

/** a button that isn't the page's action, on the app's secondary variant:
 *  paper with an Ink line, since a wash fill here is a field's */
export const QUIET = "border-foreground bg-background hover:bg-surface-2";

/**
 * A typed field: a wash well with what it wears inside it (an icon, a unit,
 * a currency) in a row, so nothing is laid over the input and padded around.
 * Its edge turns ink in hand and red in error, and stays red while what's
 * wrong is being put right. `className` is the input's.
 */
export const Well = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { before?: React.ReactNode; after?: React.ReactNode }
>(({ before, after, className, ...props }, ref) => (
  <div
    // a press on what it wears lands in the field
    onClick={(e) => {
      if (!(e.target as HTMLElement).closest("input, button")) e.currentTarget.querySelector("input")?.focus();
    }}
    className={cn(
      "flex h-11 w-full min-w-0 cursor-text items-center gap-2 rounded-md border border-border bg-surface-2 px-3 transition-colors",
      "focus-within:border-foreground focus-within:ring-2 focus-within:ring-foreground/40",
      "has-[input[aria-invalid=true]]:border-danger! has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
    )}
  >
    {before}
    <input
      ref={ref}
      className={cn(
        // 16px under a finger: iOS zooms the page into any field set smaller
        "h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed pointer-coarse:text-base",
        className,
      )}
      {...props}
    />
    {after}
  </div>
));
Well.displayName = "Well";

/** what a well wears: its unit, its currency */
export function Worn({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="shrink-0 text-xs text-muted">
      {children}
    </span>
  );
}

/** what's wrong, where it is: red, the one thing in the flow that is, and
 *  medium with a mark, so it isn't said in colour alone */
export function Wrong({ id, className, children }: { id?: string; className?: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className={cn("mt-1 flex gap-1 text-xs font-medium text-danger", className)}>
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      {children}
    </p>
  );
}

/**
 * A field in the flow: its label, the control, then its hint or what's
 * wrong, wired as the app's Field is (the label points at the control, the
 * control is described by its hint and its error). `quiet` keeps the label
 * for a screen reader only, where the field wears what it is.
 */
export function Field({
  label,
  quiet = false,
  hint,
  error,
  children,
}: {
  label: React.ReactNode;
  quiet?: boolean;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
      })
    : children;
  return (
    // positioned, so a quiet label stays inside a part that's folded (left
    // to the page, it would be laid out where the fold hides it, and the
    // page would scroll on past its foot)
    <div className="relative">
      <label htmlFor={id} className={cn("mb-1 block text-xs font-medium", quiet && "sr-only")}>
        {label}
      </label>
      {child}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      <Wrong id={errorId}>{error}</Wrong>
    </div>
  );
}

/** something the customer is told, not asked: fenced by a hairline, with
 *  its mark. Never filled (wash is a field's), and never an error */
export function Note({
  icon: Icon = Info,
  title,
  className,
  children,
}: {
  icon?: LucideIcon;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" className={cn("flex gap-2 rounded-md border border-border px-4 py-3 text-sm", className)}>
      {/* the line's height, so the mark sits on the first line */}
      <span className="flex h-5 shrink-0 items-center">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/** a mark on a card: ink for what it's offered as (a Special Rate), wash
 *  for the state it's in (Selected) */
export function Chip({
  tone = "ink",
  className,
  children,
}: {
  tone?: "ink" | "wash";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-medium [&_svg]:size-3.5",
        tone === "ink" ? "bg-foreground text-background" : "bg-surface-2 text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** nothing left to ask: an ink check, said to a screen reader in `label` */
export function Done({ label, className }: { label?: string; className?: string }) {
  return (
    <>
      <Check aria-hidden className={cn("size-4 shrink-0", className)} strokeWidth={3} />
      {label && <span className="sr-only">{label}</span>}
    </>
  );
}

/** a line that folds what's under it: its words, the swapped chevron, and
 *  the disclosure's height motion */
export function Fold({
  id,
  title,
  className,
  children,
}: {
  id: string;
  title: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(PRESS, "flex w-full items-center justify-between gap-4 rounded-sm py-4 text-left text-sm font-medium")}
      >
        {title}
        {/* swap, never rotate: the shared disclosure idiom */}
        {open ? <ChevronUp aria-hidden className="size-4 shrink-0" /> : <ChevronDown aria-hidden className="size-4 shrink-0" />}
      </button>
      <CollapseHeight open={open} id={id}>
        <div className="pb-4">{children}</div>
      </CollapseHeight>
    </div>
  );
}
