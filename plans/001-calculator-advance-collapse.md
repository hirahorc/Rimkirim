# 001 — Collapse the calculator's Advance block instead of teleporting it

- **Status**: TODO
- **Commit**: 7747f34
- **Severity**: MEDIUM
- **Category**: Missed opportunity / physicality (jarring state change)
- **Estimated scope**: 1 file, ~10 lines

## Problem

On the landing-page calculator (the highest-traffic surface in the product), toggling
Base ↔ Advance mounts/unmounts the entire package-editor section instantly. The card
jumps by hundreds of pixels with no bridge. On open there is a content fade
(`animate-fade-up`) but the *height* still snaps; on close there is nothing at all.

```tsx
/* components/landing/ShipmentCalculator.tsx:287-289 — current */
        {/* Advance-only: packages */}
        {mode === "advance" && (
          <div className="relative animate-fade-up border-t border-border p-5 sm:p-6">
```

(The block closes at the matching `)}` right before the submit-row `<div>` — it wraps
the "Detail Paket" heading, the surcharge note, the `PackageRow` list, the packages
error, and the "add package" dashed Button.)

The repo already names the one sanctioned motion for exactly this situation:
DESIGN.md → Motion → "The disclosure open" — the `CollapseHeight` component animates
height only, with a duration computed from content height, and marks the closed
region `inert`.

## Target

The Advance block stays mounted and is wrapped in `CollapseHeight`, driven by
`open={mode === "advance"}`. Exact motion (all provided by the component — do not
re-implement): height-only transition, duration = Material `getAutoHeightDuration`
(≈200ms for short content, ≈330ms for tall), easing `cubic-bezier(0.4, 0, 0.2, 1)`,
height lands on `auto` when settled, instant under `prefers-reduced-motion`, closed
region `inert` and `visibility: hidden`.

```tsx
/* target */
        {/* Advance-only: packages — stays mounted; CollapseHeight animates the
            reveal (DESIGN.md, "The disclosure open") and marks the closed
            region inert so hidden fields can't be tabbed into */}
        <CollapseHeight open={mode === "advance"}>
          <div className="relative border-t border-border p-5 sm:p-6">
```

Note: `animate-fade-up` is removed — height is the only animated property in this
idiom (no fade, no slide).

## Repo conventions to follow

- `CollapseHeight` lives in `components/ui/disclosure.tsx` (exported alongside
  `Disclosure`). Import: `import { CollapseHeight } from "@/components/ui/disclosure";`
- Exemplar to imitate: `components/shared/forms/PackagesEditor.tsx:394-397` — a Card
  body that stays mounted and collapses:

  ```tsx
      {/* body stays mounted and collapses with the shared disclosure motion
          (DESIGN.md, "The disclosure open"); CollapseHeight marks the closed
          region inert, so hidden inputs can't be tabbed into */}
      <CollapseHeight open={open}>
  ```

- Another exemplar: `components/tracking/QuotationCard.tsx:132`.

## Steps

1. `components/landing/ShipmentCalculator.tsx` — add `CollapseHeight` to the existing
   import from `@/components/ui/disclosure` if one exists, otherwise add
   `import { CollapseHeight } from "@/components/ui/disclosure";` with the other
   `@/components/ui/*` imports.
2. Replace the conditional render at line 288: change
   `{mode === "advance" && (` → `<CollapseHeight open={mode === "advance"}>` and the
   block's closing `)}` → `</CollapseHeight>`. Keep the inner `<div>` and all its
   children byte-identical **except** remove the `animate-fade-up` class:
   `className="relative border-t border-border p-5 sm:p-6"`.
3. Leave the "ensure Advance mode has at least one package row" effect
   (`ShipmentCalculator.tsx:129-133`) untouched. On the very first switch to Advance
   the row is appended one commit after the panel starts opening; `CollapseHeight`
   settles to `height: auto` afterwards, so the late row is absorbed. Verify this in
   the feel check rather than restructuring the effect.

## Boundaries

- Do NOT touch `components/ui/disclosure.tsx`, `PackagesEditor.tsx`, or any form
  logic (react-hook-form registration, zod schema, the append effect).
- Do NOT change any markup inside the Advance block other than the wrapper described.
- Do NOT add new dependencies or new keyframes/tokens.
- If line numbers or code excerpts don't match (drift since commit 7747f34), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` → exits clean. `npm run build` → succeeds.
- **Feel check** (dev server, landing page calculator):
  - Toggle Base → Advance: the card *grows* to reveal the package editor; nothing
    fades or slides sideways; the border-t divider rides the reveal.
  - Toggle Advance → Base: the section closes with motion (previously it vanished).
  - Spam the toggle rapidly: the panel retargets from wherever it is — it must never
    stick at half height or jump to full (interrupted-animation tokens in
    `CollapseHeight` handle this; confirm by eye).
  - First-ever switch to Advance (clear localStorage key `rimkirim:calc` first): the
    auto-appended package row must be fully visible once the motion settles.
  - In Base mode, press Tab repeatedly through the form: focus must never land inside
    the hidden package editor (`inert`).
  - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: toggling is
    instant, no motion, content still appears/disappears correctly.
- **Done when**: both directions animate height smoothly, rapid toggling never
  breaks, reduced motion is instant, and `tsc`/build pass.
