# 002 — Bring PriceBreakdown onto the system disclosure idiom

- **Status**: TODO
- **Commit**: 7747f34
- **Severity**: MEDIUM
- **Category**: Cohesion (drift from the named disclosure idiom)
- **Estimated scope**: 1 file, ~15 lines

## Problem

`components/rates/PriceBreakdown.tsx` (the "Rincian harga" expander on each rate card
at /cek-tarif) is a collapsible that deviates from the app's single accordion idiom
(DESIGN.md → Motion → "The disclosure open") on three counts:

1. The panel mounts/unmounts instantly — the card's height **snaps** while the
   content fades up inside it (`animate-fade-up`), and closing has no motion at all.
2. The idiom says *height is the only animated property — no fade, no slide*.
3. The idiom says *the chevron is swapped down↔up, never rotated* — here it rotates.

```tsx
/* components/rates/PriceBreakdown.tsx:30-35 — current */
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="animate-fade-up space-y-2 px-5 pb-4 text-sm">
```

## Target

The breakdown collapses/expands via `CollapseHeight` (height-only, computed duration,
easing `cubic-bezier(0.4, 0, 0.2, 1)`, `auto` when settled, instant under reduced
motion, `inert` while closed), and the chevron swaps between `ChevronDown` and
`ChevronUp` on the click — not after the motion, and never via `rotate-180`.

```tsx
/* target — trigger row */
        {open ? (
          <ChevronUp className="size-4" aria-hidden />
        ) : (
          <ChevronDown className="size-4" aria-hidden />
        )}
      </button>
      <CollapseHeight open={open} className="space-y-2 px-5 pb-4 text-sm">
        …existing children, unchanged…
      </CollapseHeight>
```

`animate-fade-up` is removed. The `className` that carried spacing moves onto
`CollapseHeight`'s `className` prop (it applies to the inner content div, so padding
is measured into the animated height — this is how `Disclosure` itself does it).

## Repo conventions to follow

- `CollapseHeight` lives in `components/ui/disclosure.tsx`:
  `import { CollapseHeight } from "@/components/ui/disclosure";`
- Chevron-swap exemplar: `components/ui/disclosure.tsx:242` —
  `const Chevron = open ? ChevronUp : ChevronDown;` and the swap happens in the same
  state update as the click (`disclosure.tsx:178`, "the chevron swaps immediately,
  not after the motion").
- Mounted-collapsible exemplar: `components/shared/forms/PackagesEditor.tsx:397`
  (`<CollapseHeight open={open}>` around an always-mounted body).

## Steps

1. `components/rates/PriceBreakdown.tsx` — update imports: add `ChevronUp` to the
   `lucide-react` import and add
   `import { CollapseHeight } from "@/components/ui/disclosure";`. Remove the now
   unused `cn` import **only if** nothing else in the file still uses it (the `Row`
   component at line 74 does use `cn` — so keep it).
2. Replace the rotating chevron (lines 30-32) with the swap shown in Target. Do not
   keep `transition-transform` or `rotate-180`.
3. Add `aria-expanded={open}` to the trigger `<button>` (line 22-26) — the visual
   state change now has a semantic mirror, matching native `<details>` semantics the
   idiom is modeled on.
4. Replace the conditional block `{open && (<div className="animate-fade-up space-y-2
   px-5 pb-4 text-sm"> … </div>)}` (lines 34-58) with
   `<CollapseHeight open={open} className="space-y-2 px-5 pb-4 text-sm"> … </CollapseHeight>`.
   Children stay byte-identical.

## Boundaries

- Do NOT touch `components/ui/disclosure.tsx`, `RateCard.tsx`, or any pricing logic.
- Do NOT alter the breakdown's rows, labels, currency formatting, or the `Row`
  helper.
- Do NOT add new dependencies, keyframes, or tokens.
- If the code at the cited lines doesn't match (drift since commit 7747f34), STOP and
  report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` → clean. `npm run build` → succeeds.
- **Feel check** (dev server → fill the calculator in Advance mode → /cek-tarif →
  any rate card → "Rincian harga"):
  - Opening *grows* the card smoothly; nothing fades or slides — height only.
  - Closing animates too (previously it snapped shut).
  - The chevron flips down↔up at the instant of the click, before the motion ends.
  - Click rapidly: the panel retargets mid-flight, never sticks at half height.
  - With the panel closed, Tab through the card: focus never enters the hidden
    breakdown (`inert`).
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: open/close is instant.
- **Done when**: open and close both animate height on the system easing, the chevron
  swaps instead of rotating, and `tsc`/build pass.
