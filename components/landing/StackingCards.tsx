import type { LucideIcon } from "lucide-react";

export interface StackingCard {
  icon: LucideIcon;
  title: string;
  body: string;
}

/**
 * Pure-CSS "stacking cards on scroll" (mobile only). Every card is
 * `position: sticky; top: 0` at the same height and z-index, so as the page
 * scrolls each card pins to the top and the next one rises up and covers it —
 * no JS, no scroll library. DOM order alone decides the stacking order, so a
 * card that comes later in the list paints over the one before it. The
 * covering only works because each skin below is fully opaque.
 *
 * The parent must not sit inside any `overflow: hidden/auto` ancestor between
 * here and the viewport, or the browser drops the sticky behaviour.
 */

/** Opaque skins, one per card. Alternating light → dark → lime → dark keeps
 *  each hand-off legible. Lime is a fill behind dark ink only (never text). */
export const STACK_SKINS = [
  "bg-surface-3 text-foreground",
  "bg-foreground text-background",
  "bg-surface-3 text-foreground",
  "bg-brand-ink text-background",
];

/**
 * The one card whose title wears the lime highlighter. Lime is the section's
 * single beat, and it lands as a mark behind ink — never as the card's surface,
 * which on a phone meant a full 100vh of Live Lime (DESIGN.md, One-Voice Rule:
 * "Don't fill a large area … the accent is a mark, not a surface").
 */
export const STACK_MARK_INDEX = 2;

export function StackingCards({ items }: { items: StackingCard[] }) {
  return (
    // full-bleed on mobile; hidden from sm up where the grid takes over.
    // flex-col + gap-0 so cards touch directly in document flow.
    <div className="-mx-4 flex flex-col sm:hidden">
      {items.map(({ title, body }, i) => (
        <article
          key={title}
          className={`sticky top-0 z-[1] flex h-[100svh] w-full flex-col justify-start overflow-hidden px-7 pt-28 ${
            STACK_SKINS[i % STACK_SKINS.length]
          }`}
        >
          <div className="mx-auto w-full max-w-md">
            <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight">
              <span className={i === STACK_MARK_INDEX ? "card-mark" : undefined}>
                {title}
              </span>
            </h3>
            <p className="mt-3 text-base leading-relaxed opacity-80">{body}</p>
          </div>
          {/* oversized ghost index, purely decorative depth cue */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -right-3 font-display text-[9rem] font-bold leading-none opacity-[0.07]"
          >
            {i + 1}
          </span>
        </article>
      ))}
    </div>
  );
}
