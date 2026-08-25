# 003 — Give every button press feedback

- **Status**: TODO
- **Commit**: 7747f34
- **Severity**: MEDIUM
- **Category**: Physicality (pressable elements with no press feedback)
- **Estimated scope**: 3 files (2 components + 1 doc line), ~4 lines

## Problem

No element in the app has an `:active` state (verified by grep across
`components/` and `app/` — the only `active:` utilities are two `group-active`
*color* shifts in `Hero.tsx`). Between mousedown and the button's effect, nothing
acknowledges the press — buttons read as inert images.

```tsx
/* components/ui/button.tsx:10 — current cva base (one string, wrapped here) */
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
 font-display text-sm font-medium transition-all focus-visible:outline-none
 focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2
 focus-visible:ring-offset-background disabled:pointer-events-none
 disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0"
```

```tsx
/* components/ui/icon-pill-button.tsx:19 — current (no press state either) */
"tap-target relative grid size-9 place-items-center rounded-full border
 border-border bg-surface-2 text-muted transition-colors hover:text-foreground
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
```

Frequency tier is tens-of-presses/day, so only near-imperceptible motion is
allowed: `scale(0.98)`, ≤160ms, ease-out — per the audit catalog ("Press feedback:
`transform: scale(0.97)` on `:active` with `transition: transform 160ms ease-out`.
Keep it subtle (0.95–0.98)"). 0.98 is chosen here — this is a crisp operational
UI, not a playful one.

## Target

Every `Button` variant and the `IconPillButton` scale to 0.98 while pressed,
gated on `motion-safe`. Under reduced motion the press falls back to the existing
hover/press color idiom (no geometry).

```tsx
/* button.tsx target — add ONE utility to the cva base string */
"… font-medium transition-all motion-safe:active:scale-[0.98] focus-visible:outline-none …"
```

```tsx
/* icon-pill-button.tsx target — transition-colors widens to transition so the
   transform eases too; add the same press utility */
"tap-target relative grid size-9 place-items-center rounded-full border
 border-border bg-surface-2 text-muted transition motion-safe:active:scale-[0.98]
 hover:text-foreground focus-visible:outline-none focus-visible:ring-2
 focus-visible:ring-foreground/50"
```

Timing comes free from Tailwind's defaults already in place: `transition-all` /
`transition` use duration 150ms and easing `cubic-bezier(0.4, 0, 0.2, 1)` — the
system easing (same curve as `components/ui/disclosure.tsx:19`), inside the
100–160ms press budget. Do not add explicit `duration-*` classes.

## Repo conventions to follow

- Central cva base strings are the single point of change for buttons — exactly how
  the `font-display` brand-type change was applied (see `button.tsx:10`,
  `badge.tsx`). Never add press utilities to individual call sites.
- The `motion-safe:`/`motion-reduce:` split with a color fallback is the house
  pattern: see `TestimonialSection.tsx` rating-link arrow
  (`motion-safe:transition-transform motion-safe:group-hover:-translate-y-px …
  motion-reduce:transition-colors motion-reduce:group-hover:text-foreground`).
- DESIGN.md is normative; deliberate motion exceptions are written down at the point
  of doctrine (DESIGN.md → Motion).

## Steps

1. `components/ui/button.tsx:10` — in the cva base string, insert
   `motion-safe:active:scale-[0.98]` immediately after `transition-all`.
2. `components/ui/icon-pill-button.tsx:19` — replace `transition-colors` with
   `transition` and insert `motion-safe:active:scale-[0.98]` after it.
3. `DESIGN.md` → Motion section: the doctrine currently reads "Hover moves colour,
   not geometry." Directly after the hover paragraph (which ends "…so the affordance
   survives with animation off.", around DESIGN.md:373), add this sentence as its own
   short paragraph:

   > **Press is the second sanctioned geometry channel.** Every button scales to
   > 0.98 while held (`motion-safe:active:scale-[0.98]`, 150ms on the system
   > easing) — feedback for a press the user is already making, never decoration.
   > Under reduced motion the press answers in colour only.

   Do NOT edit `.impeccable/design.json` — report that the sidecar is now stale so
   the owner can run `/impeccable document`.

## Boundaries

- Do NOT add press feedback to links, nav items, tabs, segmented controls, cards, or
  any non-button pressable — this plan covers `button.tsx` and
  `icon-pill-button.tsx` only.
- Do NOT change any variant/size strings, colors, or focus rings.
- Do NOT add `duration-*`/`ease-*` utilities — the defaults are the spec.
- If the cva base string differs from the excerpt above (drift since commit
  7747f34), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` → clean. `npm run build` → succeeds.
- **Feel check** (dev server):
  - Hold the mouse down on the landing "Cek Harga" button: it settles to a subtle
    0.98 press-in; release: it eases back. It must read as *felt*, not *seen* — if
    the eye is drawn to the motion, the scale is too big (report, don't tweak).
  - Press a ghost icon button (e.g. CopyButton) and an icon pill: same behavior.
  - Keyboard-activate a button (Space held down): the `:active` scale applies too —
    acceptable and consistent; confirm nothing jumps.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: pressing produces no
    scale; hover/press colors still respond.
- **Done when**: every Button variant and IconPillButton compresses to 0.98 on
  press under motion-safe, DESIGN.md carries the doctrine line, and `tsc`/build
  pass.
